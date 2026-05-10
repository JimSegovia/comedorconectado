import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, FadeInDown } from 'react-native-reanimated';
import { voluntariosApi, Voluntario, DiaSemana } from '@/services/api';

const DIAS_MAP: Record<DiaSemana, string> = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
};

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

export default function DetalleVoluntarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [loading, setLoading] = useState(true);

  // Avatar entrance
  const avatarScale = useSharedValue(0);
  const avatarOpacity = useSharedValue(0);
  useEffect(() => {
    avatarScale.value = withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.3)) }));
    avatarOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarOpacity.value,
  }));

  useEffect(() => {
    if (!id) return;
    voluntariosApi.obtener(id)
      .then(setVoluntario)
      .catch(e => Alert.alert('Error', e.message ?? 'No se pudo cargar el voluntario'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEliminar = () => {
    if (!voluntario) return;
    Alert.alert(
      'Desactivar voluntario',
      `¿Estás seguro de que deseas desactivar a ${voluntario.nombre_completo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar', style: 'destructive', onPress: async () => {
            try {
              await voluntariosApi.eliminar(id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo desactivar');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!voluntario) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="person-off" size={48} color="#d1d5db" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Voluntario no encontrado</Text>
      </View>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Fecha desconocida';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', { dateStyle: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {/* Profile Header */}
      <Animated.View style={[avatarStyle, { alignItems: 'center', marginTop: 8, marginBottom: 24 }]}>
        <View style={{
          width: 96, height: 96, borderRadius: 32,
          backgroundColor: '#10b98118', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 32 }}>{getInitials(voluntario.nombre_completo)}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>{voluntario.nombre_completo}</Text>
        <Badge label={voluntario.estado === 'activo' ? 'Activo' : 'Inactivo'} variant={voluntario.estado === 'activo' ? 'success' : 'default'} />
      </Animated.View>

      {/* Info Card */}
      <Animated.View entering={FadeInDown.delay(300).duration(300)}>
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 16 }}>Información</Text>
          {[
            { icon: 'phone', label: 'Teléfono', value: voluntario.telefono },
            { icon: 'calendar-today', label: 'Registrado', value: formatDate(voluntario.fecha_registro) },
          ].map((item, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f3f4f6',
            }}>
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <MaterialIcons name={item.icon as any} size={18} color="#6b7280" />
              </View>
              <View>
                <Text style={{ color: '#9ca3af', fontSize: 11, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 14 }}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>
      </Animated.View>

      {/* Availability */}
      <Animated.View entering={FadeInDown.delay(400).duration(300)}>
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>Disponibilidad</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(DIAS_MAP) as DiaSemana[]).map(dia => {
              const isAvailable = voluntario.disponibilidad.includes(dia);
              return (
                <View key={dia} style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: isAvailable ? '#ecfdf5' : '#f9fafb',
                  borderWidth: 1, borderColor: isAvailable ? '#d1fae5' : '#e5e7eb',
                }}>
                  <Text style={{ color: isAvailable ? '#059669' : '#9ca3af', fontWeight: '700', fontSize: 13 }}>
                    {DIAS_MAP[dia]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(500).duration(300)}>
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button 
            title="Editar voluntario" 
            variant="outline" 
            onPress={() => router.push({ pathname: '/voluntarios/editar', params: { id } } as any)} 
            className="w-full" 
          />
          <Pressable onPress={handleEliminar} style={{
            paddingVertical: 14, alignItems: 'center',
            borderRadius: 16, borderWidth: 2, borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
          }}>
            <Text style={{ color: '#ef4444', fontWeight: '800' }}>Desactivar voluntario</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
