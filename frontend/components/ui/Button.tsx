import { Text, ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';
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

const COLORS = {
  primary: '#10b981',
  primaryDark: '#059669',
  white: '#ffffff',
};

export const Button = forwardRef<any, ButtonProps>(
  ({ title, variant = 'primary', size = 'md', isLoading, className = '', disabled, onPressIn, onPressOut, ...props }, ref) => {
    
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
      scale.value = withTiming(0.97, { duration: 100 });
      if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
      scale.value = withTiming(1, { duration: 100 });
      if (onPressOut) onPressOut(e);
    };

    const containerStyle = [
      styles.base,
      styles[`size_${size}`],
      variant === 'primary' && styles.variantPrimary,
      variant === 'secondary' && styles.variantSecondary,
      variant === 'outline' && styles.variantOutline,
      variant === 'ghost' && styles.variantGhost,
      (disabled || isLoading) && styles.disabled,
    ];

    const textStyle = [
      styles.text,
      styles[`textSize_${size}`],
      variant === 'primary' && styles.textPrimary,
      variant === 'secondary' && styles.textSecondary,
      variant === 'outline' && styles.textOutline,
      variant === 'ghost' && styles.textGhost,
    ];

    return (
      <AnimatedPressable
        ref={ref}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, containerStyle]}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // sizes
  size_sm: { paddingHorizontal: 12, paddingVertical: 8 },
  size_md: { paddingHorizontal: 16, paddingVertical: 14 },
  size_lg: { paddingHorizontal: 24, paddingVertical: 18 },
  // variants
  variantPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  variantSecondary: { backgroundColor: '#34d399' },
  variantOutline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  variantGhost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  // text base
  text: { fontWeight: '700' },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
  // text variants
  textPrimary: { color: COLORS.white },
  textSecondary: { color: COLORS.white },
  textOutline: { color: COLORS.primary },
  textGhost: { color: COLORS.primary },
} as any);
