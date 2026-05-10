import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, FadeInDown } from 'react-native-reanimated';
import { inventarioApi, UnidadMedida } from '@/services/api';

export default function NuevoIngredienteScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState<UnidadMedida>('kg');
  const [disponible, setDisponible] = useState(true);
  const [saving, setSaving] = useState(false);

  const unidades: { key: UnidadMedida; label: string; icon: string }[] = [
    { key: 'kg', label: 'kg', icon: 'weight-kilogram' },
    { key: 'g', label: 'g', icon: 'weight' },
    { key: 'L', label: 'L', icon: 'cup-water' },
    { key: 'ml', label: 'ml', icon: 'water' },
    { key: 'und', label: 'Und.', icon: 'numeric' },
  ];

  // Icon entrance
  const iconScale = useSharedValue(0);
  useEffect(() => {
    iconScale.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }));
  }, []);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    const cantNum = parseFloat(cantidad);
    if (isNaN(cantNum) || cantNum < 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida.');
      return;
    }
    setSaving(true);
    try {
      await inventarioApi.crear({
        nombre: nombre.trim(),
        cantidad: cantNum,
        unidad,
        estado: disponible ? 'disponible' : 'agotado',
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error al guardar', e.message ?? 'Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Icon Placeholder */}
        <Animated.View style={[iconStyle, { alignItems: 'center', marginBottom: 24, marginTop: 16 }]}>
          <Pressable style={{
            width: 96, height: 96, borderRadius: 24,
            backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#fef3c7', borderStyle: 'dashed',
          }}>
            <MaterialCommunityIcons name="food-apple" size={40} color="#f59e0b" />
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
              label="Nombre del ingrediente"
              placeholder="Ej. Arroz"
              value={nombre}
              onChangeText={setNombre}
            />
            
            <Input 
              label="Cantidad"
              placeholder="Ej. 10"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
            />

            <Text style={{ color: '#1f2937', fontWeight: '600', marginBottom: 10, marginLeft: 2, marginTop: 8 }}>
              Unidad de medida
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {unidades.map(u => {
                const isSelected = unidad === u.key;
                return (
                  <Pressable 
                    key={u.key}
                    onPress={() => setUnidad(u.key)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10,
                      borderRadius: 14, borderWidth: 1.5,
                      backgroundColor: isSelected ? '#10b981' : '#fff',
                      borderColor: isSelected ? '#10b981' : '#e5e7eb',
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={u.icon as any} size={16} 
                      color={isSelected ? '#fff' : '#6b7280'} 
                    />
                    <Text style={{
                      color: isSelected ? '#fff' : '#6b7280',
                      fontWeight: '700', fontSize: 13,
                    }}>{u.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: '#1f2937', fontWeight: '600', marginBottom: 10, marginLeft: 2 }}>
              Estado
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Pressable 
                onPress={() => setDisponible(true)}
                style={{
                  flex: 1, paddingVertical: 12, alignItems: 'center',
                  borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
                  backgroundColor: disponible ? '#10b981' : '#f9fafb',
                  borderWidth: 1.5, borderColor: disponible ? '#10b981' : '#e5e7eb',
                }}
              >
                <Text style={{ fontWeight: '700', color: disponible ? '#fff' : '#6b7280' }}>Disponible</Text>
              </Pressable>
              <Pressable 
                onPress={() => setDisponible(false)}
                style={{
                  flex: 1, paddingVertical: 12, alignItems: 'center',
                  borderTopRightRadius: 14, borderBottomRightRadius: 14,
                  backgroundColor: !disponible ? '#ef4444' : '#f9fafb',
                  borderWidth: 1.5, borderLeftWidth: 0,
                  borderColor: !disponible ? '#ef4444' : '#e5e7eb',
                }}
              >
                <Text style={{ fontWeight: '700', color: !disponible ? '#fff' : '#6b7280' }}>Agotado</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Button 
            title="Guardar ingrediente" 
            onPress={handleGuardar}
            isLoading={saving}
            className="w-full"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
