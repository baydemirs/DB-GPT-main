/** Alt giriş çubuğu: çok satırlı metin + gönder/durdur butonu (haptik geri bildirimli). */
import * as Haptics from 'expo-haptics';
import { ArrowUp, Square } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export default function ChatComposer({ streaming, onSend, onStop }: Props) {
  const theme = useTheme();
  const { colors, radius, font, fontSize, spacing } = theme;
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !streaming;

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
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xl,
          paddingLeft: spacing.lg,
        },
      ]}
    >
      <TextInput
        style={[styles.input, { color: colors.text, fontFamily: font.regular, fontSize: fontSize.md }]}
        value={text}
        onChangeText={setText}
        placeholder="Bir mesaj yazın…"
        placeholderTextColor={colors.textFaint}
        multiline
        editable={!streaming}
      />
      {streaming ? (
        <Pressable
          onPress={handleStop}
          style={[styles.btn, { backgroundColor: colors.text }]}
          hitSlop={6}
        >
          <Square size={16} color={colors.bg} fill={colors.bg} />
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.btn,
            { backgroundColor: canSend ? colors.primary : colors.borderStrong },
          ]}
          hitSlop={6}
        >
          <ArrowUp size={20} color={canSend ? colors.onPrimary : colors.textFaint} strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    paddingVertical: 6,
    paddingRight: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 140,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    lineHeight: 21,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
});
