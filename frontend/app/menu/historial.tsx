import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useMenu } from '@/hooks/useDashboard';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Fecha desconocida';
  try {
    return new Date(dateStr).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
}

export default function HistorialMenuScreen() {
  const router = useRouter();
  const { historial, historialLoading, error, cargarHistorial } = useMenu();

  if (historialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando historial...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="wifi-off" size={48} color="#ef4444" />
        <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 18, marginTop: 16 }}>Error de conexión</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{error}</Text>
        <Pressable onPress={cargarHistorial} style={{ marginTop: 20, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      <Animated.View entering={FadeInDown.duration(300)}>
        <View style={{
          backgroundColor: '#ecfdf5', borderRadius: 16, padding: 16,
          flexDirection: 'row', alignItems: 'center', marginBottom: 20,
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}>
            <MaterialIcons name="history" size={22} color="#10b981" />
          </View>
          <View>
            <Text style={{ color: '#059669', fontWeight: '800', fontSize: 15 }}>
              {historial.length} menú{historial.length !== 1 ? 's' : ''} generado{historial.length !== 1 ? 's' : ''}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Historial de menús creados con IA</Text>
          </View>
        </View>
      </Animated.View>

      {historial.length === 0 && (
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <MaterialIcons name="restaurant-menu" size={48} color="#d1d5db" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>No hay menús generados aún</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: '#10b981', fontWeight: '700' }}>Generar el primero →</Text>
          </Pressable>
        </View>
      )}

      {historial.map((menu, index) => (
        <Animated.View key={menu.id} entering={FadeInDown.delay(100 + index * 80).duration(300)}>
          <Card>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 10,
                }}>
                  <MaterialIcons name="restaurant-menu" size={18} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 14 }}>Menú del día</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 11 }}>{formatDate(menu.fecha_generacion)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{
                  backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                }}>
                  <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: '700' }}>{menu.raciones_estimadas} raciones</Text>
                </View>
              </View>
            </View>

            {/* Menu items */}
            {[
              { label: 'Entrada', value: menu.entrada, icon: 'bowl-mix' },
              { label: 'Principal', value: menu.plato_principal, icon: 'food' },
              { label: 'Bebida', value: menu.bebida, icon: 'cup-water' },
            ].map((item, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 6,
                borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f3f4f6',
              }}>
                <MaterialCommunityIcons name={item.icon as any} size={16} color="#9ca3af" style={{ marginRight: 8 }} />
                <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: '700', width: 60 }}>{item.label}</Text>
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', flex: 1 }}>{item.value}</Text>
              </View>
            ))}

            {/* Ingredients used */}
            {menu.ingredientes_usados?.length > 0 && (
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>INGREDIENTES USADOS</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }} numberOfLines={2}>
                  {menu.ingredientes_usados.join(', ')}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
