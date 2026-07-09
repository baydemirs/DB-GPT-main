import {
  CheckCircle2,
  Cpu,
  Moon,
  Server,
  Smartphone,
  Sun,
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
import { getDialogueList } from '../../src/api/dialogues';
import Card from '../../src/components/Card';
import ModelPickerSheet from '../../src/components/ModelPickerSheet';
import { ThemeMode } from '../../src/store/settings';
import { useChat } from '../../src/store/ChatContext';
import { useApp } from '../../src/theme/ThemeContext';

const THEME_OPTIONS: { key: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { key: 'system', label: 'Sistem', Icon: Smartphone },
  { key: 'light', label: 'Açık', Icon: Sun },
  { key: 'dark', label: 'Koyu', Icon: Moon },
];

export default function ProfileScreen() {
  const { theme, settings, themeMode, setThemeMode, updateSettings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const { models, model, setModel, refreshModels, refreshDialogues } = useChat();

  const [nameDraft, setNameDraft] = useState(settings.userName);
  const [urlDraft, setUrlDraft] = useState(settings.baseUrl);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const initial = (settings.userName || 'D').trim().charAt(0).toUpperCase();

  const saveName = () => {
    if (nameDraft.trim() !== settings.userName) updateSettings({ userName: nameDraft.trim() });
  };
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
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl, paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        Profil
      </Text>

      {/* Kullanıcı kartı */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }}>
        <Card style={styles.userCard} elevation="card">
          <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.onPrimary, fontFamily: font.bold, fontSize: fontSize.xl }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, padding: 0 }}
              value={nameDraft}
              onChangeText={setNameDraft}
              onBlur={saveName}
              placeholder="Adın"
              placeholderTextColor={colors.textFaint}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
              Kullanıcı: {settings.userId}
            </Text>
          </View>
        </Card>
      </View>

      {/* Görünüm */}
      <Section title="Görünüm" colors={colors} font={font} fontSize={fontSize} spacing={spacing}>
        <View style={[styles.segment, { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg }]}>
          {THEME_OPTIONS.map(({ key, label, Icon }) => {
            const active = themeMode === key;
            return (
              <Pressable
                key={key}
                onPress={() => setThemeMode(key)}
                style={[styles.segItem, { borderRadius: radius.md }, active && { backgroundColor: colors.surface, ...theme.shadows.soft }]}
              >
                <Icon size={17} color={active ? colors.primary : colors.textMuted} />
                <Text style={{ color: active ? colors.text : colors.textMuted, fontFamily: active ? font.semibold : font.regular, fontSize: fontSize.sm }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Model */}
      <Section title="Model" colors={colors} font={font} fontSize={fontSize} spacing={spacing}>
        <Card onPress={() => setPickerOpen(true)} style={styles.rowCard}>
          <Cpu size={19} color={colors.primary} />
          <Text style={{ flex: 1, color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }} numberOfLines={1}>
            {model}
          </Text>
          <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm }}>Değiştir</Text>
        </Card>
      </Section>

      {/* Sunucu */}
      <Section title="Sunucu adresi" colors={colors} font={font} fontSize={fontSize} spacing={spacing}>
        <Card style={styles.rowCard}>
          <Server size={19} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, color: colors.text, fontFamily: font.regular, fontSize: fontSize.md, padding: 0 }}
            value={urlDraft}
            onChangeText={setUrlDraft}
            onBlur={saveUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="http://10.0.0.1:5670"
            placeholderTextColor={colors.textFaint}
          />
        </Card>
        <Pressable
          onPress={testConnection}
          style={({ pressed }) => [styles.testBtn, { borderColor: colors.border, borderRadius: radius.lg, backgroundColor: pressed ? colors.surfaceAlt : colors.surface, marginTop: 10 }]}
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
          <Text style={{ color: testState === 'ok' ? colors.success : testState === 'fail' ? colors.danger : colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
            {testState === 'idle' ? 'Bağlantıyı test et' : testMsg || 'Test ediliyor…'}
          </Text>
        </Pressable>
      </Section>

      <Text style={{ color: colors.textFaint, textAlign: 'center', fontFamily: font.regular, fontSize: fontSize.xs, marginTop: spacing.xl }}>
        DB-GPT Mobil · Faz 2
      </Text>

      <ModelPickerSheet
        visible={pickerOpen}
        models={models}
        selected={model}
        onSelect={setModel}
        onClose={() => setPickerOpen(false)}
      />
    </ScrollView>
  );
}

function Section({ title, children, colors, font, fontSize, spacing }: any) {
  return (
    <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl, gap: 10 }}>
      <Text style={{ color: colors.textMuted, fontFamily: font.semibold, fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bigAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', padding: 4, gap: 4 },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderWidth: 1 },
});
