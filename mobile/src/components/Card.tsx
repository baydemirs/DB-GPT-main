/** Temalı kart sarmalayıcı (gölge + yuvarlak köşe). Pressable ya da statik. */
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevation?: 'card' | 'soft' | 'none';
};

export default function Card({ children, onPress, style, padded = true, elevation = 'soft' }: Props) {
  const theme = useTheme();
  const { colors, radius, spacing, shadows } = theme;

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: padded ? spacing.lg : 0,
    ...(elevation !== 'none' ? shadows[elevation] : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
