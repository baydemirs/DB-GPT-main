/** Boş sohbet karşılama ekranı: logo, selam ve hızlı öneri kartları. */
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import SuggestionCard from './SuggestionCard';

const SUGGESTIONS = [
  'Kendini kısaca tanıt',
  'Bana üretkenlik için 3 ipucu ver',
  'SQL ile basit bir JOIN örneği yaz',
  'Yapay zekayı bir çocuğa anlat',
];

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const theme = useTheme();
  const { colors, font, fontSize, spacing } = theme;

  return (
    <View style={styles.wrap}>
      <View style={[styles.logo, { backgroundColor: colors.primarySoft }]}>
        <Sparkles size={30} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl }]}>
        DB-GPT
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.md, marginBottom: spacing.xxl },
        ]}
      >
        Nasıl yardımcı olabilirim?
      </Text>

      <View style={styles.cards}>
        {SUGGESTIONS.map(s => (
          <SuggestionCard key={s} text={s} onPress={() => onPick(s)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { marginBottom: 4 },
  subtitle: { textAlign: 'center' },
  cards: { width: '100%', gap: 10 },
});
