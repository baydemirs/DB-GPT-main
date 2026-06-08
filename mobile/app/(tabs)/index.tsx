import { useRouter } from 'expo-router';
import { ArrowRight, MessageSquare, Plus, Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import { useChat } from '../../src/store/ChatContext';
import { useApp } from '../../src/theme/ThemeContext';
import { dialogueTitle } from '../../src/utils/dialogue';

const QUICK_PROMPTS = [
  { emoji: '💡', text: 'Üretkenlik için 3 ipucu ver' },
  { emoji: '🧑‍💻', text: 'SQL JOIN örneği yaz' },
  { emoji: '📝', text: 'Bu metni özetle:' },
  { emoji: '🌍', text: 'Yapay zekayı basitçe anlat' },
];

export default function HomeScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, spacing, radius } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dialogues, newChat, openConversation, refreshDialogues } = useChat();

  useEffect(() => {
    refreshDialogues();
  }, [refreshDialogues]);

  const startNew = (prompt?: string) => {
    newChat();
    router.push(prompt ? { pathname: '/chat', params: { prompt } } : '/chat');
  };

  const openConv = async (uid: string) => {
    await openConversation(uid);
    router.push('/chat');
  };

  const recent = dialogues.slice(0, 6);
  const greeting = settings.userName ? `Merhaba, ${settings.userName}` : 'Merhaba';

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Selam */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.md }}>
          {greeting} 👋
        </Text>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl, marginTop: 2 }}>
          Nasıl yardımcı olabilirim?
        </Text>
      </View>

      {/* Yeni sohbet hero kartı */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }}>
        <Card onPress={() => startNew()} padded={false} elevation="card" style={{ backgroundColor: colors.primary, borderColor: colors.primary, overflow: 'hidden' }}>
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Sparkles size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontFamily: font.semibold, fontSize: fontSize.lg }}>Yeni sohbet</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
                Yapay zekayla hemen konuşmaya başla
              </Text>
            </View>
            <View style={[styles.heroPlus, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Plus size={20} color="#fff" strokeWidth={2.5} />
            </View>
          </View>
        </Card>
      </View>

      {/* Hızlı başla */}
      <SectionTitle title="Hızlı başla" colors={colors} font={font} fontSize={fontSize} spacing={spacing} />
      <View style={{ paddingHorizontal: spacing.xl, gap: 10, marginBottom: spacing.xxl }}>
        {QUICK_PROMPTS.map(q => (
          <Card key={q.text} onPress={() => startNew(q.text)} style={styles.quickRow}>
            <Text style={{ fontSize: 20 }}>{q.emoji}</Text>
            <Text style={{ flex: 1, color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }} numberOfLines={1}>
              {q.text}
            </Text>
            <ArrowRight size={17} color={colors.textFaint} />
          </Card>
        ))}
      </View>

      {/* Son sohbetler */}
      {recent.length > 0 && (
        <>
          <SectionTitle title="Son sohbetler" colors={colors} font={font} fontSize={fontSize} spacing={spacing} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12 }}
          >
            {recent.map(d => (
              <Card key={d.conv_uid} onPress={() => openConv(d.conv_uid)} style={[styles.recentCard, { borderRadius: radius.lg }]}>
                <View style={[styles.recentIcon, { backgroundColor: colors.primarySoft }]}>
                  <MessageSquare size={16} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm, marginTop: 10 }} numberOfLines={3}>
                  {dialogueTitle(d)}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

function SectionTitle({ title, colors, font, fontSize, spacing }: any) {
  return (
    <Text
      style={{
        color: colors.text,
        fontFamily: font.semibold,
        fontSize: fontSize.lg,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
      }}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  heroIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroPlus: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  recentCard: { width: 150, height: 120 },
  recentIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
