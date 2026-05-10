import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { useMenu } from '@/hooks/useDashboard';

export default function MenuScreen() {
  const router = useRouter();
  const { menu, historial, loading, historialLoading, error, generar } = useMenu();
  const [raciones, setRaciones] = useState('50');
  const [showForm, setShowForm] = useState(false);

  // If there's already a menu in historial, show it; otherwise show the generation form
  const hasMenu = menu !== null;

  // Pulse animation for the magic icon
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Result entrance animations
  const resultOpacity = useSharedValue(0);
  const resultTranslateY = useSharedValue(30);

  useEffect(() => {
    if (menu) {
      resultOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      resultTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    }
  }, [menu]);

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  const handleGenerar = async () => {
    const racionsNum = parseInt(raciones, 10);
    if (isNaN(racionsNum) || racionsNum <= 0) {
      Alert.alert('Error', 'Ingresa un número válido de raciones.');
      return;
    }
    try {
      await generar(racionsNum);
      setShowForm(false);
    } catch (e: any) {
      Alert.alert('Error al generar', e.message ?? 'Inténtalo de nuevo.');
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Fecha desconocida';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  if (historialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>Cargando menú...</Text>
      </View>
    );
  }

  if (!hasMenu || showForm) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 20, alignItems: 'center', justifyContent: 'center' }}>
        
        <Animated.View style={pulseStyle}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: '#ecfdf5',
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <MaterialCommunityIcons name="magic-staff" size={40} color="#10b981" />
          </View>
        </Animated.View>
        
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
          Generar menú con IA
        </Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 16, lineHeight: 20 }}>
          Groq/LLaMA 3 generará un menú saludable basado en los ingredientes disponibles en el inventario.
        </Text>

        <Card>
          <Text style={{ fontWeight: '800', color: '#1f2937', marginBottom: 10 }}>¿Cuántas raciones?</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#f9fafb', borderRadius: 14,
            borderWidth: 1, borderColor: '#f0f0f0',
            paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <MaterialIcons name="people" size={20} color="#10b981" style={{ marginRight: 10 }} />
            <TextInput
              value={raciones}
              onChangeText={setRaciones}
              keyboardType="numeric"
              style={{ flex: 1, color: '#1f2937', fontSize: 18, fontWeight: '700' }}
              placeholder="50"
              placeholderTextColor="#9ca3af"
            />
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>raciones</Text>
          </View>
        </Card>

        {error && (
          <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginTop: 8, width: '100%' }}>
            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <View style={{ width: '100%', marginTop: 8 }}>
          <Button
            title="Generar menú"
            onPress={handleGenerar}
            isLoading={loading}
            className="w-full"
          />
        </View>

        {hasMenu && (
          <Pressable onPress={() => setShowForm(false)} style={{ marginTop: 12 }}>
            <Text style={{ color: '#9ca3af', fontWeight: '600' }}>← Ver último menú</Text>
          </Pressable>
        )}
        
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
          La generación puede tardar unos segundos.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      
      {/* Header Image */}
      <View style={{ height: 180, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="restaurant" size={64} color="#10b981" />
        <Pressable
          onPress={() => router.push('/menu/historial' as any)}
          style={{
            position: 'absolute', top: 16, right: 16,
            backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 12,
          }}
        >
          <MaterialIcons name="history" size={24} color="#10b981" />
        </Pressable>
      </View>

      <Animated.View style={[resultStyle, { padding: 16, marginTop: -20 }]}>
        <Card>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>Menú del día</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>
            {formatDate(menu?.fecha_generacion)}
          </Text>
          <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>
            {menu?.raciones_estimadas} raciones estimadas
          </Text>

          {[
            { label: 'Entrada', dish: menu?.entrada, icon: 'bowl-mix' },
            { label: 'Plato principal', dish: menu?.plato_principal, icon: 'food' },
            { label: 'Bebida', dish: menu?.bebida, icon: 'cup-water' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < 2 ? 16 : 0 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: '#ecfdf5',
                alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2,
              }}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</Text>
                <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 15 }}>{item.dish}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Ingredients used */}
        {menu?.ingredientes_usados && menu.ingredientes_usados.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 10 }}>Ingredientes usados</Text>
            <Card>
              <Text style={{ color: '#374151', fontSize: 13, lineHeight: 22 }}>
                {menu.ingredientes_usados.join(', ')}
              </Text>
            </Card>
          </>
        )}

        {/* Recommendations */}
        {menu?.recomendaciones && menu.recomendaciones.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 10 }}>Recomendaciones</Text>
            {menu.recomendaciones.map((rec, i) => (
              <Card key={i}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: '#fffbeb',
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                  </View>
                  <Text style={{ flex: 1, color: '#92400e', fontSize: 13, lineHeight: 19 }}>{rec}</Text>
                </View>
              </Card>
            ))}
          </>
        )}
        
        {/* Generate new */}
        <Pressable
          onPress={() => setShowForm(true)}
          style={{
            marginTop: 8, marginBottom: 32, paddingVertical: 14,
            alignItems: 'center', borderWidth: 2,
            borderColor: '#10b981', borderRadius: 16,
          }}
        >
          <Text style={{ color: '#10b981', fontWeight: '800' }}>Generar nuevo menú</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
