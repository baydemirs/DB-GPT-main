/** Karşılama ekranındaki tek bir öneri kartı (basınca hafif küçülür). */
import { ArrowUpRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SuggestionCard({ text, onPress }: { text: string; onPress: () => void }) {
  const theme = useTheme();
  const { colors, radius, font, fontSize } = theme;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text
        style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm, flex: 1 }}
        numberOfLines={2}
      >
        {text}
      </Text>
      <ArrowUpRight size={16} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
});
