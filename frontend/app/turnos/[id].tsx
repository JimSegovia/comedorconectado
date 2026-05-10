import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Asistencia = 'Asistió' | 'No asistió' | 'Pendiente';

export default function DetalleTurnoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [voluntarios, setVoluntarios] = useState([
    { id: '1', nombre: 'Juan Pérez', iniciales: 'JP', asistencia: 'Asistió' as Asistencia },
    { id: '2', nombre: 'María Gómez', iniciales: 'MG', asistencia: 'Asistió' as Asistencia },
    { id: '3', nombre: 'Carlos Silva', iniciales: 'CS', asistencia: 'No asistió' as Asistencia },
    { id: '4', nombre: 'Ana Torres', iniciales: 'AT', asistencia: 'Pendiente' as Asistencia },
  ]);

  const toggleAsistencia = (volId: string) => {
    setVoluntarios(vols => vols.map(vol => {
      if (vol.id === volId) {
        const cycle: Asistencia[] = ['Asistió', 'No asistió', 'Pendiente'];
        const idx = cycle.indexOf(vol.asistencia);
        return { ...vol, asistencia: cycle[(idx + 1) % 3] };
      }
      return vol;
    }));
  };

  const getColor = (estado: Asistencia) => {
    if (estado === 'Asistió') return '#10b981';
    if (estado === 'No asistió') return '#ef4444';
    return '#f59e0b';
  };

  const getIcon = (estado: Asistencia): keyof typeof MaterialIcons.glyphMap => {
    if (estado === 'Asistió') return 'check-circle';
    if (estado === 'No asistió') return 'cancel';
    return 'schedule';
  };

  const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
  const asistieron = voluntarios.filter(v => v.asistencia === 'Asistió').length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Summary */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={{
            backgroundColor: '#ecfdf5', borderRadius: 20, padding: 20, marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>Mañana</Text>
              <Badge label="En curso" variant="success" />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>7:00 a. m. - 12:00 p. m.</Text>
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="calendar-today" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>24 de mayo, 2025</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="people" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>{asistieron}/{voluntarios.length}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>
          Voluntarios asignados
        </Text>

        {voluntarios.map((vol, index) => (
          <Animated.View key={vol.id} entering={FadeInDown.delay(100 + index * 80).duration(300)}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: avatarColors[index % 4] + '18',
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    <Text style={{ color: avatarColors[index % 4], fontWeight: '800', fontSize: 15 }}>
                      {vol.iniciales}
                    </Text>
                  </View>
                  <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 15 }}>{vol.nombre}</Text>
                </View>
                
                <Pressable 
                  onPress={() => toggleAsistencia(vol.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: getColor(vol.asistencia) + '15',
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                  }}
                >
                  <MaterialIcons name={getIcon(vol.asistencia)} size={18} color={getColor(vol.asistencia)} style={{ marginRight: 4 }} />
                  <Text style={{ fontWeight: '700', fontSize: 12, color: getColor(vol.asistencia) }}>
                    {vol.asistencia}
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{
        position: 'absolute', bottom: 0, width: '100%',
        padding: 16, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
      }}>
        <Button 
          title="Guardar asistencia" 
          onPress={() => router.back()}
          className="w-full"
        />
      </View>
    </View>
  );
}
