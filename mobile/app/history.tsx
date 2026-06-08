import { useRouter } from 'expo-router';
import { MessageSquare, MessageSquarePlus, Trash2, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../src/store/ChatContext';
import { useTheme } from '../src/theme/ThemeContext';

export default function HistoryScreen() {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dialogues, openConversation, removeConversation, newChat, refreshDialogues, convUid } = useChat();

  useEffect(() => {
    refreshDialogues();
  }, [refreshDialogues]);

  const open = async (uid: string) => {
    await openConversation(uid);
    router.back();
  };

  const startNew = () => {
    newChat();
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xl }}>Sohbetler</Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <X size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable
        onPress={startNew}
        style={({ pressed }) => [
          styles.newBtn,
          { backgroundColor: pressed ? colors.primaryPressed : colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg },
        ]}
      >
        <MessageSquarePlus size={18} color={colors.onPrimary} />
        <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>
          Yeni sohbet
        </Text>
      </Pressable>

      <FlatList
        data={dialogues}
        keyExtractor={d => d.conv_uid}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 20, gap: 8 }}
        ListEmptyComponent={
          <Text style={{ color: colors.textFaint, textAlign: 'center', marginTop: 60, fontFamily: font.regular, fontSize: fontSize.md }}>
            Henüz sohbet yok.{'\n'}Yeni bir sohbet başlatın.
          </Text>
        }
        renderItem={({ item }) => {
          const active = item.conv_uid === convUid;
          const title = toTitle(item.user_input) || 'Yeni sohbet';
          return (
            <Pressable
              onPress={() => open(item.conv_uid)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: active ? colors.primarySoft : pressed ? colors.surfaceAlt : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <MessageSquare size={18} color={active ? colors.primary : colors.textMuted} />
              <Text
                style={{ flex: 1, color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Pressable onPress={() => removeConversation(item.conv_uid)} hitSlop={10} style={styles.trash}>
                <Trash2 size={17} color={colors.textFaint} />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function toTitle(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object') {
    const anyIn = input as Record<string, unknown>;
    if (typeof anyIn.content === 'string') return anyIn.content;
  }
  return '';
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  trash: { padding: 2 },
});
