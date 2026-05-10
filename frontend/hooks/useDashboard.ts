import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { menuApi, dashboardApi, MenuGenerado, DashboardResumen } from '@/services/api';

export function useDashboard() {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.resumen();
      setResumen(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  return { resumen, loading, error, refetch: fetch };
}

export function useMenu() {
  const [menu, setMenu] = useState<MenuGenerado | null>(null);
  const [historial, setHistorial] = useState<MenuGenerado[]>([]);
  const [loading, setLoading] = useState(false);
  const [historialLoading, setHistorialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    setHistorialLoading(true);
    setError(null);
    try {
      const res = await menuApi.historial();
      setHistorial(res.data);
      if (res.data.length > 0) setMenu(res.data[0]);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar historial');
    } finally {
      setHistorialLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  const generar = async (raciones: number) => {
    setLoading(true);
    setError(null);
    try {
      const generado = await menuApi.generar(raciones);
      setMenu(generado);
      setHistorial(prev => [generado, ...prev]);
      return generado;
    } catch (e: any) {
      setError(e.message ?? 'Error al generar menú');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { menu, historial, loading, historialLoading, error, generar, cargarHistorial };
}
