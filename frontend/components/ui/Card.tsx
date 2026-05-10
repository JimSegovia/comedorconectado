import { View, Text, Pressable, ViewProps } from 'react-native';
import React, { forwardRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  className?: string;
  onPress?: () => void;
}

export const Card = forwardRef<View, CardProps>(
  ({ className = '', children, onPress, ...props }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    if (onPress) {
      return (
        <AnimatedPressable
          onPress={onPress}
          onPressIn={() => scale.value = withTiming(0.97, { duration: 100 })}
          onPressOut={() => scale.value = withTiming(1, { duration: 100 })}
          style={[animatedStyle, {
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#f0f0f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }]}
          className={className}
          {...props}
        >
          {children}
        </AnimatedPressable>
      );
    }

    return (
      <View
        ref={ref}
        className={className}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#f0f0f0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
