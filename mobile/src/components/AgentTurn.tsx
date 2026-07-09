/** Ajan cevabı: katlanabilir "düşünme adımları" + nihai cevap (markdown). */
import { Brain, ChevronDown, ChevronRight, FileBarChart, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { tapLight } from '../utils/haptics';
import { trStepTitle } from '../utils/tr';
import FadeIn from './FadeIn';
import MarkdownMessage from './MarkdownMessage';
import TypingDots from './TypingDots';

export type AgentStep = { id: string; title: string; content: string };

export default function AgentTurn({
  steps,
  final,
  running,
  html,
  onViewReport,
}: {
  steps: AgentStep[];
  final: string;
  running: boolean;
  html?: string;
  onViewReport?: () => void;
}) {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const [open, setOpen] = useState(true);

  const hasFinal = final.trim().length > 0;

  // Nihai cevap gelince düşünme adımlarını otomatik kapat (İngilizce muhakeme gizlensin).
  useEffect(() => {
    if (hasFinal) setOpen(false);
  }, [hasFinal]);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Sparkles size={16} color={colors.primary} />
      </View>

      <View style={{ flex: 1, marginLeft: spacing.md }}>
        {/* Düşünme adımları */}
        {steps.length > 0 && (
          <View style={[styles.stepsBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Pressable
              onPress={() => {
                tapLight();
                setOpen(o => !o);
              }}
              style={styles.stepsHeader}
            >
              <Brain size={15} color={colors.textMuted} />
              <Text style={{ flex: 1, color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>
                Düşünme adımları ({steps.length})
              </Text>
              {running && !hasFinal ? <TypingDots /> : open ? <ChevronDown size={16} color={colors.textFaint} /> : <ChevronRight size={16} color={colors.textFaint} />}
            </Pressable>

            {open && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 10, gap: 10 }}>
                {steps.map((s, i) => (
                  <View key={s.id || i} style={{ borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: 10 }}>
                    <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.xs, marginBottom: 2 }}>
                      {trStepTitle(s.title)}
                    </Text>
                    {s.content ? (
                      <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs, lineHeight: 17 }}>
                        {s.content.trim()}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Nihai cevap */}
        {hasFinal ? (
          <View style={{ marginTop: steps.length ? 10 : 0 }}>
            <MarkdownMessage content={final} />
          </View>
        ) : steps.length === 0 ? (
          <View style={{ paddingTop: 4 }}>
            <TypingDots />
          </View>
        ) : null}

        {/* HTML rapor butonu */}
        {html ? (
          <FadeIn offset={6}>
            <Pressable
              onPress={() => {
                tapLight();
                onViewReport?.();
              }}
              style={({ pressed }) => [
                styles.reportBtn,
                { backgroundColor: pressed ? colors.primaryPressed : colors.primary, borderRadius: radius.lg, marginTop: 10 },
              ]}
            >
              <FileBarChart size={18} color={colors.onPrimary} />
              <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>Raporu Görüntüle</Text>
            </Pressable>
          </FadeIn>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, paddingRight: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepsBox: { borderWidth: 1, overflow: 'hidden' },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, alignSelf: 'flex-start', paddingHorizontal: 18 },
});

