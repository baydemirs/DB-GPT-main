import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Cpu,
  Moon,
  Server,
  Smartphone,
  Sun,
  X,
  XCircle,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDialogueList } from '../src/api/dialogues';
import ModelPickerSheet from '../src/components/ModelPickerSheet';
import { useChat } from '../src/store/ChatContext';
import { useApp, useTheme } from '../src/theme/ThemeContext';
import { ThemeMode } from '../src/store/settings';

const THEME_OPTIONS: { key: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { key: 'system', label: 'Sistem', Icon: Smartphone },
  { key: 'light', label: 'Açık', Icon: Sun },
  { key: 'dark', label: 'Koyu', Icon: Moon },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, themeMode, setThemeMode, updateSettings } = useApp();
  const { models, model, setModel, refreshModels, refreshDialogues } = useChat();

  const [urlDraft, setUrlDraft] = useState(settings.baseUrl);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const saveUrl = () => {
    const v = urlDraft.trim();
    if (v && v !== settings.baseUrl) {
      updateSettings({ baseUrl: v });
      setTestState('idle');
    }
  };

  const testConnection = async () => {
    saveUrl();
    setTestState('testing');
    setTestMsg('');
    try {
      await getDialogueList({ baseUrl: urlDraft.trim(), userId: settings.userId });
      setTestState('ok');
      setTestMsg('Bağlantı başarılı');
      refreshModels();
      refreshDialogues();
    } catch (e: any) {
      setTestState('fail');
      setTestMsg(e?.message || 'Bağlanılamadı');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xl }}>Ayarlar</Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <X size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 30, gap: spacing.xxl }}>
        {/* Tema */}
        <Section title="Görünüm" colors={colors} font={font} fontSize={fontSize}>
          <View style={[styles.segment, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border }]}>
            {THEME_OPTIONS.map(({ key, label, Icon }) => {
              const active = themeMode === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setThemeMode(key)}
                  style={[
                    styles.segItem,
                    { borderRadius: radius.md, backgroundColor: active ? colors.elevated : 'transparent' },
                    active && styles.segActive,
                    active && { borderColor: colors.border },
                  ]}
                >
                  <Icon size={18} color={active ? colors.primary : colors.textMuted} />
                  <Text
                    style={{
                      color: active ? colors.text : colors.textMuted,
                      fontFamily: active ? font.semibold : font.regular,
                      fontSize: fontSize.sm,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Model */}
        <Section title="Model" colors={colors} font={font} fontSize={fontSize}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [
              styles.rowCard,
              { backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderColor: colors.border, borderRadius: radius.lg },
            ]}
          >
            <Cpu size={19} color={colors.primary} />
            <Text style={{ flex: 1, color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }} numberOfLines={1}>
              {model}
            </Text>
            <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm }}>Değiştir</Text>
          </Pressable>
        </Section>

        {/* Sunucu */}
        <Section title="Sunucu adresi" colors={colors} font={font} fontSize={fontSize}>
          <View style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Server size={19} color={colors.textMuted} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontFamily: font.regular, fontSize: fontSize.md }}
              value={urlDraft}
              onChangeText={setUrlDraft}
              onBlur={saveUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://10.0.0.1:5670"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          <Pressable
            onPress={testConnection}
            style={({ pressed }) => [
              styles.testBtn,
              { borderColor: colors.border, borderRadius: radius.lg, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            {testState === 'testing' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : testState === 'ok' ? (
              <CheckCircle2 size={18} color={colors.success} />
            ) : testState === 'fail' ? (
              <XCircle size={18} color={colors.danger} />
            ) : (
              <Server size={18} color={colors.textMuted} />
            )}
            <Text
              style={{
                color: testState === 'ok' ? colors.success : testState === 'fail' ? colors.danger : colors.text,
                fontFamily: font.medium,
                fontSize: fontSize.sm,
              }}
            >
              {testState === 'idle' ? 'Bağlantıyı test et' : testMsg || 'Test ediliyor…'}
            </Text>
          </Pressable>
        </Section>

        <Text style={{ color: colors.textFaint, textAlign: 'center', fontFamily: font.regular, fontSize: fontSize.xs }}>
          DB-GPT Mobil · Faz 1{'\n'}Kullanıcı: {settings.userId}
        </Text>
      </ScrollView>

      <ModelPickerSheet
        visible={pickerOpen}
        models={models}
        selected={model}
        onSelect={setModel}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

function Section({
  title,
  children,
  colors,
  font,
  fontSize,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
  font: any;
  fontSize: any;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.textMuted, fontFamily: font.semibold, fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', padding: 4, borderWidth: 1, gap: 4 },
  segItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segActive: {},
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
  },
});
