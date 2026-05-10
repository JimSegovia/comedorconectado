// ─── Comedor Conectado — API Service ─────────────────────────────────────────
const BASE_URL = 'https://comedor-conectado-api-1045294427333.us-central1.run.app/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type EstadoVoluntario = 'activo' | 'inactivo';
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type HorarioTurno = 'mañana' | 'tarde' | 'noche';
export type EstadoTurno = 'programado' | 'completado' | 'cancelado';
export type EstadoAsistencia = 'pendiente' | 'asistio' | 'no_asistio';
export type EstadoIngrediente = 'disponible' | 'agotado';
export type UnidadMedida = 'kg' | 'g' | 'L' | 'ml' | 'und';

export interface Voluntario {
  id: string;
  nombre_completo: string;
  telefono: string;
  disponibilidad: DiaSemana[];
  estado: EstadoVoluntario;
  fecha_registro?: string | null;
}

export interface VoluntarioCreate {
  nombre_completo: string;
  telefono: string;
  disponibilidad?: DiaSemana[];
  estado?: EstadoVoluntario;
}

export interface VoluntarioUpdate {
  nombre_completo?: string | null;
  telefono?: string | null;
  disponibilidad?: DiaSemana[] | null;
  estado?: EstadoVoluntario | null;
}

export interface Turno {
  id: string;
  fecha: string;
  horario: HorarioTurno;
  hora_inicio: string;
  hora_fin: string;
  voluntarios_asignados: string[];
  estado: EstadoTurno;
}

export interface TurnoCreate {
  fecha: string;
  horario: HorarioTurno;
  hora_inicio: string;
  hora_fin: string;
  voluntarios_asignados?: string[];
}

export interface AsistenciaDetalle {
  voluntario_id: string;
  estado_asistencia: EstadoAsistencia;
  fecha_marcado?: string | null;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  estado: EstadoIngrediente;
  fecha_actualizacion?: string | null;
}

export interface IngredienteCreate {
  nombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  estado?: EstadoIngrediente;
}

export interface IngredienteUpdate {
  nombre?: string | null;
  cantidad?: number | null;
  unidad?: UnidadMedida | null;
  estado?: EstadoIngrediente | null;
}

export interface MenuGenerado {
  id: string;
  fecha_generacion?: string | null;
  raciones_estimadas: number;
  entrada: string;
  plato_principal: string;
  bebida: string;
  ingredientes_usados: string[];
  recomendaciones: string[];
}

export interface DashboardResumen {
  voluntarios_activos: number;
  turnos_hoy: number;
  asistencias_hoy: { confirmadas: number; pendientes: number };
  ingredientes_disponibles: number;
  ultimo_menu?: {
    entrada?: string | null;
    plato_principal?: string | null;
    bebida?: string | null;
  } | null;
}

// ─── Voluntarios ──────────────────────────────────────────────────────────────

export const voluntariosApi = {
  listar: (estado?: EstadoVoluntario) =>
    request<{ data: Voluntario[]; total: number }>(
      `/voluntarios${estado ? `?estado=${estado}` : ''}`
    ),
  obtener: (id: string) => request<Voluntario>(`/voluntarios/${id}`),
  crear: (body: VoluntarioCreate) =>
    request<Voluntario>('/voluntarios', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id: string, body: VoluntarioUpdate) =>
    request<Voluntario>(`/voluntarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id: string) =>
    request<unknown>(`/voluntarios/${id}`, { method: 'DELETE' }),
};

// ─── Turnos & Asistencia ─────────────────────────────────────────────────────

export const turnosApi = {
  listar: (fecha?: string, horario?: string) => {
    const params = new URLSearchParams();
    if (fecha) params.set('fecha', fecha);
    if (horario) params.set('horario', horario);
    const qs = params.toString();
    return request<{ data: Turno[] }>(`/turnos${qs ? `?${qs}` : ''}`);
  },
  crear: (body: TurnoCreate) =>
    request<Turno>('/turnos', { method: 'POST', body: JSON.stringify(body) }),
  obtenerAsistencia: (turnoId: string) =>
    request<{ turno_id: string; asistencias: AsistenciaDetalle[] }>(
      `/turnos/${turnoId}/asistencia`
    ),
  marcarAsistencia: (turnoId: string, voluntario_id: string, estado_asistencia: EstadoAsistencia) =>
    request<unknown>(`/turnos/${turnoId}/asistencia`, {
      method: 'PATCH',
      body: JSON.stringify({ voluntario_id, estado_asistencia }),
    }),
};

// ─── Inventario ───────────────────────────────────────────────────────────────

export const inventarioApi = {
  listar: (estado?: EstadoIngrediente) =>
    request<{ data: Ingrediente[] }>(
      `/inventario${estado ? `?estado=${estado}` : ''}`
    ),
  obtener: (id: string) => request<Ingrediente>(`/inventario/${id}`),
  crear: (body: IngredienteCreate) =>
    request<Ingrediente>('/inventario', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id: string, body: IngredienteUpdate) =>
    request<Ingrediente>(`/inventario/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id: string) =>
    request<unknown>(`/inventario/${id}`, { method: 'DELETE' }),
};

// ─── Menú IA ─────────────────────────────────────────────────────────────────

export const menuApi = {
  generar: (raciones: number) =>
    request<MenuGenerado>('/menu/generar', {
      method: 'POST',
      body: JSON.stringify({ raciones }),
    }),
  historial: () =>
    request<{ data: MenuGenerado[]; total: number }>('/menu/historial'),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  resumen: () => request<DashboardResumen>('/dashboard/resumen'),
};
