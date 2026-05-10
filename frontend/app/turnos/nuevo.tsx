import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NuevoTurnoScreen() {
  const router = useRouter();
  const [fecha, setFecha] = useState('2025-05-25');
  const [horario, setHorario] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const horarios = [
    { key: 'Mañana' as const, horas: '7:00 - 12:00', icon: 'wb-sunny', color: '#f59e0b' },
    { key: 'Tarde' as const, horas: '12:00 - 17:00', icon: 'wb-cloudy', color: '#3b82f6' },
    { key: 'Noche' as const, horas: '17:00 - 21:00', icon: 'nightlight-round', color: '#8b5cf6' },
  ];

  const voluntariosDisponibles = [
    { id: '1', nombre: 'Juan Pérez', iniciales: 'JP' },
    { id: '2', nombre: 'María Gómez', iniciales: 'MG' },
    { id: '3', nombre: 'Carlos Silva', iniciales: 'CS' },
    { id: '4', nombre: 'Ana Torres', iniciales: 'AT' },
    { id: '5', nombre: 'Pedro López', iniciales: 'PL' },
  ];

  const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const toggleVoluntario = (id: string) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(s => s !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const handleCrear = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Date */}
        <Animated.View entering={FadeInDown.delay(0).duration(300)}>
          <View style={{
            backgroundColor: '#fff', padding: 20, borderRadius: 20,
            borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
          }}>
            <Input
              label="Fecha del turno"
              placeholder="YYYY-MM-DD"
              value={fecha}
              onChangeText={setFecha}
            />
          </View>
        </Animated.View>

        {/* Time Slot */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>
            Horario
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {horarios.map(h => {
              const isSelected = horario === h.key;
              return (
                <Pressable
                  key={h.key}
                  onPress={() => setHorario(h.key)}
                  style={{
                    flex: 1, paddingVertical: 14, alignItems: 'center',
                    borderRadius: 16, borderWidth: 2,
                    backgroundColor: isSelected ? h.color + '12' : '#fff',
                    borderColor: isSelected ? h.color : '#e5e7eb',
                  }}
                >
                  <MaterialIcons name={h.icon as any} size={24} color={isSelected ? h.color : '#9ca3af'} />
                  <Text style={{
                    fontWeight: '800', fontSize: 13, color: isSelected ? h.color : '#6b7280',
                    marginTop: 4,
                  }}>{h.key}</Text>
                  <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{h.horas}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Volunteers */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
            Asignar voluntarios
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 12 }}>
            {seleccionados.length} seleccionados
          </Text>

          {voluntariosDisponibles.map((vol, index) => {
            const isSelected = seleccionados.includes(vol.id);
            return (
              <Pressable key={vol.id} onPress={() => toggleVoluntario(vol.id)}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: avatarColors[index % 5] + '18',
                      alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      <Text style={{ color: avatarColors[index % 5], fontWeight: '800', fontSize: 14 }}>{vol.iniciales}</Text>
                    </View>
                    <Text style={{ flex: 1, color: '#1f2937', fontWeight: '600', fontSize: 15 }}>{vol.nombre}</Text>
                    <View style={{
                      width: 28, height: 28, borderRadius: 8,
                      backgroundColor: isSelected ? '#10b981' : '#f3f4f6',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: isSelected ? 0 : 1.5, borderColor: '#d1d5db',
                    }}>
                      {isSelected && <MaterialIcons name="check" size={18} color="#fff" />}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(300)}>
          <Button 
            title={`Crear turno (${seleccionados.length} voluntarios)`}
            onPress={handleCrear}
            className="w-full"
            disabled={seleccionados.length === 0}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
