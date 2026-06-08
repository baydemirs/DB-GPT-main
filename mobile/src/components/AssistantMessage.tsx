/**
 * Asistan mesajını içeriğe göre render eder:
 *  - markdown: normal cevap
 *  - db: açıklama + SQL kod bloğu + veri tablosu (chat_with_db)
 *  - preparing: veritabanı sorgusu hazırlanıyor (ara durum)
 */
import { Database, Terminal } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { parseAssistant } from '../utils/richContent';
import DataTable from './DataTable';
import MarkdownMessage from './MarkdownMessage';
import TypingDots from './TypingDots';

export default function AssistantMessage({ content }: { content: string }) {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const parsed = parseAssistant(content);

  if (parsed.kind === 'preparing') {
    return (
      <View>
        {parsed.thoughts ? (
          <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: 8 }}>
            {parsed.thoughts}
          </Text>
        ) : null}
        <View style={[styles.pill, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full }]}>
          <Database size={14} color={colors.primary} />
          <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>
            Sorgu hazırlanıyor
          </Text>
          <TypingDots />
        </View>
      </View>
    );
  }

  if (parsed.kind === 'db') {
    return (
      <View>
        {parsed.text ? <MarkdownMessage content={parsed.text} /> : null}

        {parsed.sql ? (
          <View style={{ marginTop: parsed.text ? 6 : 0 }}>
            <View style={styles.sqlHeader}>
              <Terminal size={13} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontFamily: font.semibold, fontSize: fontSize.xs, letterSpacing: 0.5 }}>
                SQL
              </Text>
            </View>
            <View style={[styles.sqlBox, { backgroundColor: colors.codeBg, borderRadius: radius.md }]}>
              <Text style={{ color: colors.codeText, fontFamily: 'monospace', fontSize: fontSize.sm, lineHeight: 19 }}>
                {parsed.sql}
              </Text>
            </View>
          </View>
        ) : null}

        <DataTable data={parsed.data} />
      </View>
    );
  }

  return <MarkdownMessage content={parsed.text} />;
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8 },
  sqlHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  sqlBox: { padding: 12 },
});
