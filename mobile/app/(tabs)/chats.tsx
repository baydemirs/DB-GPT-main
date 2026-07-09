import { useRouter } from 'expo-router';
import { MessageSquare, MessageSquarePlus, Search, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import { useChat } from '../../src/store/ChatContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { chatModeLabel, dialogueTitle } from '../../src/utils/dialogue';

export default function ChatsScreen() {
  const theme = useTheme();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dialogues, openConversation, removeConversation, newChat, refreshDialogues, convUid } = useChat();
  const [query, setQuery] = useState('');

  useEffect(() => {
    refreshDialogues();
  }, [refreshDialogues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dialogues;
    return dialogues.filter(d => dialogueTitle(d).toLowerCase().includes(q));
  }, [dialogues, query]);

  const open = async (uid: string) => {
    await openConversation(uid);
    router.push('/chat');
  };

  const startNew = () => {
    newChat();
    router.push('/chat');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <View style={styles.titleRow}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xxl }}>Sohbetler</Text>
          <Pressable onPress={startNew} hitSlop={8} style={[styles.newBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}>
            <MessageSquarePlus size={18} color={colors.onPrimary} />
          </Pressable>
        </View>

        {/* Arama */}
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <Search size={18} color={colors.textFaint} />
          <TextInput
            style={{ flex: 1, color: colors.text, fontFamily: font.regular, fontSize: fontSize.md }}
            value={query}
            onChangeText={setQuery}
            placeholder="Sohbetlerde ara…"
            placeholderTextColor={colors.textFaint}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.conv_uid}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 90, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 70 }}>
            <MessageSquare size={36} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 14, fontFamily: font.medium, fontSize: fontSize.md }}>
              {query ? 'Sonuç bulunamadı' : 'Henüz sohbet yok'}
            </Text>
            {!query && (
              <Text style={{ color: colors.textFaint, textAlign: 'center', marginTop: 4, fontFamily: font.regular, fontSize: fontSize.sm }}>
                Yeni bir sohbet başlatın
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const active = item.conv_uid === convUid;
          return (
            <Card
              onPress={() => open(item.conv_uid)}
              style={[styles.row, active && { borderColor: colors.primary }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                <MessageSquare size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }} numberOfLines={1}>
                  {dialogueTitle(item)}
                </Text>
                <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, marginTop: 3 }}>
                  {chatModeLabel(item.chat_mode)}
                </Text>
              </View>
              <Pressable onPress={() => removeConversation(item.conv_uid)} hitSlop={10}>
                <Trash2 size={17} color={colors.textFaint} />
              </Pressable>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  newBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
