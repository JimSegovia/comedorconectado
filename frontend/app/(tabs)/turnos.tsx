import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring, Easing, interpolate,
} from 'react-native-reanimated';

// ─── Reusable Animated FAB ────────────────────────────────────────────────────
function AnimatedFAB({ onPress }: { onPress: () => void }) {
  const fabScale = useSharedValue(0);
  const fabRotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    fabScale.value = withDelay(150, withSpring(1, { damping: 18, stiffness: 250 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(fabRotation.value, [0, 1], [0, 45])}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handlePressIn = () => {
    fabRotation.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    rippleScale.value = 0; rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(2.4, { duration: 400, easing: Easing.out(Easing.quad) });
    rippleOpacity.value = withTiming(0, { duration: 400 });
  };
  const handlePressOut = () => {
    fabRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  return (
    <Animated.View style={[containerStyle, { position: 'absolute', bottom: 24, right: 24 }]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}
        style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[rippleStyle, {
          position: 'absolute', width: 58, height: 58, borderRadius: 20, backgroundColor: '#fff',
        }]} />
        <View style={{
          width: 58, height: 58, borderRadius: 20, backgroundColor: '#10b981',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
        }}>
          <Animated.View style={iconStyle}>
            <MaterialIcons name="add" size={28} color="white" />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(d: Date) {
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function TurnosScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 24)); // May 24 2025
  const [showPicker, setShowPicker] = useState(false);

  const turnos = [
    { id: '1', horario: 'Mañana', horas: '7:00 a. m. - 12:00 p. m.', programados: 5, asistieron: 4, porcentaje: 80, color: '#f59e0b' },
    { id: '2', horario: 'Tarde', horas: '12:00 p. m. - 5:00 p. m.', programados: 6, asistieron: 6, porcentaje: 100, color: '#10b981' },
    { id: '3', horario: 'Noche', horas: '5:00 p. m. - 9:00 p. m.', programados: 4, asistieron: 2, porcentaje: 50, color: '#ef4444' },
  ];

  const filters = ['todos', 'Mañana', 'Tarde', 'Noche'];

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const goToPrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goToNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  // Inline minimal calendar modal
  const CalendarModal = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => {
      const d = new Date(year, month - 1, 1);
      setCurrentDate(d);
    };
    const nextMonth = () => {
      const d = new Date(year, month + 1, 1);
      setCurrentDate(d);
    };

    return (
      <Pressable onPress={() => setShowPicker(false)} style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Pressable onPress={e => e.stopPropagation()} style={{
          backgroundColor: '#fff', borderRadius: 24, padding: 20,
          width: 320, shadowColor: '#000', shadowOpacity: 0.2,
          shadowRadius: 20, elevation: 12,
        }}>
          {/* Month header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Pressable onPress={prevMonth} style={{ padding: 8 }}>
              <MaterialIcons name="chevron-left" size={24} color="#374151" />
            </Pressable>
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#1f2937', textTransform: 'capitalize' }}>
              {MONTHS_ES[month]} {year}
            </Text>
            <Pressable onPress={nextMonth} style={{ padding: 8 }}>
              <MaterialIcons name="chevron-right" size={24} color="#374151" />
            </Pressable>
          </View>

          {/* Day labels */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DAYS_ES.map(d => (
              <Text key={d} style={{
                flex: 1, textAlign: 'center', fontSize: 11,
                fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase',
              }}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((day, i) => {
              const isSelected = day === currentDate.getDate() && month === currentDate.getMonth();
              return (
                <Pressable key={i} onPress={() => {
                  if (!day) return;
                  setCurrentDate(new Date(year, month, day));
                  setShowPicker(false);
                }} style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                  {day ? (
                    <View style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: isSelected ? '#10b981' : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{
                        fontWeight: isSelected ? '800' : '500',
                        color: isSelected ? '#fff' : '#374151', fontSize: 14,
                      }}>{day}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => setShowPicker(false)} style={{
            marginTop: 16, paddingVertical: 12, alignItems: 'center',
            borderRadius: 14, backgroundColor: '#f3f4f6',
          }}>
            <Text style={{ fontWeight: '700', color: '#6b7280' }}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {showPicker && <CalendarModal />}

      {/* Date Header */}
      <View style={{
        backgroundColor: '#fff', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Pressable onPress={goToPrevDay} style={{
          padding: 8, borderRadius: 12, backgroundColor: '#f9fafb',
          borderWidth: 1, borderColor: '#f0f0f0',
        }}>
          <MaterialIcons name="chevron-left" size={24} color="#1f2937" />
        </Pressable>

        <Pressable onPress={() => setShowPicker(true)} style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 14, paddingVertical: 8,
          backgroundColor: '#ecfdf5', borderRadius: 14,
        }}>
          <MaterialIcons name="calendar-today" size={16} color="#10b981" />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#059669' }}>
            {formatDate(currentDate)}
          </Text>
        </Pressable>

        <Pressable onPress={goToNextDay} style={{
          padding: 8, borderRadius: 12, backgroundColor: '#f9fafb',
          borderWidth: 1, borderColor: '#f0f0f0',
        }}>
          <MaterialIcons name="chevron-right" size={24} color="#1f2937" />
        </Pressable>
      </View>

      {/* Filters */}
      <View style={{
        backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
        flexDirection: 'row', gap: 8,
      }}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setActiveFilter(f)} style={{
            backgroundColor: activeFilter === f ? '#10b981' : '#fff',
            paddingHorizontal: 14, paddingVertical: 6,
            borderRadius: 20, marginTop: 8, borderWidth: 1,
            borderColor: activeFilter === f ? '#10b981' : '#e5e7eb',
          }}>
            <Text style={{
              color: activeFilter === f ? '#fff' : '#374151',
              fontWeight: '600', fontSize: 13,
            }}>{f === 'todos' ? 'Todos' : f}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 110 }}>
        {turnos.map((turno, index) => (
          <Animated.View key={turno.id} entering={FadeInDown.delay(index * 100).duration(350)}>
            <Card onPress={() => router.push(`/turnos/${turno.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: turno.color, marginRight: 8 }} />
                    <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 17 }}>{turno.horario}</Text>
                  </View>
                  <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{turno.horas}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="people" size={16} color="#9ca3af" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>
                      {turno.asistieron}/{turno.programados} asistieron
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    width: 60, height: 60, borderRadius: 30,
                    borderWidth: 4, borderColor: getProgressColor(turno.porcentaje),
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: getProgressColor(turno.porcentaje) + '10',
                  }}>
                    <Text style={{ color: getProgressColor(turno.porcentaje), fontWeight: '800', fontSize: 14 }}>
                      {turno.porcentaje}%
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      <AnimatedFAB onPress={() => router.push('/turnos/nuevo')} />
    </View>
  );
}
