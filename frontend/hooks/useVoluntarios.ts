import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { voluntariosApi, Voluntario, VoluntarioCreate, VoluntarioUpdate, EstadoVoluntario } from '@/services/api';

export function useVoluntarios(estadoFiltro?: EstadoVoluntario) {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voluntariosApi.listar(estadoFiltro);
      setVoluntarios(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar voluntarios');
    } finally {
      setLoading(false);
    }
  }, [estadoFiltro]);

  // Refetch every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  const crear = async (data: VoluntarioCreate) => {
    const nuevo = await voluntariosApi.crear(data);
    setVoluntarios(prev => [nuevo, ...prev]);
    return nuevo;
  };

  const actualizar = async (id: string, data: VoluntarioUpdate) => {
    const actualizado = await voluntariosApi.actualizar(id, data);
    setVoluntarios(prev => prev.map(v => v.id === id ? actualizado : v));
    return actualizado;
  };

  const eliminar = async (id: string) => {
    await voluntariosApi.eliminar(id);
    setVoluntarios(prev => prev.filter(v => v.id !== id));
  };

  return { voluntarios, loading, error, refetch: fetch, crear, actualizar, eliminar };
}

export function useVoluntario(id: string) {
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await voluntariosApi.obtener(id);
      setVoluntario(data);
    } catch (e: any) {
      setError(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  return { voluntario, loading, error, refetch: fetch };
}
