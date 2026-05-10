import { Text, ActivityIndicator, Pressable, PressableProps } from 'react-native';
import React, { forwardRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = forwardRef<any, ButtonProps>(
  ({ title, variant = 'primary', size = 'md', isLoading, className = '', disabled, onPressIn, onPressOut, ...props }, ref) => {
    
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
      scale.value = withTiming(0.95, { duration: 100 });
      if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
      scale.value = withTiming(1, { duration: 100 });
      if (onPressOut) onPressOut(e);
    };

    const baseStyles = 'rounded-xl flex-row items-center justify-center';
    
    const variants = {
      primary: 'bg-primary shadow-sm',
      secondary: 'bg-primary-light shadow-sm',
      outline: 'border-2 border-primary bg-transparent',
      ghost: 'bg-transparent',
    };

    const sizes = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };

    const textVariants = {
      primary: 'text-white font-semibold',
      secondary: 'text-white font-semibold',
      outline: 'text-primary font-semibold',
      ghost: 'text-primary font-semibold',
    };

    const textSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <AnimatedPressable
        ref={ref}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} w-full ${className}`}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#10b981' : '#ffffff'} />
        ) : (
          <Text className={`${textVariants[variant]} ${textSizes[size]}`}>
            {title}
          </Text>
        )}
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';
