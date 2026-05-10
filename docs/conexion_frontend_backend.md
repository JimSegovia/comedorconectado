# Guía de Conexión Frontend ↔ Backend

Este documento detalla los cambios exactos que necesita el frontend (React Native / Expo) para dejar de usar datos hardcodeados y consumir la API REST del backend.

---

## 1. Crear el servicio base de API

### `frontend/services/api.ts`

```typescript
const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:8000"   // Android emulator → localhost del host
  : "https://TU-BACKEND-PRODUCCION.run.app";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  params?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail || `Error ${res.status}`);
  }

  return res.json();
}
```

> **Nota para Android físico:** Si pruebas en un celular real en la misma red WiFi, reemplaza `10.0.2.2` por la IP local de tu computadora (ej. `192.168.1.XX`).

---

## 2. Servicios por módulo

### 2.1 `frontend/services/voluntarios.service.ts`

```typescript
import { apiRequest } from "./api";

export interface Voluntario {
  id: string;
  nombre_completo: string;
  telefono: string;
  disponibilidad: string[];
  estado: "activo" | "inactivo";
}

export async function listarVoluntarios(estado?: string) {
  const params = estado ? { estado } : undefined;
  const res = await apiRequest<{ data: Voluntario[]; total: number }>(
    "/api/v1/voluntarios",
    { params }
  );
  return res.data;
}

export async function obtenerVoluntario(id: string) {
  return apiRequest<Voluntario>(`/api/v1/voluntarios/${id}`);
}

export async function crearVoluntario(data: Omit<Voluntario, "id">) {
  return apiRequest<Voluntario>("/api/v1/voluntarios", {
    method: "POST",
    body: data,
  });
}

export async function actualizarVoluntario(id: string, data: Partial<Voluntario>) {
  return apiRequest<Voluntario>(`/api/v1/voluntarios/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function eliminarVoluntario(id: string) {
  return apiRequest(`/api/v1/voluntarios/${id}`, { method: "DELETE" });
}
```

---

### 2.2 `frontend/services/turnos.service.ts`

```typescript
import { apiRequest } from "./api";

export interface Turno {
  id: string;
  fecha: string;
  horario: "mañana" | "tarde" | "noche";
  hora_inicio: string;
  hora_fin: string;
  voluntarios_asignados: string[];
  estado: "programado" | "completado" | "cancelado";
}

export interface Asistencia {
  voluntario_id: string;
  estado_asistencia: "pendiente" | "asistio" | "no_asistio";
}

export async function listarTurnos(fecha?: string, horario?: string) {
  const params: Record<string, string> = {};
  if (fecha) params.fecha = fecha;
  if (horario) params.horario = horario;
  const res = await apiRequest<{ data: Turno[] }>("/api/v1/turnos", { params });
  return res.data;
}

export async function crearTurno(data: Omit<Turno, "id">) {
  return apiRequest<Turno>("/api/v1/turnos", { method: "POST", body: data });
}

export async function obtenerAsistencia(turnoId: string) {
  return apiRequest<{ turno_id: string; asistencias: Asistencia[] }>(
    `/api/v1/turnos/${turnoId}/asistencia`
  );
}

export async function marcarAsistencia(
  turnoId: string,
  voluntarioId: string,
  estado: "asistio" | "no_asistio"
) {
  return apiRequest(`/api/v1/turnos/${turnoId}/asistencia`, {
    method: "PATCH",
    body: { voluntario_id: voluntarioId, estado_asistencia: estado },
  });
}
```

---

### 2.3 `frontend/services/inventario.service.ts`

```typescript
import { apiRequest } from "./api";

export interface Ingrediente {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: "kg" | "g" | "L" | "ml" | "und";
  estado: "disponible" | "agotado";
}

export async function listarInventario(estado?: string) {
  const params = estado ? { estado } : undefined;
  const res = await apiRequest<{ data: Ingrediente[] }>("/api/v1/inventario", { params });
  return res.data;
}

export async function crearIngrediente(data: Omit<Ingrediente, "id">) {
  return apiRequest<Ingrediente>("/api/v1/inventario", { method: "POST", body: data });
}

export async function actualizarIngrediente(id: string, data: Partial<Ingrediente>) {
  return apiRequest<Ingrediente>(`/api/v1/inventario/${id}`, { method: "PUT", body: data });
}
```

---

### 2.4 `frontend/services/menu.service.ts`

```typescript
import { apiRequest } from "./api";

export interface MenuGenerado {
  id: string;
  fecha_generacion: string;
  raciones_estimadas: number;
  entrada: string;
  plato_principal: string;
  bebida: string;
  ingredientes_usados: string[];
  recomendaciones: string[];
  alertas: string[];
}

export async function generarMenu(raciones: number) {
  return apiRequest<MenuGenerado>("/api/v1/menu/generar", {
    method: "POST",
    body: { raciones },
  });
}

export async function obtenerHistorial() {
  const res = await apiRequest<{ data: MenuGenerado[] }>("/api/v1/menu/historial");
  return res.data;
}

export async function obtenerUltimoMenu() {
  return apiRequest<MenuGenerado>("/api/v1/menu/ultimo");
}
```

---

### 2.5 `frontend/services/dashboard.service.ts`

```typescript
import { apiRequest } from "./api";

export interface DashboardResumen {
  voluntarios_activos: number;
  turnos_hoy: number;
  asistencias_hoy: { confirmadas: number; pendientes: number };
  ingredientes_disponibles: number;
  ultimo_menu: {
    entrada: string;
    plato_principal: string;
    bebida: string;
  } | null;
}

export async function obtenerResumen() {
  return apiRequest<DashboardResumen>("/api/v1/dashboard/resumen");
}
```

---

## 3. Cambios por pantalla

### 3.1 Dashboard — `app/(tabs)/index.tsx`

**Antes (hardcodeado):**
```tsx
// Valores fijos dentro del JSX
<StatCard label="Voluntarios" value="28" subtitle="Activos: 24" ... />
<StatCard label="Turnos hoy" value="3" ... />
```

**Después (conectado a API):**
```tsx
import { obtenerResumen, DashboardResumen } from '@/services/dashboard.service';
import { useState, useEffect } from 'react';

export default function DashboardScreen() {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerResumen()
      .then(setResumen)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Luego en el JSX usar:
  // value={String(resumen?.voluntarios_activos ?? 0)}
  // value={String(resumen?.turnos_hoy ?? 0)}
  // value={String(resumen?.ingredientes_disponibles ?? 0)}
  // Y para el menú: resumen?.ultimo_menu?.entrada, etc.
}
```

---

### 3.2 Voluntarios — `app/(tabs)/voluntarios.tsx`

**Antes (hardcodeado):**
```tsx
const voluntarios = [
  { id: '1', nombre: 'Juan Pérez', ... },
  { id: '2', nombre: 'María Gómez', ... },
];
```

**Después (conectado a API):**
```tsx
import { listarVoluntarios, Voluntario } from '@/services/voluntarios.service';

export default function VoluntariosScreen() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');

  const cargarVoluntarios = async () => {
    setLoading(true);
    try {
      const filtro = activeFilter === 'todos' ? undefined : activeFilter === 'activos' ? 'activo' : 'inactivo';
      const data = await listarVoluntarios(filtro);
      setVoluntarios(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarVoluntarios(); }, [activeFilter]);

  // En el JSX mapear vol.nombre_completo en vez de vol.nombre
  // Las iniciales se calculan: vol.nombre_completo.split(' ').map(n => n[0]).join('')
}
```

**Adaptación de campos:** El backend devuelve `nombre_completo` en vez de `nombre`, y `disponibilidad` como array `["lunes","miercoles"]` en vez de string `"Lunes, Miércoles"`. Para mostrar los días como texto:

```tsx
const diasTexto = vol.disponibilidad.join(', ');
const iniciales = vol.nombre_completo.split(' ').map(n => n[0]).join('').toUpperCase();
```

---

### 3.3 Turnos — `app/(tabs)/turnos.tsx`

**Antes:**
```tsx
const turnos = [
  { id: '1', horario: 'Mañana', horas: '7:00 a. m. - 12:00 p. m.', programados: 5, ... },
];
```

**Después:**
```tsx
import { listarTurnos, Turno } from '@/services/turnos.service';

// Cargar turnos cuando cambia la fecha
useEffect(() => {
  const fechaStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
  listarTurnos(fechaStr)
    .then(setTurnos)
    .catch(console.error);
}, [currentDate]);

// Los campos del backend son: hora_inicio, hora_fin (en formato "HH:MM")
// Formatear para mostrar: `${turno.hora_inicio} - ${turno.hora_fin}`
```

---

### 3.4 Inventario — `app/(tabs)/inventario.tsx`

**Antes:**
```tsx
const ingredientes = [
  { id: '1', nombre: 'Arroz', cantidad: 10, unidad: 'kg', disponible: true, icon: 'rice', color: '#f59e0b' },
];
```

**Después:**
```tsx
import { listarInventario, Ingrediente } from '@/services/inventario.service';

const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

useEffect(() => {
  const filtro = activeFilter === 'todos' ? undefined : activeFilter === 'disponibles' ? 'disponible' : 'agotado';
  listarInventario(filtro)
    .then(setIngredientes)
    .catch(console.error);
}, [activeFilter]);

// Los iconos y colores no vienen del backend.
// Crear un mapa local para asignar icono/color según el nombre:
const iconMap: Record<string, { icon: string; color: string }> = {
  'arroz':    { icon: 'rice', color: '#f59e0b' },
  'pollo':    { icon: 'food-drumstick', color: '#ef4444' },
  'papa':     { icon: 'food-apple', color: '#8b5cf6' },
  // ... agregar más o usar un default
};
const getIcon = (nombre: string) => iconMap[nombre.toLowerCase()] ?? { icon: 'food', color: '#6b7280' };
```

---

### 3.5 Menú IA — `app/(tabs)/menu.tsx`

**Antes:**
```tsx
const handleGenerar = () => {
  setIsLoading(true);
  setTimeout(() => {  // ← Simulación con timeout
    setIsLoading(false);
    setGenerado(true);
  }, 2000);
};
// Menú hardcodeado en el JSX: 'Ensalada fresca de verduras', etc.
```

**Después:**
```tsx
import { generarMenu, MenuGenerado } from '@/services/menu.service';
import { Alert } from 'react-native';

const [menu, setMenu] = useState<MenuGenerado | null>(null);

const handleGenerar = async () => {
  setIsLoading(true);
  try {
    const resultado = await generarMenu(50); // o pedir raciones al usuario
    setMenu(resultado);
    setGenerado(true);
    // Animar entrada
    resultOpacity.value = withTiming(1, { duration: 500 });
    resultTranslateY.value = withTiming(0, { duration: 500 });
  } catch (e: any) {
    Alert.alert("Error", e.message || "No se pudo generar el menú");
  } finally {
    setIsLoading(false);
  }
};

// En el JSX usar datos dinámicos:
// { label: 'Entrada', dish: menu?.entrada ?? '' }
// { label: 'Plato principal', dish: menu?.plato_principal ?? '' }
// { label: 'Bebida', dish: menu?.bebida ?? '' }
// Recomendaciones: menu?.recomendaciones?.[0] ?? ''
```

---

### 3.6 Historial — `app/menu/historial.tsx`

**Antes:**
```tsx
const menus = [
  { id: '1', fecha: 'Hoy, 10:30 a. m.', entrada: 'Ensalada...', ... },
];
```

**Después:**
```tsx
import { obtenerHistorial, MenuGenerado } from '@/services/menu.service';

const [menus, setMenus] = useState<MenuGenerado[]>([]);

useEffect(() => {
  obtenerHistorial().then(setMenus).catch(console.error);
}, []);

// Formatear fecha: new Date(menu.fecha_generacion).toLocaleDateString('es-PE', ...)
// Usar menu.plato_principal en vez de menu.plato
```

---

### 3.7 Formulario Nuevo Voluntario — `app/voluntarios/nuevo.tsx`

```tsx
import { crearVoluntario } from '@/services/voluntarios.service';

const handleGuardar = async () => {
  try {
    await crearVoluntario({
      nombre_completo: nombre,
      telefono: telefono,
      disponibilidad: diasSeleccionados, // ["lunes", "miercoles"]
      estado: activo ? "activo" : "inactivo",
    });
    router.back(); // Volver a la lista
  } catch (e: any) {
    Alert.alert("Error", e.message);
  }
};
```

---

### 3.8 Formulario Nuevo Ingrediente — `app/inventario/nuevo.tsx`

```tsx
import { crearIngrediente } from '@/services/inventario.service';

const handleGuardar = async () => {
  try {
    await crearIngrediente({
      nombre,
      cantidad: Number(cantidad),
      unidad: unidadSeleccionada, // "kg", "L", etc.
      estado: disponible ? "disponible" : "agotado",
    });
    router.back();
  } catch (e: any) {
    Alert.alert("Error", e.message);
  }
};
```

---

### 3.9 Formulario Nuevo Turno — `app/turnos/nuevo.tsx`

```tsx
import { crearTurno } from '@/services/turnos.service';

const handleGuardar = async () => {
  try {
    await crearTurno({
      fecha: fechaSeleccionada,           // "2026-05-10"
      horario: horarioSeleccionado,       // "mañana"
      hora_inicio: horaInicio,            // "08:00"
      hora_fin: horaFin,                  // "12:00"
      voluntarios_asignados: idsSeleccionados, // ["v_123", "v_456"]
      estado: "programado",
    });
    router.back();
  } catch (e: any) {
    Alert.alert("Error", e.message);
  }
};
```

---

## 4. Resumen de archivos a crear

| Archivo | Tipo |
|---|---|
| `frontend/services/api.ts` | **NUEVO** — Cliente HTTP base |
| `frontend/services/voluntarios.service.ts` | **NUEVO** — CRUD voluntarios |
| `frontend/services/turnos.service.ts` | **NUEVO** — CRUD turnos + asistencia |
| `frontend/services/inventario.service.ts` | **NUEVO** — CRUD inventario |
| `frontend/services/menu.service.ts` | **NUEVO** — Generar menú, historial |
| `frontend/services/dashboard.service.ts` | **NUEVO** — Resumen dashboard |

## 5. Resumen de archivos a modificar

| Archivo | Cambio principal |
|---|---|
| `app/(tabs)/index.tsx` | Reemplazar valores fijos por `obtenerResumen()` |
| `app/(tabs)/voluntarios.tsx` | Reemplazar array local por `listarVoluntarios()` |
| `app/(tabs)/turnos.tsx` | Reemplazar array local por `listarTurnos(fecha)` |
| `app/(tabs)/inventario.tsx` | Reemplazar array local por `listarInventario()` |
| `app/(tabs)/menu.tsx` | Reemplazar `setTimeout` por `generarMenu()` |
| `app/menu/historial.tsx` | Reemplazar array local por `obtenerHistorial()` |
| `app/voluntarios/nuevo.tsx` | Conectar botón Guardar a `crearVoluntario()` |
| `app/inventario/nuevo.tsx` | Conectar botón Guardar a `crearIngrediente()` |
| `app/turnos/nuevo.tsx` | Conectar botón Guardar a `crearTurno()` |
| `app/turnos/[id].tsx` | Conectar toggles a `marcarAsistencia()` |
