/**
 * Sohbet durumu — tüm ekranların paylaştığı tek kaynak.
 * Mesajlar, streaming, konuşma listesi/geçmişi ve eylemler burada.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BubbleMessage } from '../components/ChatBubble';
import { streamChat } from '../api/chat';
import { ApiContext } from '../api/client';
import {
  deleteDialogue,
  Dialogue,
  getChatHistory,
  getDialogueList,
  getModels,
} from '../api/dialogues';
import { useApp } from '../theme/ThemeContext';

const CHAT_MODE = 'chat_normal';

type ChatCtx = {
  messages: BubbleMessage[];
  streaming: boolean;
  convUid: string | null;
  dialogues: Dialogue[];
  models: string[];
  model: string;
  setModel: (m: string) => void;
  send: (text: string) => void;
  stop: () => void;
  newChat: () => void;
  openConversation: (uid: string) => Promise<void>;
  removeConversation: (uid: string) => Promise<void>;
  refreshDialogues: () => Promise<void>;
  refreshModels: () => Promise<void>;
};

const Ctx = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, ready } = useApp();
  const api: ApiContext = { baseUrl: settings.baseUrl, userId: settings.userId };

  const [messages, setMessages] = useState<BubbleMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [convUid, setConvUid] = useState<string | null>(null);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const ctrlRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const nextId = () => `m${++idRef.current}`;

  const refreshDialogues = useCallback(async () => {
    try {
      const list = await getDialogueList(api);
      setDialogues(Array.isArray(list) ? list : []);
    } catch {
      /* sessiz */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.baseUrl, api.userId]);

  const refreshModels = useCallback(async () => {
    try {
      const list = await getModels(api);
      if (list.length) setModels(list);
    } catch {
      /* sessiz */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.baseUrl, api.userId]);

  useEffect(() => {
    if (!ready) return;
    refreshDialogues();
    refreshModels();
  }, [ready, refreshDialogues, refreshModels]);

  const newChat = useCallback(() => {
    ctrlRef.current?.abort();
    setStreaming(false);
    setMessages([]);
    setConvUid(null);
  }, []);

  const send = useCallback(
    (text: string) => {
      if (streaming) return;
      const uid = convUid ?? `${settings.userId}_${Date.now()}`;
      if (!convUid) setConvUid(uid);

      const humanMsg: BubbleMessage = { id: nextId(), role: 'human', content: text };
      const viewMsg: BubbleMessage = { id: nextId(), role: 'view', content: '', thinking: true };
      setMessages(prev => [...prev, humanMsg, viewMsg]);
      setStreaming(true);

      const ctrl = new AbortController();
      ctrlRef.current = ctrl;

      streamChat({
        baseUrl: settings.baseUrl,
        userId: settings.userId,
        signal: ctrl.signal,
        body: {
          chat_mode: CHAT_MODE,
          model_name: settings.model,
          user_input: text,
          conv_uid: uid,
          temperature: 0.5,
        },
        callbacks: {
          onMessage: full =>
            setMessages(prev =>
              prev.map(m =>
                m.id === viewMsg.id ? { ...m, content: full, thinking: false } : m,
              ),
            ),
          onError: err =>
            setMessages(prev =>
              prev.map(m =>
                m.id === viewMsg.id ? { ...m, content: `⚠️ ${err}`, thinking: false } : m,
              ),
            ),
          onDone: () => {
            setStreaming(false);
            refreshDialogues();
          },
        },
      }).finally(() => setStreaming(false));
    },
    [streaming, convUid, settings.userId, settings.baseUrl, settings.model, refreshDialogues],
  );

  const stop = useCallback(() => {
    ctrlRef.current?.abort();
    setStreaming(false);
    setMessages(prev =>
      prev.map(m => (m.thinking ? { ...m, thinking: false } : m)),
    );
  }, []);

  const openConversation = useCallback(
    async (uid: string) => {
      ctrlRef.current?.abort();
      setStreaming(false);
      setConvUid(uid);
      setMessages([]);
      try {
        const history = await getChatHistory(api, uid);
        const mapped: BubbleMessage[] = (history ?? [])
          .filter(h => h.role === 'human' || h.role === 'view')
          .map(h => ({
            id: nextId(),
            role: h.role as 'human' | 'view',
            content: h.context ?? '',
          }));
        setMessages(mapped);
      } catch {
        /* sessiz */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api.baseUrl, api.userId],
  );

  const removeConversation = useCallback(
    async (uid: string) => {
      try {
        await deleteDialogue(api, uid);
      } catch {
        /* sessiz */
      }
      setDialogues(prev => prev.filter(d => d.conv_uid !== uid));
      if (uid === convUid) newChat();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api.baseUrl, api.userId, convUid, newChat],
  );

  const setModel = useCallback((m: string) => updateSettings({ model: m }), [updateSettings]);

  const value = useMemo<ChatCtx>(
    () => ({
      messages,
      streaming,
      convUid,
      dialogues,
      models,
      model: settings.model,
      setModel,
      send,
      stop,
      newChat,
      openConversation,
      removeConversation,
      refreshDialogues,
      refreshModels,
    }),
    [
      messages, streaming, convUid, dialogues, models, settings.model,
      setModel, send, stop, newChat, openConversation, removeConversation,
      refreshDialogues, refreshModels,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat(): ChatCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
