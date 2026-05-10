# Especificación de Backend - Comedor Conectado MVP

Este documento define la estructura de datos, entidades, relaciones y endpoints (métodos) necesarios para construir el backend del MVP de "Comedor Conectado". La arquitectura está pensada para ser implementada con **FastAPI**, **Firebase/Firestore** y desplegada en **Google Cloud Platform (GCP)**.

## 1. Modelo de Datos (Entidades y Atributos)

### 1.1 Entidad: Voluntario
Representa a una persona que apoya en el comedor.
*   **Atributos:**
    *   `id` (String, UUID o Firebase Push ID): Identificador único.
    *   `nombre_completo` (String): Nombre del voluntario.
    *   `telefono` (String): Número de contacto.
    *   `disponibilidad` (List[String]): Días de la semana disponibles (ej. `["lunes", "miercoles"]`).
    *   `estado` (String): `"activo"` o `"inactivo"`.
    *   `fecha_registro` (Timestamp): Fecha de creación.

### 1.2 Entidad: Turno
Representa un bloque de horario asignado a uno o más voluntarios.
*   **Atributos:**
    *   `id` (String): Identificador único.
    *   `fecha` (Date/String formato 'YYYY-MM-DD'): Fecha del turno.
    *   `horario` (String): `"mañana"`, `"tarde"`, `"noche"`.
    *   `hora_inicio` (String formato 'HH:MM'): Hora de inicio.
    *   `hora_fin` (String formato 'HH:MM'): Hora de fin.
    *   `voluntarios_asignados` (List[String]): Lista de IDs de voluntarios asignados al turno.
    *   `estado` (String): `"programado"`, `"completado"`, `"cancelado"`.

### 1.3 Entidad: Asistencia
Detalle de la participación de un voluntario en un turno específico. En Firestore puede implementarse como una subcolección dentro de `Turno`.
*   **Atributos:**
    *   `id` (String): Identificador único (puede ser compuesto `turnoId_voluntarioId`).
    *   `turno_id` (String): Referencia al Turno.
    *   `voluntario_id` (String): Referencia al Voluntario.
    *   `estado_asistencia` (String): `"pendiente"`, `"asistio"`, `"no_asistio"`.
    *   `fecha_marcado` (Timestamp): Fecha y hora en que se registró la asistencia.

### 1.4 Entidad: Ingrediente (Inventario)
Insumos físicos disponibles en el comedor.
*   **Atributos:**
    *   `id` (String): Identificador único.
    *   `nombre` (String): Nombre del ingrediente.
    *   `cantidad` (Float): Cantidad numérica.
    *   `unidad` (String): `"kg"`, `"g"`, `"L"`, `"ml"`, `"und"`.
    *   `estado` (String): `"disponible"`, `"agotado"`.
    *   `fecha_actualizacion` (Timestamp): Última vez que se modificó el stock.

### 1.5 Entidad: MenuGenerado
Historial de menús sugeridos por la Inteligencia Artificial (Groq).
*   **Atributos:**
    *   `id` (String): Identificador único.
    *   `fecha_generacion` (Timestamp): Cuándo se solicitó a la IA.
    *   `raciones_estimadas` (Integer): Para cuántas personas se calculó el menú.
    *   `entrada` (String): Plato de entrada sugerido.
    *   `plato_principal` (String): Plato de fondo sugerido.
    *   `bebida` (String): Refresco sugerido.
    *   `ingredientes_usados` (List[String]): Ingredientes del inventario que la IA consideró.
    *   `recomendaciones` (List[String]): Consejos adicionales de preparación.

---

## 2. Relaciones Lógicas

*   **Voluntario <-> Turno (Muchos a Muchos):** Un voluntario asiste a varios turnos, y un turno requiere varios voluntarios. Se resuelve en Firestore mediante el arreglo `voluntarios_asignados` en la entidad **Turno** y los registros de la entidad **Asistencia**.
*   **MenuGenerado -> Ingrediente (Uno a Muchos implícita):** Un menú hace uso de un subconjunto de ingredientes del inventario actual. Se guarda como un array de strings en `ingredientes_usados` para tener un histórico estático (no depende si luego el ingrediente se elimina).

---

## 3. Endpoints de la API (Métodos y Respuestas)

### 3.1 Módulo: Voluntarios

#### `GET /api/v1/voluntarios`
*   **Propósito:** Lista todos los voluntarios registrados.
*   **Query Params:** `estado` (opcional, ej. `?estado=activo`).
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "data": [
        {
          "id": "v_123",
          "nombre_completo": "Juan Perez",
          "telefono": "987654321",
          "disponibilidad": ["lunes", "viernes"],
          "estado": "activo"
        }
      ],
      "total": 1
    }
    ```

#### `GET /api/v1/voluntarios/{id}`
*   **Propósito:** Detalle de un solo voluntario.
*   **Respuesta Exitosa (200 OK):** Objeto Voluntario.

#### `POST /api/v1/voluntarios`
*   **Propósito:** Crear nuevo voluntario.
*   **Cuerpo (Body):** Objeto Voluntario (sin `id`).
*   **Respuesta Exitosa (201 Created):** Objeto Voluntario creado (con `id`).

#### `PUT /api/v1/voluntarios/{id}`
*   **Propósito:** Modificar datos de un voluntario.
*   **Cuerpo (Body):** Campos a actualizar.
*   **Respuesta Exitosa (200 OK):** Objeto Voluntario actualizado.

#### `DELETE /api/v1/voluntarios/{id}`
*   **Propósito:** Eliminar un voluntario (soft-delete cambiando estado a inactivo).
*   **Respuesta Exitosa (200 OK):** `{"message": "Voluntario desactivado correctamente"}`.

### 3.2 Módulo: Turnos y Asistencia

#### `GET /api/v1/turnos`
*   **Propósito:** Lista los turnos programados.
*   **Query Params:** `fecha` (ej. `?fecha=2026-05-10`), `horario` (`mañana`, `tarde`, `noche`).
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "data": [
        {
          "id": "t_456",
          "fecha": "2026-05-10",
          "horario": "mañana",
          "hora_inicio": "08:00",
          "hora_fin": "12:00",
          "voluntarios_asignados": ["v_123", "v_124"],
          "estado": "programado"
        }
      ]
    }
    ```

#### `POST /api/v1/turnos`
*   **Propósito:** Crear un turno y asignar voluntarios.
*   **Respuesta Exitosa (201 Created):** Objeto Turno.

#### `GET /api/v1/turnos/{id}/asistencia`
*   **Propósito:** Obtener el estado de asistencia de los voluntarios de un turno.
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "turno_id": "t_456",
      "asistencias": [
        { "voluntario_id": "v_123", "estado_asistencia": "pendiente" },
        { "voluntario_id": "v_124", "estado_asistencia": "asistio" }
      ]
    }
    ```

#### `PATCH /api/v1/turnos/{id}/asistencia`
*   **Propósito:** Marcar la asistencia (asistió / no asistió).
*   **Cuerpo (Body):**
    ```json
    {
      "voluntario_id": "v_123",
      "estado_asistencia": "asistio"
    }
    ```
*   **Respuesta Exitosa (200 OK):** `{"message": "Asistencia registrada"}`.

### 3.3 Módulo: Inventario

#### `GET /api/v1/inventario`
*   **Propósito:** Listar ingredientes en almacén.
*   **Query Params:** `estado` (`disponible`, `agotado`).
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "data": [
        { "id": "i_789", "nombre": "Arroz", "cantidad": 25, "unidad": "kg", "estado": "disponible" }
      ]
    }
    ```

#### `POST /api/v1/inventario`
*   **Propósito:** Registrar un nuevo insumo.
*   **Respuesta Exitosa (201 Created):** Objeto Ingrediente.

#### `PUT /api/v1/inventario/{id}`
*   **Propósito:** Actualizar cantidad o marcar como agotado.
*   **Respuesta Exitosa (200 OK):** Objeto Ingrediente actualizado.

### 3.4 Módulo: Menú Inteligente (IA - Groq)

#### `POST /api/v1/menu/generar`
*   **Propósito:** Conectar con Groq API para obtener un menú sugerido en base al inventario.
*   **Cuerpo (Body):**
    ```json
    {
      "raciones": 50
    }
    ```
    *(Nota: El backend leerá internamente de Firebase qué ingredientes están disponibles para enviar en el prompt, simplificando el trabajo del frontend).*
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "id": "m_101",
      "entrada": "Sopa de verduras",
      "plato_principal": "Arroz con lentejas",
      "bebida": "Refresco de avena",
      "recomendaciones": ["Usar los vegetales más maduros primero"],
      "ingredientes_usados": ["Arroz", "Lentejas", "Verduras mixtas", "Avena"]
    }
    ```

#### `GET /api/v1/menu/historial`
*   **Propósito:** Recuperar menús pasados guardados en BD.
*   **Respuesta Exitosa (200 OK):** Lista de Menús Generados.

### 3.5 Módulo: Dashboard (Resumen)

#### `GET /api/v1/dashboard/resumen`
*   **Propósito:** Proveer todos los KPIs necesarios para la pantalla inicial (`V02`) en una sola petición.
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "voluntarios_activos": 12,
      "turnos_hoy": 2,
      "asistencias_hoy": { "confirmadas": 5, "pendientes": 1 },
      "ingredientes_disponibles": 30,
      "ultimo_menu": {
        "entrada": "Sopa...",
        "plato_principal": "Guiso...",
        "bebida": "Refresco..."
      }
    }
    ```

---

## 4. Arquitectura y Stack (GCP + FastAPI)

1.  **Framework Backend:** FastAPI (Python). Ideal por su tipado estricto (Pydantic), documentación automática (Swagger UI en `/docs`) y velocidad.
2.  **Base de Datos:** Firebase Firestore (NoSQL).
    *   Colecciones principales: `voluntarios`, `turnos`, `inventario`, `menus`.
    *   Subcolección recomendada: `asistencias` dentro de cada documento en `turnos`.
3.  **Seguridad / Autenticación:** 
    *   El frontend enviará un Token JWT de Firebase Auth en el header: `Authorization: Bearer <TOKEN>`.
    *   FastAPI utilizará el SDK de `firebase-admin` para validar el token antes de acceder a cualquier endpoint protegido.
4.  **Despliegue:** Google Cloud Run. El código de FastAPI se empaquetará en un contenedor Docker y se desplegará en Cloud Run, lo que permite escalado automático a 0 (costo amigable para el MVP).
5.  **LLM (Groq):** El servicio de generación de menú será una clase dentro de FastAPI (`GroqService`) que hará llamadas HTTP seguras a la API de Groq, usando una API KEY almacenada en el *Secret Manager* de GCP o variables de entorno.
