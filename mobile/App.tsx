/**
 * DB-GPT Mobil — Faz 0: streaming chat kanıtı.
 *
 * Amaç: telefondan DB-GPT backend'ine bağlanıp /api/v1/chat/completions
 * üzerinden gelen cevabın CANLI AKMASINI görmek. Çalışırsa en riskli parça
 * (RN'de POST + SSE streaming) çözülmüş demektir; gerisi UI/ekran işidir.
 */
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { streamChat } from './src/api/chat';
import { DEFAULT_CONFIG } from './src/config';

type Message = { id: string; role: 'human' | 'view'; content: string };

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatScreen />
    </SafeAreaProvider>
  );
}

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [baseUrl, setBaseUrl] = useState(DEFAULT_CONFIG.apiBaseUrl);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);

  // Tüm oturum boyunca sabit bir konuşma kimliği (Faz 0 için yeterli).
  const convUid = `${DEFAULT_CONFIG.userId}_mobile_demo`;

  const nextId = () => `m${++idRef.current}`;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const humanMsg: Message = { id: nextId(), role: 'human', content: text };
    const viewMsg: Message = { id: nextId(), role: 'view', content: '' };
    setMessages(prev => [...prev, humanMsg, viewMsg]);
    setStreaming(true);

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    await streamChat({
      baseUrl,
      userId: DEFAULT_CONFIG.userId,
      signal: ctrl.signal,
      body: {
        chat_mode: DEFAULT_CONFIG.chatMode,
        model_name: DEFAULT_CONFIG.model,
        user_input: text,
        conv_uid: convUid,
        temperature: DEFAULT_CONFIG.temperature,
      },
      callbacks: {
        onMessage: full =>
          setMessages(prev =>
            prev.map(m => (m.id === viewMsg.id ? { ...m, content: full } : m)),
          ),
        onError: err =>
          setMessages(prev =>
            prev.map(m =>
              m.id === viewMsg.id ? { ...m, content: `⚠️ ${err}` } : m,
            ),
          ),
        onDone: () => setStreaming(false),
      },
    });
    setStreaming(false);
  };

  const handleStop = () => {
    ctrlRef.current?.abort();
    setStreaming(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Üst başlık — durum çubuğu yüksekliği kadar boşluk bırakılıyor */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>DB-GPT Mobil · Faz 0</Text>
        <TextInput
          style={styles.urlInput}
          value={baseUrl}
          onChangeText={setBaseUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.x:5670"
          placeholderTextColor="#888"
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={m => m.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'human' ? styles.human : styles.view,
              ]}
            >
              {item.role === 'view' && item.content === '' ? (
                <ActivityIndicator color="#666" />
              ) : (
                <Text style={item.role === 'human' ? styles.humanText : styles.viewText}>
                  {item.content}
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Sunucu adresini yukarı yazın, bir mesaj gönderin ve cevabın akmasını izleyin.
            </Text>
          }
        />

        {/* Alt giriş çubuğu — gezinme çubuğu yüksekliği kadar boşluk bırakılıyor */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Bir şey sorun…"
            placeholderTextColor="#999"
            multiline
            editable={!streaming}
          />
          {streaming ? (
            <Pressable style={[styles.sendBtn, styles.stopBtn]} onPress={handleStop}>
              <Text style={styles.sendText}>Durdur</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Text style={styles.sendText}>Gönder</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1117' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#161b22' },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  urlInput: {
    backgroundColor: '#0e1117',
    color: '#9ecbff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  listContent: { padding: 12, gap: 10 },
  empty: { color: '#8b949e', textAlign: 'center', marginTop: 40, paddingHorizontal: 24, lineHeight: 20 },
  bubble: { maxWidth: '85%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  human: { alignSelf: 'flex-end', backgroundColor: '#2f81f7' },
  view: { alignSelf: 'flex-start', backgroundColor: '#21262d' },
  humanText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  viewText: { color: '#e6edf3', fontSize: 15, lineHeight: 21 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: '#0e1117',
    color: '#e6edf3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  sendBtn: {
    backgroundColor: '#238636',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  stopBtn: { backgroundColor: '#da3633' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
