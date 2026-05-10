import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Animated Tab Item - same pattern as delete-it TabItem
const TabItem = ({
  label,
  iconName,
  isActive,
  onPress,
}: {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}) => {
  const activeColor = '#10b981';
  const inactiveColor = '#9ca3af';

  const animation = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(animation.value, [0, 1], [0, -14]) },
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0.5, 1], [0, 1]),
      transform: [
        { translateY: interpolate(animation.value, [0, 1], [10, 0]) },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
      }}
    >
      <Animated.View style={iconStyle}>
        <MaterialIcons
          name={iconName}
          size={26}
          color={isActive ? activeColor : inactiveColor}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: 2 }, textStyle]}>
        <Text style={{
          color: activeColor,
          fontSize: 10,
          fontWeight: '600',
        }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// Map route names to icons and labels
const TAB_CONFIG: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; label: string }> = {
  index: { icon: 'home', label: 'Inicio' },
  voluntarios: { icon: 'people', label: 'Voluntarios' },
  turnos: { icon: 'event', label: 'Turnos' },
  inventario: { icon: 'inventory', label: 'Inventario' },
  menu: { icon: 'restaurant-menu', label: 'Menú' },
};

export const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        overflow: 'visible',
      }}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isActive = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            label={config.label}
            iconName={config.icon}
            isActive={isActive}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};
