import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { inventarioApi, Ingrediente, IngredienteCreate, IngredienteUpdate, EstadoIngrediente } from '@/services/api';

export function useInventario(estadoFiltro?: EstadoIngrediente) {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventarioApi.listar(estadoFiltro);
      setIngredientes(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }, [estadoFiltro]);

  // Refetch every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  const crear = async (data: IngredienteCreate) => {
    const nuevo = await inventarioApi.crear(data);
    setIngredientes(prev => [nuevo, ...prev]);
    return nuevo;
  };

  const actualizar = async (id: string, data: IngredienteUpdate) => {
    const actualizado = await inventarioApi.actualizar(id, data);
    setIngredientes(prev => prev.map(i => i.id === id ? actualizado : i));
    return actualizado;
  };

  const eliminar = async (id: string) => {
    await inventarioApi.eliminar(id);
    setIngredientes(prev => prev.filter(i => i.id !== id));
  };

  return { ingredientes, loading, error, refetch: fetch, crear, actualizar, eliminar };
}

export function useIngrediente(id: string) {
  const [ingrediente, setIngrediente] = useState<Ingrediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await inventarioApi.obtener(id);
      setIngrediente(data);
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

  return { ingrediente, loading, error, refetch: fetch };
}
