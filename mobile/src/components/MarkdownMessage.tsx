/** Asistan cevabını markdown olarak render eder — temaya uygun stillerle. */
import { useMemo } from 'react';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../theme/ThemeContext';

export default function MarkdownMessage({ content }: { content: string }) {
  const theme = useTheme();
  const { colors, font, fontSize } = theme;

  const styles = useMemo(
    () => ({
      body: { color: colors.text, fontSize: fontSize.md, fontFamily: font.regular, lineHeight: 23 },
      paragraph: { marginTop: 0, marginBottom: 10, flexWrap: 'wrap' as const },
      heading1: { color: colors.text, fontFamily: font.bold, fontSize: fontSize.xl, marginTop: 6, marginBottom: 8 },
      heading2: { color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, marginTop: 6, marginBottom: 6 },
      heading3: { color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md, marginTop: 4, marginBottom: 4 },
      strong: { fontFamily: font.semibold, color: colors.text },
      em: { fontStyle: 'italic' as const },
      bullet_list: { marginBottom: 8 },
      ordered_list: { marginBottom: 8 },
      list_item: { marginBottom: 4 },
      code_inline: {
        backgroundColor: colors.surfaceAlt,
        color: colors.primary,
        fontFamily: 'monospace',
        fontSize: fontSize.sm,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
      },
      code_block: {
        backgroundColor: colors.codeBg,
        color: colors.codeText,
        fontFamily: 'monospace',
        fontSize: fontSize.sm,
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
      },
      fence: {
        backgroundColor: colors.codeBg,
        color: colors.codeText,
        fontFamily: 'monospace',
        fontSize: fontSize.sm,
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
      },
      blockquote: {
        backgroundColor: colors.surfaceAlt,
        borderLeftColor: colors.primary,
        borderLeftWidth: 3,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginVertical: 6,
        borderRadius: 6,
      },
      link: { color: colors.primary, textDecorationLine: 'underline' as const },
      table: { borderColor: colors.border, borderWidth: 1, borderRadius: 8, marginVertical: 6 },
      thead: { backgroundColor: colors.surfaceAlt },
      th: { padding: 8, color: colors.text, fontFamily: font.semibold },
      td: { padding: 8, color: colors.text, borderColor: colors.border },
      tr: { borderColor: colors.border },
      hr: { backgroundColor: colors.border, height: 1, marginVertical: 10 },
    }),
    [colors, font, fontSize],
  );

  return <Markdown style={styles as any}>{content}</Markdown>;
}
