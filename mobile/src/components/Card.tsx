/** Temalı kart sarmalayıcı (gölge + yuvarlak köşe). Pressable ya da statik. */
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { tapLight } from '../utils/haptics';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevation?: 'card' | 'soft' | 'none';
  /** Basışta hafif haptik geri bildirim (varsayılan açık). */
  haptic?: boolean;
};

export default function Card({ children, onPress, style, padded = true, elevation = 'soft', haptic = true }: Props) {
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
        onPress={() => {
          if (haptic) tapLight();
          onPress();
        }}
        style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
