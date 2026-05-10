import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HistorialMenuScreen() {
  const router = useRouter();

  const menus = [
    {
      id: '1',
      fecha: 'Hoy, 10:30 a. m.',
      entrada: 'Ensalada fresca de verduras',
      plato: 'Arroz con pollo y ensalada',
      bebida: 'Chicha morada',
      raciones: 120,
      ingredientes: 8,
    },
    {
      id: '2',
      fecha: 'Ayer, 9:15 a. m.',
      entrada: 'Sopa de verduras',
      plato: 'Guiso de lentejas con arroz',
      bebida: 'Refresco de avena',
      raciones: 95,
      ingredientes: 6,
    },
    {
      id: '3',
      fecha: '22 de mayo, 8:45 a. m.',
      entrada: 'Caldo de pollo',
      plato: 'Tallarines con salsa',
      bebida: 'Limonada',
      raciones: 110,
      ingredientes: 7,
    },
    {
      id: '4',
      fecha: '21 de mayo, 10:00 a. m.',
      entrada: 'Ensalada de betarraga',
      plato: 'Estofado de carne con papas',
      bebida: 'Emoliente',
      raciones: 85,
      ingredientes: 9,
    },
  ];

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
            <Text style={{ color: '#059669', fontWeight: '800', fontSize: 15 }}>{menus.length} menús generados</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Historial de menús creados con IA</Text>
          </View>
        </View>
      </Animated.View>

      {menus.map((menu, index) => (
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
                  <Text style={{ color: '#9ca3af', fontSize: 11 }}>{menu.fecha}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{
                  backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                }}>
                  <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: '700' }}>{menu.raciones} raciones</Text>
                </View>
              </View>
            </View>

            {/* Menu items */}
            {[
              { label: 'Entrada', value: menu.entrada, icon: 'bowl-mix' },
              { label: 'Principal', value: menu.plato, icon: 'food' },
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
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
