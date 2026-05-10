import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { turnosApi, voluntariosApi, HorarioTurno, Voluntario } from '@/services/api';

export default function NuevoTurnoScreen() {
  const router = useRouter();
  const today = new Date();
  const [fecha, setFecha] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
  const [horario, setHorario] = useState<HorarioTurno>('mañana');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loadingVols, setLoadingVols] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    voluntariosApi.listar('activo')
      .then(res => setVoluntarios(res.data))
      .catch(() => {})
      .finally(() => setLoadingVols(false));
  }, []);

  const horarios: { key: HorarioTurno; label: string; horas: string; icon: string; color: string }[] = [
    { key: 'mañana', label: 'Mañana', horas: '08:00 - 12:00', icon: 'wb-sunny', color: '#f59e0b' },
    { key: 'tarde', label: 'Tarde', horas: '12:00 - 17:00', icon: 'wb-cloudy', color: '#3b82f6' },
    { key: 'noche', label: 'Noche', horas: '17:00 - 21:00', icon: 'nightlight-round', color: '#8b5cf6' },
  ];

  const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  function getInitials(nombre: string) {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  const toggleVoluntario = (id: string) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(s => s !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const handleCrear = async () => {
    if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Error', 'La fecha debe tener el formato YYYY-MM-DD.');
      return;
    }
    setSaving(true);
    try {
      await turnosApi.crear({
        fecha,
        horario,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        voluntarios_asignados: seleccionados,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error al crear turno', e.message ?? 'Inténtalo de nuevo.');
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
        
        {/* Date & Hours */}
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
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Hora inicio"
                  placeholder="08:00"
                  value={horaInicio}
                  onChangeText={setHoraInicio}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Hora fin"
                  placeholder="12:00"
                  value={horaFin}
                  onChangeText={setHoraFin}
                />
              </View>
            </View>
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
                  }}>{h.label}</Text>
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

          {loadingVols ? (
            <ActivityIndicator color="#10b981" style={{ marginVertical: 20 }} />
          ) : voluntarios.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#9ca3af', fontWeight: '600' }}>No hay voluntarios activos</Text>
            </View>
          ) : (
            voluntarios.map((vol, index) => {
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
                        <Text style={{ color: avatarColors[index % 5], fontWeight: '800', fontSize: 14 }}>
                          {getInitials(vol.nombre_completo)}
                        </Text>
                      </View>
                      <Text style={{ flex: 1, color: '#1f2937', fontWeight: '600', fontSize: 15 }}>{vol.nombre_completo}</Text>
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
            })
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(300)}>
          <Button 
            title={`Crear turno${seleccionados.length > 0 ? ` (${seleccionados.length} voluntarios)` : ''}`}
            onPress={handleCrear}
            isLoading={saving}
            className="w-full"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
