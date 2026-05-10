import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, FadeInDown } from 'react-native-reanimated';

const asistenciaHistorial = [
  { fecha: '24 de mayo, 2025', turno: 'Mañana', estado: 'Asistió' as const },
  { fecha: '22 de mayo, 2025', turno: 'Tarde', estado: 'Asistió' as const },
  { fecha: '20 de mayo, 2025', turno: 'Mañana', estado: 'No asistió' as const },
  { fecha: '17 de mayo, 2025', turno: 'Viernes', estado: 'Asistió' as const },
  { fecha: '15 de mayo, 2025', turno: 'Mañana', estado: 'Asistió' as const },
];

export default function DetalleVoluntarioScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const voluntario = {
    nombre: 'Juan Pérez',
    iniciales: 'JP',
    telefono: '999 888 777',
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    activo: true,
    registrado: '15 de abril, 2025',
    turnosCompletados: 12,
    asistencia: 95,
  };

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

  const getEstadoColor = (estado: 'Asistió' | 'No asistió') =>
    estado === 'Asistió' ? '#10b981' : '#ef4444';
  const getEstadoIcon = (estado: 'Asistió' | 'No asistió'): keyof typeof MaterialIcons.glyphMap =>
    estado === 'Asistió' ? 'check-circle' : 'cancel';

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar voluntario',
      `¿Estás seguro de que deseas eliminar a ${voluntario.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => router.back() },
      ]
    );
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
          <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 32 }}>{voluntario.iniciales}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>{voluntario.nombre}</Text>
        <Badge label={voluntario.activo ? 'Activo' : 'Inactivo'} variant={voluntario.activo ? 'success' : 'default'} />
      </Animated.View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{
            flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
          }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#10b981' }}>{voluntario.turnosCompletados}</Text>
            <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Turnos</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
          }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#3b82f6' }}>{voluntario.asistencia}%</Text>
            <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Asistencia</Text>
          </View>
        </View>
      </Animated.View>

      {/* Info Card */}
      <Animated.View entering={FadeInDown.delay(300).duration(300)}>
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 16 }}>Información</Text>
          {[
            { icon: 'phone', label: 'Teléfono', value: voluntario.telefono },
            { icon: 'calendar-today', label: 'Registrado', value: voluntario.registrado },
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
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => {
              const fullDays: Record<string, string> = { 'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes', 'Sáb': 'Sábado', 'Dom': 'Domingo' };
              const isAvailable = voluntario.dias.includes(fullDays[dia]);
              return (
                <View key={dia} style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: isAvailable ? '#ecfdf5' : '#f9fafb',
                  borderWidth: 1, borderColor: isAvailable ? '#d1fae5' : '#e5e7eb',
                }}>
                  <Text style={{ color: isAvailable ? '#059669' : '#9ca3af', fontWeight: '700', fontSize: 13 }}>{dia}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </Animated.View>

      {/* Attendance History */}
      <Animated.View entering={FadeInDown.delay(500).duration(300)}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937' }}>Registro de asistencias</Text>
            <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>Últimos 5</Text>
            </View>
          </View>

          {asistenciaHistorial.map((item, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f3f4f6',
            }}>
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: getEstadoColor(item.estado) + '15',
                alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <MaterialIcons name={getEstadoIcon(item.estado)} size={20} color={getEstadoColor(item.estado)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 13 }}>{item.fecha}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 1 }}>Turno {item.turno}</Text>
              </View>
              <Text style={{ color: getEstadoColor(item.estado), fontWeight: '700', fontSize: 12 }}>
                {item.estado}
              </Text>
            </View>
          ))}
        </Card>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(600).duration(300)}>
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button 
            title="Editar voluntario" 
            variant="outline" 
            onPress={() => router.push({ pathname: '/voluntarios/editar', params: { id } })} 
            className="w-full" 
          />
          <Pressable onPress={handleEliminar} style={{
            paddingVertical: 14, alignItems: 'center',
            borderRadius: 16, borderWidth: 2, borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
          }}>
            <Text style={{ color: '#ef4444', fontWeight: '800' }}>Eliminar voluntario</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
