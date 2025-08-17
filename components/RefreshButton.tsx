import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface RefreshButtonProps extends TouchableOpacityProps {
  onPress?: () => void | Promise<void>;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onPress, 
  children, 
  ...props 
}) => {
  const { getValidToken } = useAuth();

  const handlePress = async () => {
    // Auto refresh token sebelum action
    await getValidToken();
    
    // Execute original onPress
    if (onPress) {
      await onPress();
    }
  };

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};