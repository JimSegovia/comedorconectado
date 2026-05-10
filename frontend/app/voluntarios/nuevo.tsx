import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, FadeInDown } from 'react-native-reanimated';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function NuevoVoluntarioScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);

  // Avatar entrance
  const avatarScale = useSharedValue(0);
  useEffect(() => {
    avatarScale.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }));
  }, []);
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const toggleDia = (dia: string) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, dia]);
    }
  };

  const handleGuardar = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Avatar Placeholder */}
        <Animated.View style={[avatarStyle, { alignItems: 'center', marginBottom: 24, marginTop: 16 }]}>
          <Pressable style={{
            width: 96, height: 96, borderRadius: 32,
            backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#d1fae5', borderStyle: 'dashed',
          }}>
            <MaterialIcons name="add-a-photo" size={32} color="#10b981" />
          </Pressable>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Toca para agregar foto</Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={{
            backgroundColor: '#fff', padding: 20, borderRadius: 20,
            borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
          }}>
            <Input 
              label="Nombre completo"
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChangeText={setNombre}
            />
            
            <Input 
              label="Teléfono"
              placeholder="Ej. 999 888 777"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />

            <Text style={{ color: '#1f2937', fontWeight: '600', marginBottom: 10, marginLeft: 2, marginTop: 8 }}>
              Disponibilidad
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {DIAS.map(dia => {
                const isSelected = diasSeleccionados.includes(dia);
                return (
                  <Pressable 
                    key={dia}
                    onPress={() => toggleDia(dia)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8,
                      borderRadius: 12, borderWidth: 1.5,
                      backgroundColor: isSelected ? '#10b981' : '#fff',
                      borderColor: isSelected ? '#10b981' : '#e5e7eb',
                    }}
                  >
                    <Text style={{
                      color: isSelected ? '#fff' : '#6b7280',
                      fontWeight: '700', fontSize: 13,
                    }}>{dia}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: '#1f2937', fontWeight: '600', marginBottom: 10, marginLeft: 2 }}>
              Estado
            </Text>
            <View style={{ flexDirection: 'row', gap: 0 }}>
              <Pressable 
                onPress={() => setActivo(true)}
                style={{
                  flex: 1, paddingVertical: 12, alignItems: 'center',
                  borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
                  backgroundColor: activo ? '#10b981' : '#f9fafb',
                  borderWidth: 1.5, borderColor: activo ? '#10b981' : '#e5e7eb',
                }}
              >
                <Text style={{ fontWeight: '700', color: activo ? '#fff' : '#6b7280' }}>Activo</Text>
              </Pressable>
              <Pressable 
                onPress={() => setActivo(false)}
                style={{
                  flex: 1, paddingVertical: 12, alignItems: 'center',
                  borderTopRightRadius: 14, borderBottomRightRadius: 14,
                  backgroundColor: !activo ? '#ef4444' : '#f9fafb',
                  borderWidth: 1.5, borderLeftWidth: 0,
                  borderColor: !activo ? '#ef4444' : '#e5e7eb',
                }}
              >
                <Text style={{ fontWeight: '700', color: !activo ? '#fff' : '#6b7280' }}>Inactivo</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Button 
            title="Guardar voluntario" 
            onPress={handleGuardar}
            className="w-full"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
