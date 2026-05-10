import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export const Badge = ({ label, variant = 'default', className = '', ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <View className={`px-2.5 py-1 rounded-full border ${selectedVariant.split(' ')[0]} ${selectedVariant.split(' ')[2]} ${className}`} {...props}>
      <Text className={`text-xs font-semibold ${selectedVariant.split(' ')[1]}`}>
        {label}
      </Text>
    </View>
  );
};
