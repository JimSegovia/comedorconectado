import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
  Easing, FadeInDown,
  interpolate,
} from 'react-native-reanimated';
import { useVoluntarios } from '@/hooks/useVoluntarios';
import { DiaSemana } from '@/services/api';

const DIAS_MAP: Record<DiaSemana, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

const avatarColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316'];

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

export default function VoluntariosScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchText, setSearchText] = useState('');
  const { voluntarios, loading, error, refetch } = useVoluntarios();

  // FAB animations
  const fabScale = useSharedValue(0);
  const fabRotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    fabScale.value = withDelay(150, withSpring(1, { damping: 18, stiffness: 250 }));
  }, []);

  const fabContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(fabRotation.value, [0, 1], [0, 45])}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handleFabPressIn = () => {
    fabRotation.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    rippleScale.value = 0; rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(2.4, { duration: 400, easing: Easing.out(Easing.quad) });
    rippleOpacity.value = withTiming(0, { duration: 400 });
  };
  const handleFabPressOut = () => {
    fabRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'activo', label: 'Activos' },
    { key: 'inactivo', label: 'Inactivos' },
  ];

  const filtered = useMemo(() => {
    return voluntarios
      .filter(v => activeFilter === 'todos' || v.estado === activeFilter)
      .filter(v => searchText === '' || v.nombre_completo.toLowerCase().includes(searchText.toLowerCase()));
  }, [voluntarios, activeFilter, searchText]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando voluntarios...</Text>
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
            placeholder="Buscar voluntario..."
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
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                backgroundColor: activeFilter === f.key ? '#10b981' : '#fff',
                paddingHorizontal: 16, paddingVertical: 6,
                borderRadius: 20, borderWidth: 1,
                borderColor: activeFilter === f.key ? '#10b981' : '#e5e7eb',
              }}
            >
              <Text style={{
                color: activeFilter === f.key ? '#fff' : '#374151',
                fontWeight: '600', fontSize: 13,
              }}>{f.label}</Text>
            </Pressable>
          ))}
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>{filtered.length} voluntarios</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 110 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <MaterialIcons name="people-outline" size={48} color="#d1d5db" />
            <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>No se encontraron voluntarios</Text>
          </View>
        )}
        {filtered.map((vol, index) => (
          <Animated.View
            key={vol.id}
            entering={FadeInDown.delay(index * 60).duration(280)}
          >
            <Card onPress={() => router.push(`/voluntarios/${vol.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Avatar with initials */}
                <View style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: avatarColors[index % avatarColors.length] + '18',
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  <Text style={{
                    color: avatarColors[index % avatarColors.length],
                    fontWeight: '800', fontSize: 16,
                  }}>{getInitials(vol.nombre_completo)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{vol.nombre_completo}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{vol.telefono}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                    {vol.disponibilidad.map(d => DIAS_MAP[d] ?? d).join(', ') || 'Sin días definidos'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge
                    label={vol.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    variant={vol.estado === 'activo' ? 'success' : 'default'}
                  />
                  <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Animated FAB */}
      <Animated.View style={[fabContainerStyle, { position: 'absolute', bottom: 24, right: 24 }]}>
        <Pressable
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={() => router.push('/voluntarios/nuevo' as any)}
          style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}
        >
          <Animated.View style={[rippleStyle, {
            position: 'absolute', width: 58, height: 58, borderRadius: 20, backgroundColor: '#fff',
          }]} />
          <View style={{
            width: 58, height: 58, borderRadius: 20, backgroundColor: '#10b981',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
          }}>
            <Animated.View style={fabIconStyle}>
              <MaterialIcons name="add" size={28} color="white" />
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
