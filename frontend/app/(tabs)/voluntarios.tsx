import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
  Easing, FadeInDown,
  interpolate,
} from 'react-native-reanimated';

export default function VoluntariosScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [fabPressed, setFabPressed] = useState(false);

  const voluntarios = [
    { id: '1', nombre: 'Juan Pérez', telefono: '999 888 777', dias: 'Lunes, Miércoles, Viernes', activo: true, iniciales: 'JP' },
    { id: '2', nombre: 'María Gómez', telefono: '987 654 321', dias: 'Martes, Jueves', activo: true, iniciales: 'MG' },
    { id: '3', nombre: 'Carlos Silva', telefono: '912 345 678', dias: 'Sábados', activo: true, iniciales: 'CS' },
    { id: '4', nombre: 'Ana Torres', telefono: '999 111 222', dias: 'Lunes, Viernes', activo: false, iniciales: 'AT' },
  ];

  const avatarColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'activos', label: 'Activos' },
    { key: 'inactivos', label: 'Inactivos' },
  ];

  // FAB entrance animation
  const fabScale = useSharedValue(0);
  // FAB icon rotation (+ → ×)
  const fabRotation = useSharedValue(0);
  // Ripple scale for FAB press feedback
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
    rippleScale.value = 0;
    rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(2.4, { duration: 400, easing: Easing.out(Easing.quad) });
    rippleOpacity.value = withTiming(0, { duration: 400 });
  };

  const handleFabPressOut = () => {
    fabRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  const handleFabPress = () => {
    router.push('/voluntarios/nuevo');
  };

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
          />
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
                borderRadius: 20,
                borderWidth: 1,
                borderColor: activeFilter === f.key ? '#10b981' : '#e5e7eb',
              }}
            >
              <Text style={{
                color: activeFilter === f.key ? '#fff' : '#374151',
                fontWeight: '600', fontSize: 13,
              }}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 110 }}>
        {voluntarios.map((vol, index) => (
          <Animated.View
            key={vol.id}
            entering={FadeInDown.delay(index * 80).duration(300)}
          >
            <Card onPress={() => router.push(`/voluntarios/${vol.id}`)}>
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
                  }}>{vol.iniciales}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{vol.nombre}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{vol.telefono}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>{vol.dias}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge 
                    label={vol.activo ? 'Activo' : 'Inactivo'} 
                    variant={vol.activo ? 'success' : 'default'} 
                  />
                  <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Animated FAB with ripple */}
      <Animated.View style={[fabContainerStyle, {
        position: 'absolute', bottom: 24, right: 24,
      }]}>
        <Pressable
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={handleFabPress}
          style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Ripple layer */}
          <Animated.View style={[rippleStyle, {
            position: 'absolute',
            width: 58, height: 58, borderRadius: 20,
            backgroundColor: '#fff',
          }]} />
          {/* FAB background */}
          <View style={{
            width: 58, height: 58, borderRadius: 20,
            backgroundColor: '#10b981',
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
