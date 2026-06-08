import { useRouter } from 'expo-router';
import {
  BookOpen,
  Check,
  Cpu,
  Database,
  LayoutGrid,
  MessageSquare,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import { useChat } from '../../src/store/ChatContext';
import { useTheme } from '../../src/theme/ThemeContext';

const CAPABILITIES = [
  { key: 'chat', Icon: MessageSquare, title: 'Normal Sohbet', desc: 'Yapay zekayla serbest sohbet', ready: true },
  { key: 'db', Icon: Database, title: 'Veritabanıyla Sohbet', desc: 'Verilerine soru sor, SQL üret', ready: true },
  { key: 'kb', Icon: BookOpen, title: 'Bilgi Tabanı', desc: 'Belgelerinle konuş', ready: false },
  { key: 'apps', Icon: LayoutGrid, title: 'Ajan & Beceriler', desc: 'Düşünüp adım adım iş yapan ajan', ready: true },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { models, model, setModel, refreshModels, newChat } = useChat();

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const handleCap = (key: string) => {
    if (key === 'chat') {
      newChat();
      router.push('/chat');
    } else if (key === 'db') {
      router.push('/select-db');
    } else if (key === 'apps') {
      router.push('/skills');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl, paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        Keşfet
      </Text>

      {/* Yetenekler */}
      <Section title="Yetenekler" colors={colors} font={font} fontSize={fontSize} spacing={spacing} />
      <View style={{ paddingHorizontal: spacing.xl, gap: 10, marginBottom: spacing.xxl }}>
        {CAPABILITIES.map(c => {
          const Icon = c.Icon;
          return (
            <Card
              key={c.key}
              onPress={c.ready ? () => handleCap(c.key) : undefined}
              elevation={c.ready ? 'soft' : 'none'}
              style={[styles.capRow, !c.ready && { opacity: 0.6 }]}
            >
              <View style={[styles.capIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>{c.title}</Text>
                <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
                  {c.desc}
                </Text>
              </View>
              {!c.ready && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full }]}>
                  <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.xs }}>Yakında</Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Modeller */}
      <Section title="Modeller" colors={colors} font={font} fontSize={fontSize} spacing={spacing} />
      <View style={{ paddingHorizontal: spacing.xl, gap: 10 }}>
        {(models.length ? models : [model]).map(m => {
          const active = m === model;
          return (
            <Card key={m} onPress={() => setModel(m)} style={[styles.capRow, active && { borderColor: colors.primary }]}>
              <View style={[styles.capIcon, { backgroundColor: active ? colors.primarySoft : colors.surfaceAlt }]}>
                <Cpu size={20} color={active ? colors.primary : colors.textMuted} />
              </View>
              <Text style={{ flex: 1, color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }} numberOfLines={1}>
                {m}
              </Text>
              {active && <Check size={18} color={colors.primary} />}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Section({ title, colors, font, fontSize, spacing }: any) {
  return (
    <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  capRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  capIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 5 },
});
