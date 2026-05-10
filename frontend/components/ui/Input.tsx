import { TextInput, TextInputProps, View, Text } from 'react-native';
import { forwardRef } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <View className="mb-4">
        {label && (
          <Text className="text-text font-medium mb-1.5 ml-1">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`bg-surface border ${
            error ? 'border-danger' : 'border-border'
          } rounded-xl px-4 py-3 text-text text-base ${className}`}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {error && (
          <Text className="text-danger text-sm mt-1 ml-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
