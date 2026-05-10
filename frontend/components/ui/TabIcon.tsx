import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useDerivedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

interface TabIconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  focused: boolean;
  label: string;
}

export const TabIcon = ({ name, color, focused, label }: TabIconProps) => {
  const animation = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

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
      position: 'absolute',
      bottom: -10,
    };
  });

  return (
    <View className="items-center justify-center w-16 h-12">
      <Animated.View style={iconStyle}>
        <MaterialIcons name={name} size={26} color={color} />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text style={{ color, fontSize: 11, fontWeight: '600' }}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
};
