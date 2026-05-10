# Integración Groq API — Módulo de Generación de Menú

Este documento contiene todo el código necesario para implementar la generación de menús con **Groq** en el backend (FastAPI + Python). Tu compañero puede copiar estos archivos y montarlos directamente.

---

## 1. Resumen de la API de Groq

- **Endpoint:** `POST https://api.groq.com/openai/v1/chat/completions`
- **Auth:** Header `Authorization: Bearer <GROQ_API_KEY>`
- **Modelo recomendado:** `llama-3.3-70b-versatile`
- **Formato de respuesta JSON:** Se usa `response_format: { "type": "json_object" }` para forzar que el modelo devuelva JSON válido.
- **Documentación oficial:** https://console.groq.com/docs/api-reference#chat-create

---

## 2. Variables de entorno necesarias

Crear un archivo `.env` en la raíz del proyecto backend:

```env
# ===== Groq =====
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXX
GROQ_MODEL=llama-3.3-70b-versatile

# ===== Firebase =====
FIREBASE_PROJECT_ID=comedor-conectado
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

# ===== Server =====
PORT=8000
```

> ⚠️ **NUNCA subir el `.env` al repositorio.** Crear un `.env.example` sin valores reales.

---

## 3. Dependencias (requirements.txt)

```txt
fastapi==0.115.0
uvicorn==0.30.0
python-dotenv==1.0.1
httpx==0.27.0
firebase-admin==6.5.0
pydantic==2.8.0
```

Instalar con:
```bash
pip install -r requirements.txt
```

---

## 4. Estructura de archivos del backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Punto de entrada FastAPI
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py            # Variables de entorno
│   │   └── firebase.py            # Inicialización de Firebase
│   ├── models/
│   │   ├── __init__.py
│   │   └── menu.py                # Schemas Pydantic
│   ├── services/
│   │   ├── __init__.py
│   │   ├── groq_service.py        # Lógica de llamada a Groq
│   │   ├── inventario_service.py  # Leer ingredientes de Firestore
│   │   └── menu_service.py        # Guardar/leer menús de Firestore
│   └── routes/
│       ├── __init__.py
│       └── menu.py                # Endpoints REST del menú
├── .env
├── .env.example
├── requirements.txt
└── Dockerfile
```

---

## 5. Código fuente completo

### 5.1 `app/config/settings.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
PORT = int(os.getenv("PORT", "8000"))
```

---

### 5.2 `app/config/firebase.py`

```python
import firebase_admin
from firebase_admin import credentials, firestore
from app.config.settings import FIREBASE_CREDENTIALS_PATH

# Inicializar Firebase una sola vez
cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)

# Cliente de Firestore reutilizable
db = firestore.client()
```

---

### 5.3 `app/models/menu.py` — Schemas Pydantic

Estos schemas definen la estructura de datos que el frontend envía y recibe.

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class GenerarMenuRequest(BaseModel):
    """Lo que el frontend envía al endpoint POST /api/v1/menu/generar"""
    raciones: int = Field(..., ge=1, le=1000, description="Número de raciones a preparar")


class MenuGenerado(BaseModel):
    """Estructura del menú que devuelve Groq (y que se guarda en Firestore)"""
    entrada: str
    plato_principal: str
    bebida: str
    ingredientes_usados: List[str]
    preparacion_resumen: Optional[str] = None
    recomendaciones: List[str] = []
    alertas: List[str] = []


class MenuResponse(BaseModel):
    """Respuesta completa que el backend devuelve al frontend"""
    id: str
    fecha_generacion: str
    raciones_estimadas: int
    entrada: str
    plato_principal: str
    bebida: str
    ingredientes_usados: List[str]
    recomendaciones: List[str]
    alertas: List[str] = []


class MenuHistorialItem(BaseModel):
    """Un item del historial de menús"""
    id: str
    fecha_generacion: str
    raciones_estimadas: int
    entrada: str
    plato_principal: str
    bebida: str
    ingredientes_usados: List[str]
```

---

### 5.4 `app/services/inventario_service.py` — Leer ingredientes de Firestore

```python
from app.config.firebase import db


def obtener_ingredientes_disponibles() -> list[dict]:
    """
    Lee los ingredientes con estado='disponible' de la colección 'inventario' en Firestore.
    Retorna una lista de diccionarios con nombre, cantidad y unidad.
    """
    docs = db.collection("inventario").where("estado", "==", "disponible").stream()
    
    ingredientes = []
    for doc in docs:
        data = doc.to_dict()
        ingredientes.append({
            "nombre": data.get("nombre", ""),
            "cantidad": data.get("cantidad", 0),
            "unidad": data.get("unidad", "und"),
        })
    
    return ingredientes
```

---

### 5.5 `app/services/groq_service.py` — Llamada a Groq API

Este es el archivo más importante. Construye el prompt y llama a la API de Groq.

```python
import httpx
import json
from app.config.settings import GROQ_API_KEY, GROQ_MODEL

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def construir_prompt(ingredientes: list[dict], raciones: int) -> str:
    """Arma el prompt que se le envía al modelo."""
    lista = "\n".join(
        [f"- {i['nombre']}: {i['cantidad']} {i['unidad']}" for i in ingredientes]
    )
    return f"""Actúa como un nutricionista social especializado en comedores populares de Lima, Perú.
Debes generar un menú económico, nutritivo y realista usando solo o principalmente los ingredientes disponibles.

Cantidad de raciones: {raciones}
Ingredientes disponibles:
{lista}

Devuelve la respuesta ÚNICAMENTE en JSON con esta estructura exacta (sin texto adicional):
{{
  "entrada": "nombre del plato de entrada",
  "plato_principal": "nombre del plato principal",
  "bebida": "nombre de la bebida",
  "ingredientes_usados": ["ingrediente1", "ingrediente2"],
  "preparacion_resumen": "breve descripción de cómo preparar los platos",
  "recomendaciones": ["recomendación 1", "recomendación 2"],
  "alertas": ["alerta si hay algo importante, o lista vacía"]
}}

Evita recetas costosas. Prioriza alimentos rendidores, nutritivos y culturalmente comunes en Perú."""


async def generar_menu_con_groq(ingredientes: list[dict], raciones: int) -> dict:
    """
    Llama a la API de Groq para generar un menú.
    Retorna un diccionario con la estructura del menú.
    """
    prompt = construir_prompt(ingredientes, raciones)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Eres un nutricionista experto en comedores populares. Siempre respondes en JSON válido."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "temperature": 0.7,
        "max_completion_tokens": 1024,
        "response_format": {
            "type": "json_object"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        print(f"[ERROR Groq] Status {response.status_code}: {response.text}")
        return _menu_fallback()

    data = response.json()

    try:
        content = data["choices"][0]["message"]["content"]
        menu = json.loads(content)
        return menu
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"[ERROR Groq] No se pudo parsear la respuesta: {e}")
        return _menu_fallback()


def _menu_fallback() -> dict:
    """Menú de respaldo en caso de que Groq falle o no responda."""
    return {
        "entrada": "Sopa de verduras",
        "plato_principal": "Arroz con menestra",
        "bebida": "Refresco natural de avena",
        "ingredientes_usados": ["arroz", "menestra", "verduras", "avena"],
        "preparacion_resumen": "Menú generado automáticamente como respaldo.",
        "recomendaciones": [
            "Usar primero los ingredientes más próximos a vencer",
            "Ajustar las porciones según la asistencia real"
        ],
        "alertas": ["Este menú fue generado sin IA debido a un error de conexión."]
    }
```

---

### 5.6 `app/services/menu_service.py` — Guardar y leer menús en Firestore

```python
from datetime import datetime
from app.config.firebase import db


def guardar_menu(menu: dict, raciones: int) -> str:
    """Guarda el menú generado en la colección 'menus' de Firestore. Retorna el ID."""
    doc_ref = db.collection("menus").document()
    
    doc_ref.set({
        "fecha_generacion": datetime.utcnow().isoformat(),
        "raciones_estimadas": raciones,
        "entrada": menu.get("entrada", ""),
        "plato_principal": menu.get("plato_principal", ""),
        "bebida": menu.get("bebida", ""),
        "ingredientes_usados": menu.get("ingredientes_usados", []),
        "preparacion_resumen": menu.get("preparacion_resumen", ""),
        "recomendaciones": menu.get("recomendaciones", []),
        "alertas": menu.get("alertas", []),
    })
    
    return doc_ref.id


def obtener_historial() -> list[dict]:
    """Retorna los últimos 20 menús ordenados por fecha."""
    docs = (
        db.collection("menus")
        .order_by("fecha_generacion", direction="DESCENDING")
        .limit(20)
        .stream()
    )
    
    historial = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        historial.append(data)
    
    return historial


def obtener_ultimo_menu() -> dict | None:
    """Retorna el último menú generado, o None si no hay."""
    docs = (
        db.collection("menus")
        .order_by("fecha_generacion", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    
    return None
```

---

### 5.7 `app/routes/menu.py` — Endpoints REST

```python
from fastapi import APIRouter, HTTPException
from app.models.menu import GenerarMenuRequest, MenuResponse
from app.services.groq_service import generar_menu_con_groq
from app.services.inventario_service import obtener_ingredientes_disponibles
from app.services.menu_service import guardar_menu, obtener_historial, obtener_ultimo_menu

router = APIRouter(prefix="/api/v1/menu", tags=["Menú IA"])


@router.post("/generar", response_model=MenuResponse)
async def generar_menu(body: GenerarMenuRequest):
    """
    Genera un menú con IA usando los ingredientes disponibles en inventario.
    1. Lee ingredientes disponibles de Firestore.
    2. Llama a Groq API con el prompt.
    3. Guarda el resultado en Firestore.
    4. Retorna el menú al frontend.
    """
    # 1. Obtener ingredientes disponibles
    ingredientes = obtener_ingredientes_disponibles()
    if not ingredientes:
        raise HTTPException(
            status_code=400,
            detail="No hay ingredientes disponibles en el inventario."
        )

    # 2. Llamar a Groq
    menu = await generar_menu_con_groq(ingredientes, body.raciones)

    # 3. Guardar en Firestore
    menu_id = guardar_menu(menu, body.raciones)

    # 4. Retornar respuesta
    from datetime import datetime
    return MenuResponse(
        id=menu_id,
        fecha_generacion=datetime.utcnow().isoformat(),
        raciones_estimadas=body.raciones,
        entrada=menu.get("entrada", ""),
        plato_principal=menu.get("plato_principal", ""),
        bebida=menu.get("bebida", ""),
        ingredientes_usados=menu.get("ingredientes_usados", []),
        recomendaciones=menu.get("recomendaciones", []),
        alertas=menu.get("alertas", []),
    )


@router.get("/historial")
async def historial_menus():
    """Retorna los últimos 20 menús generados."""
    return {"data": obtener_historial()}


@router.get("/ultimo")
async def ultimo_menu():
    """Retorna el último menú generado (para el Dashboard)."""
    menu = obtener_ultimo_menu()
    if not menu:
        raise HTTPException(status_code=404, detail="No se ha generado ningún menú aún.")
    return menu
```

---

### 5.8 `app/main.py` — Punto de entrada

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import menu as menu_routes
from app.config.settings import PORT

app = FastAPI(
    title="Comedor Conectado API",
    description="Backend MVP para gestión de comedores populares con IA",
    version="1.0.0",
)

# CORS — permitir que el frontend (Expo) se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir al dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(menu_routes.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Comedor Conectado API v1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

Para correr el servidor:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 6. Lo que el frontend actual espera (referencia)

El frontend (`app/(tabs)/menu.tsx`) actualmente usa datos hardcodeados. Cuando se conecte al backend, deberá hacer lo siguiente:

### 6.1 Generar menú — `POST /api/v1/menu/generar`

```typescript
// services/menu.service.ts
const API_URL = "https://TU-BACKEND-URL";

export async function generarMenu(raciones: number) {
  const response = await fetch(`${API_URL}/api/v1/menu/generar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raciones }),
  });
  if (!response.ok) throw new Error("Error generando menú");
  return response.json();
}
```

**Respuesta que recibirá el frontend:**
```json
{
  "id": "abc123",
  "fecha_generacion": "2026-05-10T19:30:00",
  "raciones_estimadas": 50,
  "entrada": "Sopa de verduras con fideos",
  "plato_principal": "Arroz con lentejas y ensalada",
  "bebida": "Refresco de avena con canela",
  "ingredientes_usados": ["Arroz", "Lentejas", "Fideos", "Verduras", "Avena"],
  "recomendaciones": ["Usar primero los vegetales perecibles"],
  "alertas": []
}
```

### 6.2 Historial — `GET /api/v1/menu/historial`

```typescript
export async function obtenerHistorial() {
  const response = await fetch(`${API_URL}/api/v1/menu/historial`);
  return response.json(); // { data: [...] }
}
```

### 6.3 Último menú (Dashboard) — `GET /api/v1/menu/ultimo`

```typescript
export async function obtenerUltimoMenu() {
  const response = await fetch(`${API_URL}/api/v1/menu/ultimo`);
  return response.json();
}
```

---

## 7. Dockerfile (para Cloud Run)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 8. Notas para tu compañero

1. **Obtener API Key de Groq:** Ir a https://console.groq.com/keys y crear una key gratuita.
2. **Firebase credentials:** Descargar el JSON de credenciales desde la consola de Firebase (Project Settings > Service Accounts > Generate new private key) y guardarlo como `firebase-credentials.json` en la raíz del backend.
3. **Colecciones necesarias en Firestore:** `inventario` (con docs que tengan campos `nombre`, `cantidad`, `unidad`, `estado`) y `menus` (se crea automáticamente al generar el primer menú).
4. **Probar localmente:** Correr `uvicorn app.main:app --reload` y visitar `http://localhost:8000/docs` para ver la documentación interactiva (Swagger UI).
5. **El modelo `llama-3.3-70b-versatile`** soporta `response_format: json_object`, lo cual garantiza que siempre devuelva JSON válido.
