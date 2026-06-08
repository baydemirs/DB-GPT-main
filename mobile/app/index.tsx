import { useRouter } from 'expo-router';
import { ChevronDown, MessageSquarePlus, PanelLeft, Settings2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatBubble from '../src/components/ChatBubble';
import ChatComposer from '../src/components/ChatComposer';
import EmptyState from '../src/components/EmptyState';
import ModelPickerSheet from '../src/components/ModelPickerSheet';
import { useChat } from '../src/store/ChatContext';
import { useTheme } from '../src/theme/ThemeContext';

export default function ChatScreen() {
  const theme = useTheme();
  const { colors, font, fontSize, spacing, radius } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { messages, streaming, send, stop, newChat, model, models, setModel } = useChat();

  const listRef = useRef<FlatList>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (messages.length) {
      const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
      return () => clearTimeout(t);
    }
  }, [messages]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {/* Başlık çubuğu */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <HeaderButton onPress={() => router.push('/history')}>
          <PanelLeft size={22} color={colors.text} />
        </HeaderButton>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.modelPill,
            { backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderRadius: radius.full },
          ]}
        >
          <Text
            style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.sm, maxWidth: 150 }}
            numberOfLines={1}
          >
            {model}
          </Text>
          <ChevronDown size={15} color={colors.textMuted} />
        </Pressable>

        <View style={styles.headerRight}>
          <HeaderButton onPress={newChat}>
            <MessageSquarePlus size={22} color={colors.text} />
          </HeaderButton>
          <HeaderButton onPress={() => router.push('/settings')}>
            <Settings2 size={21} color={colors.text} />
          </HeaderButton>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {messages.length === 0 ? (
          <EmptyState onPick={send} />
        ) : (
          <FlatList
            ref={listRef}
            style={styles.flex}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 8, paddingTop: 6 }}>
          <ChatComposer streaming={streaming} onSend={send} onStop={stop} />
        </View>
      </KeyboardAvoidingView>

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

function HeaderButton({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.hBtn, { opacity: pressed ? 0.5 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});
