import { Tabs } from 'expo-router';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLargeScreen = width >= 768;

  // Custom Sidebar Component for Web/Large Screens
  const Sidebar = () => (
    <View className="w-64 bg-surface border-r border-border p-6 pt-10">
      <View className="flex-row items-center mb-10 px-2">
        <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center mr-3">
          <MaterialIcons name="volunteer-activism" size={24} color="white" />
        </View>
        <Text className="text-xl font-bold text-primary">Comedor</Text>
      </View>

      <View className="space-y-2">
        {[
          { name: 'index', label: 'Inicio', icon: 'home' as const, path: '/(tabs)' },
          { name: 'voluntarios', label: 'Voluntarios', icon: 'people' as const, path: '/voluntarios' },
          { name: 'turnos', label: 'Turnos', icon: 'event' as const, path: '/turnos' },
          { name: 'inventario', label: 'Inventario', icon: 'inventory' as const, path: '/inventario' },
          { name: 'menu', label: 'Menú IA', icon: 'restaurant-menu' as const, path: '/menu' },
        ].map((item) => {
          const isActive = pathname === item.path || (item.name === 'index' && (pathname === '/' || pathname === '/(tabs)'));
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center p-3.5 rounded-2xl ${isActive ? 'bg-primary/10' : ''}`}
            >
              <MaterialIcons 
                name={item.icon} 
                size={24} 
                color={isActive ? '#10b981' : '#6b7280'} 
              />
              <Text className={`font-bold ml-3 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto border-t border-border pt-6">
          <Pressable 
            onPress={() => router.replace('/')}
            className="flex-row items-center p-4 rounded-2xl bg-red-50"
          >
            <MaterialIcons name="logout" size={22} color="#ef4444" />
            <Text className="text-danger font-bold ml-3">Cerrar sesión</Text>
          </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column' }}>
      {isLargeScreen && <Sidebar />}
      
      <Tabs
        tabBar={isLargeScreen ? () => null : (props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: !isLargeScreen,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            color: '#1f2937',
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Dashboard' }}
        />
        <Tabs.Screen
          name="voluntarios"
          options={{ title: 'Voluntarios' }}
        />
        <Tabs.Screen
          name="turnos"
          options={{ title: 'Turnos' }}
        />
        <Tabs.Screen
          name="inventario"
          options={{ title: 'Inventario' }}
        />
        <Tabs.Screen
          name="menu"
          options={{ title: 'Menú Generado' }}
        />
      </Tabs>
    </View>
  );
}
