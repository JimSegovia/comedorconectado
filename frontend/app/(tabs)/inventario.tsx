import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
  Easing, FadeInDown, interpolate,
} from 'react-native-reanimated';

// ─── Reusable Animated FAB ────────────────────────────────────────────────────
function AnimatedFAB({ onPress }: { onPress: () => void }) {
  const fabScale = useSharedValue(0);
  const fabRotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    fabScale.value = withDelay(150, withSpring(1, { damping: 18, stiffness: 250 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(fabRotation.value, [0, 1], [0, 45])}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handlePressIn = () => {
    fabRotation.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    rippleScale.value = 0; rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(2.4, { duration: 400, easing: Easing.out(Easing.quad) });
    rippleOpacity.value = withTiming(0, { duration: 400 });
  };
  const handlePressOut = () => {
    fabRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  return (
    <Animated.View style={[containerStyle, { position: 'absolute', bottom: 24, right: 24 }]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}
        style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[rippleStyle, {
          position: 'absolute', width: 58, height: 58, borderRadius: 20, backgroundColor: '#fff',
        }]} />
        <View style={{
          width: 58, height: 58, borderRadius: 20, backgroundColor: '#10b981',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
        }}>
          <Animated.View style={iconStyle}>
            <MaterialIcons name="add" size={28} color="white" />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function InventarioScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('todos');

  const ingredientes = [
    { id: '1', nombre: 'Arroz', cantidad: 10, unidad: 'kg', disponible: true, icon: 'rice', color: '#f59e0b' },
    { id: '2', nombre: 'Pollo', cantidad: 8, unidad: 'kg', disponible: true, icon: 'food-drumstick', color: '#ef4444' },
    { id: '3', nombre: 'Papa', cantidad: 15, unidad: 'kg', disponible: true, icon: 'food-apple', color: '#8b5cf6' },
    { id: '4', nombre: 'Zanahoria', cantidad: 5, unidad: 'kg', disponible: false, icon: 'carrot', color: '#f97316' },
    { id: '5', nombre: 'Aceite vegetal', cantidad: 2, unidad: 'L', disponible: true, icon: 'bottle-tonic', color: '#3b82f6' },
  ];

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'disponibles', label: 'Disponibles' },
    { key: 'agotados', label: 'Agotados' },
  ];

  const filtered = ingredientes.filter(i => {
    if (activeFilter === 'disponibles') return i.disponible;
    if (activeFilter === 'agotados') return !i.disponible;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      
      {/* Header & Search */}
      <View style={{ backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 10,
          borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0',
        }}>
          <MaterialIcons name="search" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput 
            placeholder="Buscar ingrediente..." 
            style={{ flex: 1, color: '#1f2937', fontSize: 15 }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          {filters.map((f) => (
            <Pressable key={f.key} onPress={() => setActiveFilter(f.key)} style={{
              backgroundColor: activeFilter === f.key ? '#10b981' : '#fff',
              paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
              borderWidth: 1, borderColor: activeFilter === f.key ? '#10b981' : '#e5e7eb',
            }}>
              <Text style={{
                color: activeFilter === f.key ? '#fff' : '#374151',
                fontWeight: '600', fontSize: 13,
              }}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 110 }}>
        {filtered.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).duration(300)}>
            <Card onPress={() => router.push(`/inventario/${item.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: item.color + '15',
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{item.nombre}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{item.cantidad} {item.unidad}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge 
                    label={item.disponible ? 'Disponible' : 'Agotado'} 
                    variant={item.disponible ? 'success' : 'danger'} 
                  />
                  <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      <AnimatedFAB onPress={() => router.push('/inventario/nuevo')} />
    </View>
  );
}
