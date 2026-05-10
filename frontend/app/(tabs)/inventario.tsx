import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
  Easing, FadeInDown, interpolate,
} from 'react-native-reanimated';
import { useInventario } from '@/hooks/useInventario';
import { Ingrediente } from '@/services/api';

// Ingredient icon & color mapping
const ICON_MAP: Record<string, string> = {
  Arroz: 'rice', Pollo: 'food-drumstick', Papa: 'food', Zanahoria: 'carrot',
  Aceite: 'bottle-tonic', Cebolla: 'food', Ajo: 'food', Tomate: 'food',
  Lentejas: 'food', Fideos: 'food', Atún: 'fish', Huevos: 'egg', Leche: 'cup',
  Avena: 'food', Sal: 'shaker', Pimienta: 'shaker',
};
const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#3b82f6', '#10b981', '#ec4899', '#06b6d4'];

function getIcon(nombre: string) {
  for (const key of Object.keys(ICON_MAP)) {
    if (nombre.toLowerCase().includes(key.toLowerCase())) return ICON_MAP[key];
  }
  return 'food-apple';
}

function getColor(id: string, index: number) {
  return COLORS[index % COLORS.length];
}

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

export default function InventarioScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchText, setSearchText] = useState('');
  const { ingredientes, loading, error, refetch } = useInventario();

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'disponibles', label: 'Disponibles' },
    { key: 'agotados', label: 'Agotados' },
  ];

  const filtered = useMemo(() => {
    return ingredientes
      .filter(i => {
        if (activeFilter === 'disponibles') return i.estado === 'disponible';
        if (activeFilter === 'agotados') return i.estado === 'agotado';
        return true;
      })
      .filter(i => searchText === '' || i.nombre.toLowerCase().includes(searchText.toLowerCase()));
  }, [ingredientes, activeFilter, searchText]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando inventario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="wifi-off" size={48} color="#ef4444" />
        <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 18, marginTop: 16 }}>Error de conexión</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{error}</Text>
        <Pressable onPress={refetch} style={{ marginTop: 20, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

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
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={18} color="#9ca3af" />
            </Pressable>
          )}
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
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>{filtered.length} items</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 110 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <MaterialCommunityIcons name="food-off" size={48} color="#d1d5db" />
            <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>No se encontraron ingredientes</Text>
          </View>
        )}
        {filtered.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 60).duration(280)}>
            <Card onPress={() => router.push(`/inventario/${item.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: getColor(item.id, index) + '15',
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  <MaterialCommunityIcons name={getIcon(item.nombre) as any} size={24} color={getColor(item.id, index)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{item.nombre}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{item.cantidad} {item.unidad}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge
                    label={item.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                    variant={item.estado === 'disponible' ? 'success' : 'danger'}
                  />
                  <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      <AnimatedFAB onPress={() => router.push('/inventario/nuevo' as any)} />
    </View>
  );
}
