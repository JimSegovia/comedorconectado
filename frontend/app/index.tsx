import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, useWindowDimensions, ImageBackground,
  Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';

// ─── Hero panel (left side) ───────────────────────────────────────────────────
function HeroPanel() {
  const slideIn = useSharedValue(-40);
  const fade = useSharedValue(0);
  useEffect(() => {
    slideIn.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    fade.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: slideIn.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#064e3b', overflow: 'hidden', position: 'relative' }}>
      {/* Background image */}
      <Image
        source={require('../assets/images/login-hero.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(6, 78, 59, 0.72)',
      }} />

      {/* Content */}
      <Animated.View style={[animStyle, {
        flex: 1, justifyContent: 'flex-end', padding: 48,
      }]}>
        {/* Logo mark */}
        <View style={{
          width: 64, height: 64, borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
        }}>
          <MaterialIcons name="volunteer-activism" size={34} color="#fff" />
        </View>

        <Text style={{
          fontSize: 36, fontWeight: '800', color: '#fff',
          lineHeight: 44, marginBottom: 16,
        }}>
          Conecta tu{'\n'}comedor social
        </Text>

        <Text style={{
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 26, maxWidth: 340, marginBottom: 40,
        }}>
          Gestiona voluntarios, turnos, inventario y menús con inteligencia artificial. Todo en un solo lugar.
        </Text>

        {/* Stats row */}
        {[
          { icon: 'people', value: '200+', label: 'Voluntarios' },
          { icon: 'restaurant', value: '500+', label: 'Raciones/día' },
          { icon: 'auto-awesome', value: 'IA', label: 'Menús con IA' },
        ].map((stat, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}>
              <MaterialIcons name={stat.icon as any} size={18} color="#6ee7b7" />
            </View>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 6 }}>{stat.value}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Login form (right side) ──────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form entrance
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(24);
  useEffect(() => {
    formOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    formTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, []);
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleLogin = () => router.replace('/(tabs)');

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#f9fafb' }}>

      {/* ── Left hero panel (desktop only) ── */}
      {isWide && <HeroPanel />}

      {/* ── Right: login form ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: isWide ? 460 : '100%', backgroundColor: '#fff' }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 48,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={formStyle}>

            {/* Mobile logo (shown only on narrow screens) */}
            {!isWide && (
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{
                  width: 72, height: 72, borderRadius: 22,
                  backgroundColor: '#ecfdf5',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <MaterialIcons name="volunteer-activism" size={38} color="#10b981" />
                </View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#10b981' }}>Comedor Conectado</Text>
              </View>
            )}

            {/* Heading */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6 }}>
              Bienvenido de vuelta
            </Text>
            <Text style={{ fontSize: 15, color: '#6b7280', marginBottom: 36, lineHeight: 22 }}>
              Ingresa tus credenciales para acceder al panel.
            </Text>

            {/* Email */}
            <View style={{ marginBottom: 4 }}>
              <Input
                label="Correo electrónico"
                placeholder="admin@comedor.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 4 }}>
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Remember + Forgot */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 28, marginTop: 4,
            }}>
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>Recordarme</Text>
              <Pressable>
                <Text style={{ color: '#10b981', fontWeight: '600', fontSize: 13 }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>
            </View>

            {/* Login button */}
            <Button
              title="Iniciar sesión"
              onPress={handleLogin}
              className="w-full"
            />

            {/* Divider */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              marginVertical: 24,
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 14, color: '#9ca3af', fontSize: 13 }}>o continuar con</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            </View>

            {/* Google button */}
            <Button
              title="Continuar con Google"
              variant="outline"
              className="w-full"
            />

            {/* Footer */}
            <Text style={{
              textAlign: 'center', color: '#9ca3af',
              fontSize: 12, marginTop: 32, lineHeight: 18,
            }}>
              Al iniciar sesión aceptas nuestros{' '}
              <Text style={{ color: '#10b981', fontWeight: '600' }}>Términos de servicio</Text>
              {' '}y la{' '}
              <Text style={{ color: '#10b981', fontWeight: '600' }}>Política de privacidad</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
