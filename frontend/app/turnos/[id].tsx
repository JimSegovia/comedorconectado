import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { turnosApi, voluntariosApi, Turno, AsistenciaDetalle, EstadoAsistencia, Voluntario } from '@/services/api';

const HORARIO_LABEL: Record<string, string> = {
  'mañana': 'Mañana', 'tarde': 'Tarde', 'noche': 'Noche',
};
const ESTADO_TURNO_LABEL: Record<string, string> = {
  'programado': 'Programado', 'completado': 'Completado', 'cancelado': 'Cancelado',
};
const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

type AsistenciaState = {
  voluntario_id: string;
  nombre: string;
  estado: EstadoAsistencia;
};

function getColorEstado(estado: EstadoAsistencia) {
  if (estado === 'asistio') return '#10b981';
  if (estado === 'no_asistio') return '#ef4444';
  return '#f59e0b';
}
function getIconEstado(estado: EstadoAsistencia): keyof typeof MaterialIcons.glyphMap {
  if (estado === 'asistio') return 'check-circle';
  if (estado === 'no_asistio') return 'cancel';
  return 'schedule';
}
function getLabelEstado(estado: EstadoAsistencia) {
  if (estado === 'asistio') return 'Asistió';
  if (estado === 'no_asistio') return 'No asistió';
  return 'Pendiente';
}
function cycleEstado(estado: EstadoAsistencia): EstadoAsistencia {
  const cycle: EstadoAsistencia[] = ['asistio', 'no_asistio', 'pendiente'];
  return cycle[(cycle.indexOf(estado) + 1) % 3];
}
function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
function formatDate(str: string) {
  try {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { dateStyle: 'long' });
  } catch { return str; }
}

export default function DetalleTurnoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [turno, setTurno] = useState<Turno | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Load turn details + attendance + volunteer names in parallel
      const [turnoRes, asistRes] = await Promise.all([
        // We get the turno from the list (no single-turno endpoint available)
        turnosApi.listar(),
        turnosApi.obtenerAsistencia(id),
      ]);

      const t = turnoRes.data.find(t => t.id === id) ?? null;
      setTurno(t);

      // Build asistencia state with volunteer names
      if (asistRes.asistencias.length > 0) {
        // Try to get volunteer names
        const volIds = asistRes.asistencias.map(a => a.voluntario_id);
        const volRes = await voluntariosApi.listar().catch(() => ({ data: [] as Voluntario[], total: 0 }));
        const volMap: Record<string, string> = {};
        volRes.data.forEach(v => { volMap[v.id] = v.nombre_completo; });

        setAsistencias(asistRes.asistencias.map(a => ({
          voluntario_id: a.voluntario_id,
          nombre: volMap[a.voluntario_id] ?? `Voluntario ${a.voluntario_id.slice(0, 6)}`,
          estado: a.estado_asistencia,
        })));
      } else if (t?.voluntarios_asignados?.length) {
        // No attendance records yet — build pending list from assigned volunteers
        const volRes = await voluntariosApi.listar().catch(() => ({ data: [] as Voluntario[], total: 0 }));
        const volMap: Record<string, string> = {};
        volRes.data.forEach(v => { volMap[v.id] = v.nombre_completo; });

        setAsistencias(t.voluntarios_asignados.map(vid => ({
          voluntario_id: vid,
          nombre: volMap[vid] ?? `Voluntario ${vid.slice(0, 6)}`,
          estado: 'pendiente' as EstadoAsistencia,
        })));
      }
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar el turno');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleAsistencia = (voluntario_id: string) => {
    setAsistencias(prev => prev.map(a =>
      a.voluntario_id === voluntario_id
        ? { ...a, estado: cycleEstado(a.estado) }
        : a
    ));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await Promise.all(
        asistencias.map(a =>
          turnosApi.marcarAsistencia(id, a.voluntario_id, a.estado)
        )
      );
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando turno...</Text>
      </View>
    );
  }

  if (error || !turno) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="event-busy" size={48} color="#d1d5db" />
        <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 18, marginTop: 16 }}>Turno no encontrado</Text>
        {error && <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{error}</Text>}
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const asistieron = asistencias.filter(a => a.estado === 'asistio').length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Summary */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={{
            backgroundColor: '#ecfdf5', borderRadius: 20, padding: 20, marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>
                {HORARIO_LABEL[turno.horario] ?? turno.horario}
              </Text>
              <Badge
                label={ESTADO_TURNO_LABEL[turno.estado] ?? turno.estado}
                variant={turno.estado === 'completado' ? 'success' : turno.estado === 'cancelado' ? 'danger' : 'default'}
              />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>
              {turno.hora_inicio} - {turno.hora_fin}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="calendar-today" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>{formatDate(turno.fecha)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="people" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>
                  {asistieron}/{asistencias.length} asistieron
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>
          Voluntarios asignados
        </Text>

        {asistencias.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <MaterialIcons name="people-outline" size={40} color="#d1d5db" />
            <Text style={{ color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>Sin voluntarios asignados</Text>
          </View>
        )}

        {asistencias.map((vol, index) => (
          <Animated.View key={vol.voluntario_id} entering={FadeInDown.delay(100 + index * 80).duration(300)}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: avatarColors[index % avatarColors.length] + '18',
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    <Text style={{ color: avatarColors[index % avatarColors.length], fontWeight: '800', fontSize: 15 }}>
                      {getInitials(vol.nombre)}
                    </Text>
                  </View>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{vol.nombre}</Text>
                </View>
                
                <Pressable
                  onPress={() => toggleAsistencia(vol.voluntario_id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: getColorEstado(vol.estado) + '15',
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                  }}
                >
                  <MaterialIcons name={getIconEstado(vol.estado)} size={18} color={getColorEstado(vol.estado)} style={{ marginRight: 4 }} />
                  <Text style={{ fontWeight: '700', fontSize: 12, color: getColorEstado(vol.estado) }}>
                    {getLabelEstado(vol.estado)}
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{
        padding: 16, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
      }}>
        <Button
          title="Guardar asistencia"
          onPress={handleGuardar}
          isLoading={saving}
          disabled={asistencias.length === 0}
        />
      </View>
    </View>
  );
}
