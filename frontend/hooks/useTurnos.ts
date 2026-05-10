import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { turnosApi, Turno, TurnoCreate, AsistenciaDetalle, EstadoAsistencia } from '@/services/api';

export function useTurnos(fecha?: string, horario?: string) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await turnosApi.listar(fecha, horario);
      setTurnos(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  }, [fecha, horario]);

  // Refetch every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  const crear = async (data: TurnoCreate) => {
    const nuevo = await turnosApi.crear(data);
    setTurnos(prev => [...prev, nuevo]);
    return nuevo;
  };

  return { turnos, loading, error, refetch: fetch, crear };
}

export function useAsistencia(turnoId: string) {
  const [asistencias, setAsistencias] = useState<AsistenciaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!turnoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await turnosApi.obtenerAsistencia(turnoId);
      setAsistencias(res.asistencias);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar asistencias');
    } finally {
      setLoading(false);
    }
  }, [turnoId]);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  const marcar = async (voluntario_id: string, estado: EstadoAsistencia) => {
    await turnosApi.marcarAsistencia(turnoId, voluntario_id, estado);
    setAsistencias(prev =>
      prev.map(a => a.voluntario_id === voluntario_id ? { ...a, estado_asistencia: estado } : a)
    );
  };

  return { asistencias, loading, error, refetch: fetch, marcar };
}
