import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withRepeat, withSequence, Easing } from 'react-native-reanimated';

export default function MenuScreen() {
  const [generado, setGenerado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Pulse animation for the magic icon
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite
      true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Result entrance animations
  const resultOpacity = useSharedValue(0);
  const resultTranslateY = useSharedValue(30);

  const handleGenerar = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setGenerado(true);
      // Trigger entrance animation
      resultOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      resultTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    }, 2000);
  };

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  if (!generado) {
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
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 16, lineHeight: 20 }}>
          La IA de Grok generará un menú saludable usando los ingredientes que tienes disponibles hoy.
        </Text>

        <Card>
          <Text style={{ fontWeight: '800', color: '#1f2937', marginBottom: 10 }}>Ingredientes disponibles (16)</Text>
          <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: 20 }}>
            Arroz, Pollo, Papa, Zanahoria, Aceite, Cebolla, Ajo, Tomate, Lentejas, Sal, Pimienta, Fideos, Atún, Huevos, Leche, Avena.
          </Text>
        </Card>

        <View style={{ width: '100%', marginTop: 8 }}>
          <Button 
            title="Generar menú" 
            onPress={handleGenerar}
            isLoading={isLoading}
            className="w-full"
          />
        </View>
        
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
          onPress={() => router.push('/menu/historial')}
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
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>24 de mayo, 2025 - 10:30 a. m.</Text>

          {[
            { label: 'Entrada', dish: 'Ensalada fresca de verduras', icon: 'bowl-mix' },
            { label: 'Plato principal', dish: 'Arroz con pollo y ensalada', icon: 'food' },
            { label: 'Bebida', dish: 'Chicha morada', icon: 'cup-water' },
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

        {/* Recommendations */}
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 10 }}>Recomendaciones</Text>
        <Card>
          <View style={{ flexDirection: 'row' }}>
            <View style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: '#fffbeb',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
            </View>
            <Text style={{ flex: 1, color: '#92400e', fontSize: 13, lineHeight: 19 }}>
              Usa primero ingredientes perecibles como el pollo y las verduras de la ensalada para evitar pérdidas.
            </Text>
          </View>
        </Card>
        
        {/* Reset */}
        <Pressable 
          onPress={() => {
            setGenerado(false);
            resultOpacity.value = 0;
            resultTranslateY.value = 30;
          }}
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
