/**
 * Web'deki giriş alanına benzer zengin composer:
 *  [ çok satırlı metin ]
 *  + ⚡ 🗄️ 📖 | [model ▾]        🎤  ↑
 */
import * as Haptics from 'expo-haptics';
import {
  ArrowUp,
  BookMarked,
  ChevronDown,
  Database,
  Mic,
  Plus,
  Sparkles,
  Square,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  model?: string;
  onModelPress?: () => void;
  onAttach?: () => void;
  onSkills?: () => void;
  onDatabase?: () => void;
  onKnowledge?: () => void;
  onVoice?: () => void;
};

export default function ChatComposer({
  streaming,
  onSend,
  onStop,
  model,
  onModelPress,
  onAttach,
  onSkills,
  onDatabase,
  onKnowledge,
  onVoice,
}: Props) {
  const theme = useTheme();
  const { colors, radius, font, fontSize } = theme;
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !streaming;

  const soon = (label: string) => Alert.alert(label, 'Bu özellik yakında eklenecek.');

  const handleSend = () => {
    if (!canSend) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
  };
  const handleStop = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStop();
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl }]}>
      <TextInput
        style={[styles.input, { color: colors.text, fontFamily: font.regular, fontSize: fontSize.md }]}
        value={text}
        onChangeText={setText}
        placeholder="Bir mesaj yazın…"
        placeholderTextColor={colors.textFaint}
        multiline
        editable={!streaming}
      />

      <View style={styles.toolbar}>
        {/* Sol: aksiyon ikonları + model */}
        <View style={styles.left}>
          <IconBtn onPress={onAttach ?? (() => soon('Dosya yükle'))}>
            <Plus size={19} color={colors.textMuted} />
          </IconBtn>
          <IconBtn onPress={onSkills ?? (() => soon('Beceriler'))}>
            <Zap size={18} color={colors.textMuted} />
          </IconBtn>
          <IconBtn onPress={onDatabase ?? (() => soon('Veritabanı'))}>
            <Database size={18} color={colors.textMuted} />
          </IconBtn>
          <IconBtn onPress={onKnowledge ?? (() => soon('Bilgi tabanı'))}>
            <BookMarked size={17} color={colors.textMuted} />
          </IconBtn>

          {model ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={onModelPress}
                style={({ pressed }) => [styles.modelPill, { backgroundColor: pressed ? colors.surfaceAlt : colors.bg, borderColor: colors.border, borderRadius: radius.full }]}
              >
                <Sparkles size={13} color={colors.primary} />
                <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.xs, maxWidth: 92 }} numberOfLines={1}>
                  {model}
                </Text>
                <ChevronDown size={13} color={colors.textMuted} />
              </Pressable>
            </>
          ) : null}
        </View>

        {/* Sağ: mikrofon + gönder */}
        <View style={styles.right}>
          <IconBtn onPress={onVoice ?? (() => soon('Sesli giriş'))}>
            <Mic size={19} color={colors.textMuted} />
          </IconBtn>
          {streaming ? (
            <Pressable onPress={handleStop} style={[styles.sendBtn, { backgroundColor: colors.text }]} hitSlop={6}>
              <Square size={15} color={colors.bg} fill={colors.bg} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={[styles.sendBtn, { backgroundColor: canSend ? colors.primary : colors.borderStrong }]}
              hitSlop={6}
            >
              <ArrowUp size={19} color={canSend ? colors.onPrimary : colors.textFaint} strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function IconBtn({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  input: { maxHeight: 130, paddingTop: 2, paddingBottom: 6, lineHeight: 21, minHeight: 24 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  divider: { width: 1, height: 18, marginHorizontal: 5 },
  modelPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
