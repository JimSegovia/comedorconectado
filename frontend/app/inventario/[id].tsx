import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, FadeInDown } from 'react-native-reanimated';
import { inventarioApi, UnidadMedida } from '@/services/api';

export default function EditarIngredienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState<UnidadMedida>('kg');
  const [disponible, setDisponible] = useState(true);

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
    iconScale.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.3)) }));
  }, []);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Load ingredient data
  useEffect(() => {
    if (!id) return;
    inventarioApi.obtener(id)
      .then(item => {
        setNombre(item.nombre);
        setCantidad(String(item.cantidad));
        setUnidad(item.unidad);
        setDisponible(item.estado === 'disponible');
      })
      .catch(e => Alert.alert('Error', e.message ?? 'No se pudo cargar el ingrediente'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGuardar = async () => {
    const cantNum = parseFloat(cantidad);
    if (isNaN(cantNum) || cantNum < 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida.');
      return;
    }
    setSaving(true);
    try {
      await inventarioApi.actualizar(id, {
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

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar ingrediente',
      `¿Estás seguro de que deseas eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              await inventarioApi.eliminar(id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo eliminar');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {/* Icon Header */}
      <Animated.View style={[iconStyle, { alignItems: 'center', marginTop: 8, marginBottom: 24 }]}>
        <View style={{
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: '#f59e0b15', alignItems: 'center', justifyContent: 'center',
        }}>
          <MaterialCommunityIcons name="food-apple" size={36} color="#f59e0b" />
        </View>
        <Badge label={disponible ? 'Disponible' : 'Agotado'} variant={disponible ? 'success' : 'danger'} />
      </Animated.View>

      {/* Edit Form */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>Editar ingrediente</Text>
          
          <Input 
            label="Nombre"
            placeholder="Ej. Arroz"
            value={nombre}
            onChangeText={setNombre}
          />
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="Cantidad"
                placeholder="10"
                keyboardType="numeric"
                value={cantidad}
                onChangeText={setCantidad}
              />
            </View>
          </View>

          <Text style={{ color: '#1f2937', fontWeight: '600', marginBottom: 10, marginLeft: 2, marginTop: 4 }}>
            Unidad
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {unidades.map(u => {
              const isSelected = unidad === u.key;
              return (
                <Pressable 
                  key={u.key}
                  onPress={() => setUnidad(u.key)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 12, borderWidth: 1.5,
                    backgroundColor: isSelected ? '#10b981' : '#fff',
                    borderColor: isSelected ? '#10b981' : '#e5e7eb',
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}
                >
                  <MaterialCommunityIcons 
                    name={u.icon as any} size={14} 
                    color={isSelected ? '#fff' : '#6b7280'} 
                  />
                  <Text style={{
                    color: isSelected ? '#fff' : '#6b7280',
                    fontWeight: '700', fontSize: 12,
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
        </Card>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(350).duration(300)}>
        <View style={{ gap: 10 }}>
          <Button title="Guardar cambios" onPress={handleGuardar} isLoading={saving} className="w-full" />
          <Pressable
            onPress={handleEliminar}
            style={{
              paddingVertical: 14, alignItems: 'center',
              borderRadius: 16, borderWidth: 2, borderColor: '#fecaca',
              backgroundColor: '#fef2f2',
            }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '800' }}>Eliminar ingrediente</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
