/** Boş sohbet karşılama ekranı: logo, selam ve hızlı öneri kartları. */
import { Database, Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import SuggestionCard from './SuggestionCard';

const DEFAULT_SUGGESTIONS = [
  'Kendini kısaca tanıt',
  'Bana üretkenlik için 3 ipucu ver',
  'SQL ile basit bir JOIN örneği yaz',
  'Yapay zekayı bir çocuğa anlat',
];

type Props = {
  onPick: (text: string) => void;
  title?: string;
  subtitle?: string;
  suggestions?: string[];
  icon?: 'sparkles' | 'database';
};

export default function EmptyState({ onPick, title, subtitle, suggestions, icon = 'sparkles' }: Props) {
  const theme = useTheme();
  const { colors, font, fontSize, spacing } = theme;
  const Icon = icon === 'database' ? Database : Sparkles;
  const list = suggestions ?? DEFAULT_SUGGESTIONS;

  return (
    <View style={styles.wrap}>
      <View style={[styles.logo, { backgroundColor: colors.primarySoft }]}>
        <Icon size={30} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl }]} numberOfLines={1}>
        {title ?? 'DB-GPT'}
      </Text>
      <Text
        style={[styles.subtitle, { color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.md, marginBottom: spacing.xxl }]}
      >
        {subtitle ?? 'Nasıl yardımcı olabilirim?'}
      </Text>

      <View style={styles.cards}>
        {list.map(s => (
          <SuggestionCard key={s} text={s} onPress={() => onPick(s)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { marginBottom: 4, maxWidth: '90%' },
  subtitle: { textAlign: 'center' },
  cards: { width: '100%', gap: 10 },
});
