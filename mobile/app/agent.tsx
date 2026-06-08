import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Wrench } from 'lucide-react-native';
import { useRef, useState } from 'react';
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
import { streamAgent } from '../src/api/agent';
import AgentTurn, { AgentStep } from '../src/components/AgentTurn';
import ChatBubble from '../src/components/ChatBubble';
import ChatComposer from '../src/components/ChatComposer';
import EmptyState from '../src/components/EmptyState';
import { useApp } from '../src/theme/ThemeContext';

type Msg =
  | { id: string; role: 'human'; text: string }
  | { id: string; role: 'agent'; steps: AgentStep[]; final: string; running: boolean };

const AGENT_SUGGESTIONS = ['Ne yapabilirsin?', 'Veri analizi nasıl yaparsın?', 'Bir SQL örneği ver'];

export default function AgentScreen() {
  const { settings } = useApp();
  const { theme } = useApp();
  const { colors, font, fontSize, spacing, radius } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ skillId?: string; skillName?: string; skillTitle?: string }>();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList>(null);
  const ctrlRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const convRef = useRef<string>(`${settings.userId}_agent_${Date.now()}`);
  const nextId = () => `a${++idRef.current}`;

  const skillTitle = params.skillName || params.skillTitle;

  const updateAgent = (agentId: string, fn: (m: Extract<Msg, { role: 'agent' }>) => Extract<Msg, { role: 'agent' }>) =>
    setMessages(prev => prev.map(m => (m.id === agentId && m.role === 'agent' ? fn(m) : m)));

  const send = (text: string) => {
    if (streaming) return;
    const humanMsg: Msg = { id: nextId(), role: 'human', text };
    const agentId = nextId();
    const agentMsg: Msg = { id: agentId, role: 'agent', steps: [], final: '', running: true };
    setMessages(prev => [...prev, humanMsg, agentMsg]);
    setStreaming(true);

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    streamAgent({
      baseUrl: settings.baseUrl,
      userId: settings.userId,
      signal: ctrl.signal,
      body: {
        conv_uid: convRef.current,
        model_name: settings.model,
        user_input: text,
        ext_info: params.skillId ? { skill_id: String(params.skillId), skill_name: String(params.skillName ?? '') } : {},
      },
      callbacks: {
        onStepStart: step =>
          updateAgent(agentId, m => ({ ...m, steps: [...m.steps, { id: step.id, title: step.title, content: '' }] })),
        onStepContent: (id, delta) =>
          updateAgent(agentId, m => {
            const steps = [...m.steps];
            const idx = steps.findIndex(s => s.id === id);
            if (idx >= 0) steps[idx] = { ...steps[idx], content: steps[idx].content + delta };
            else steps.push({ id, title: 'Adım', content: delta });
            return { ...m, steps };
          }),
        onFinal: content => updateAgent(agentId, m => ({ ...m, final: content })),
        onError: err => updateAgent(agentId, m => ({ ...m, final: `⚠️ ${err}`, running: false })),
        onDone: () => {
          updateAgent(agentId, m => ({ ...m, running: false }));
          setStreaming(false);
        },
      },
    }).finally(() => {
      updateAgent(agentId, m => ({ ...m, running: false }));
      setStreaming(false);
    });
  };

  const stop = () => {
    ctrlRef.current?.abort();
    setStreaming(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.hBtn}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }} numberOfLines={1}>
          {skillTitle ? 'Ajan · Beceri' : 'Ajan'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {skillTitle && (
        <View style={[styles.ctxBar, { backgroundColor: colors.primarySoft, borderBottomColor: colors.border }]}>
          <Wrench size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontFamily: font.medium, fontSize: fontSize.sm }} numberOfLines={1}>
            {skillTitle}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top}>
        {messages.length === 0 ? (
          <EmptyState
            onPick={send}
            title={skillTitle || 'Ajan'}
            subtitle={skillTitle ? 'Bu beceriyle adım adım iş yapar' : 'Düşünüp adım adım iş yapan asistan'}
            suggestions={AGENT_SUGGESTIONS}
          />
        ) : (
          <FlatList
            ref={listRef}
            style={styles.flex}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) =>
              item.role === 'human' ? (
                <ChatBubble message={{ id: item.id, role: 'human', content: item.text }} />
              ) : (
                <AgentTurn steps={item.steps} final={item.final} running={item.running} />
              )
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 8, paddingTop: 6 }}>
          <ChatComposer streaming={streaming} onSend={send} onStop={stop} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  ctxBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
