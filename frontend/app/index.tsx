import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Staggered entrance animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);

  useEffect(() => {
    const easing = Easing.out(Easing.quad);
    // Logo
    logoOpacity.value = withTiming(1, { duration: 600, easing });
    logoScale.value = withTiming(1, { duration: 600, easing });
    // Title (delay 200ms)
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    titleTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing }));
    // Form (delay 400ms)
    formOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing }));
    formTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Animated Logo */}
        <Animated.View style={logoStyle} className="items-center mb-6">
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: '#ecfdf5',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <MaterialIcons name="volunteer-activism" size={48} color="#10b981" />
          </View>
        </Animated.View>

        {/* Animated Title */}
        <Animated.View style={titleStyle} className="items-center mb-10">
          <Text style={{ fontSize: 30, fontWeight: '800', color: '#10b981', textAlign: 'center', marginBottom: 6 }}>
            Comedor Conectado
          </Text>
          <Text style={{ color: '#9ca3af', textAlign: 'center', fontSize: 15 }}>
            Inicia sesión para continuar
          </Text>
        </Animated.View>

        {/* Animated Form */}
        <Animated.View style={formStyle}>
          <Input 
            label="Correo electrónico"
            placeholder="admin@comedor.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <Input 
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>Recordarme</Text>
            <Text style={{ color: '#10b981', fontWeight: '500', fontSize: 13 }}>¿Olvidaste tu contraseña?</Text>
          </View>

          <Button 
            title="Iniciar sesión" 
            onPress={handleLogin}
            className="w-full mb-6"
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <Text style={{ marginHorizontal: 16, color: '#9ca3af' }}>o continuar con</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </View>

          <Button 
            title="Continuar con Google" 
            variant="outline"
            className="w-full"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
