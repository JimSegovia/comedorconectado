import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useDashboard } from '@/hooks/useDashboard';

// Animated stat card with entrance
const StatCard = ({ icon, iconColor, iconBg, label, value, subtitle, delay, linkTo }: {
  icon: string; iconColor: string; iconBg: string;
  label: string; value: string; subtitle?: string;
  delay: number; linkTo?: string;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const easing = Easing.out(Easing.quad);
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animStyle, { width: '48%' }]}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: iconBg,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 8,
          }}>
            <MaterialIcons name={icon as any} size={18} color={iconColor} />
          </View>
          <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', flex: 1 }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 2 }}>{value}</Text>
        {subtitle && (
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>{subtitle}</Text>
        )}
        {linkTo && (
          <Link href={linkTo as any} asChild>
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginTop: 4 }}>Ver detalle →</Text>
          </Link>
        )}
      </Card>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { resumen, loading, error, refetch } = useDashboard();

  // Menu card entrance
  const menuOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(30);

  useEffect(() => {
    const easing = Easing.out(Easing.quad);
    menuOpacity.value = withDelay(500, withTiming(1, { duration: 500, easing }));
    menuTranslateY.value = withDelay(500, withTiming(0, { duration: 500, easing }));
  }, []);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }],
  }));

  const voluntariosActivos = resumen?.voluntarios_activos ?? 0;
  const turnosHoy = resumen?.turnos_hoy ?? 0;
  const ingredientes = resumen?.ingredientes_disponibles ?? 0;
  const asistenciasConf = resumen?.asistencias_hoy?.confirmadas ?? 0;
  const ultimoMenu = resumen?.ultimo_menu;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="wifi-off" size={48} color="#ef4444" />
        <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 18, marginTop: 16 }}>Sin conexión</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{error}</Text>
        <Pressable onPress={refetch} style={{ marginTop: 20, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {/* Greeting */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: '#9ca3af', fontWeight: '500' }}>Bienvenido de vuelta 👋</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1f2937' }}>Panel de Control</Text>
      </View>

      {/* Stat Cards Grid with stagger */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <StatCard
          icon="people" iconColor="#10b981" iconBg="#ecfdf5"
          label="Voluntarios activos" value={String(voluntariosActivos)}
          delay={0} linkTo="/(tabs)/voluntarios"
        />
        <StatCard
          icon="event" iconColor="#f59e0b" iconBg="#fffbeb"
          label="Turnos hoy" value={String(turnosHoy)}
          delay={100} linkTo="/(tabs)/turnos"
        />
        <StatCard
          icon="eco" iconColor="#10b981" iconBg="#ecfdf5"
          label="Ingredientes" value={String(ingredientes)}
          delay={200} linkTo="/(tabs)/inventario"
        />
        <StatCard
          icon="check-circle" iconColor="#3b82f6" iconBg="#eff6ff"
          label="Asistencias hoy" value={String(asistenciasConf)} subtitle="Confirmadas"
          delay={300}
        />
      </View>

      {/* Menu Section */}
      <Animated.View style={menuStyle}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 4, marginTop: 8 }}>Último menú generado</Text>

        {ultimoMenu ? (
          <Card onPress={() => router.push('/(tabs)/menu')}>
            {/* Menu Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#ecfdf5', borderRadius: 14,
              padding: 12, marginBottom: 16, marginHorizontal: -4, marginTop: -4,
            }}>
              <View style={{
                backgroundColor: '#d1fae5', width: 40, height: 40,
                borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <MaterialIcons name="restaurant-menu" size={22} color="#10b981" />
              </View>
              <Text style={{ color: '#059669', fontWeight: '800', fontSize: 16 }}>Menú del día</Text>
            </View>

            {/* Menu Items */}
            {[
              { label: 'Entrada', dish: ultimoMenu.entrada },
              { label: 'Plato principal', dish: ultimoMenu.plato_principal },
              { label: 'Bebida', dish: ultimoMenu.bebida },
            ].map((item, i) => (
              item.dish ? (
                <View key={i}>
                  <View style={{ paddingVertical: 8 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</Text>
                    <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 15 }}>{item.dish}</Text>
                  </View>
                  {i < 2 && <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
                </View>
              ) : null
            ))}

            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 12 }}>Ver detalle completo →</Text>
          </Card>
        ) : (
          <Card onPress={() => router.push('/(tabs)/menu')}>
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <MaterialIcons name="restaurant-menu" size={36} color="#d1d5db" />
              <Text style={{ color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>No hay menú generado aún</Text>
              <Text style={{ color: '#10b981', fontWeight: '700', marginTop: 8 }}>Generar menú con IA →</Text>
            </View>
          </Card>
        )}
      </Animated.View>
    </ScrollView>
  );
}
