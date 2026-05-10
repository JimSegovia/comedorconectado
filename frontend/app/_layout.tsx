import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#10b981',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="voluntarios/nuevo" options={{ title: 'Nuevo Voluntario', presentation: 'modal' }} />
        <Stack.Screen name="voluntarios/[id]" options={{ title: 'Detalle del Voluntario' }} />
        <Stack.Screen name="voluntarios/editar" options={{ title: 'Editar Voluntario', presentation: 'modal' }} />
        <Stack.Screen name="turnos/[id]" options={{ title: 'Detalle del Turno' }} />
        <Stack.Screen name="turnos/nuevo" options={{ title: 'Nuevo Turno', presentation: 'modal' }} />
        <Stack.Screen name="inventario/nuevo" options={{ title: 'Nuevo Ingrediente', presentation: 'modal' }} />
        <Stack.Screen name="inventario/[id]" options={{ title: 'Editar Ingrediente' }} />
        <Stack.Screen name="menu/historial" options={{ title: 'Historial de Menús' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
