import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, FileText, MessageSquare, Plus, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addTextDocument,
  KnowledgeDoc,
  listDocuments,
  syncDocument,
  uploadDocument,
} from '../src/api/knowledge';
import Card from '../src/components/Card';
import { useChat } from '../src/store/ChatContext';
import { useApp } from '../src/theme/ThemeContext';

export default function KnowledgeSpaceScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ space: string }>();
  const space = String(params.space ?? '');
  const ctx = { baseUrl: settings.baseUrl, userId: settings.userId };
  const { newChat } = useChat();

  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [textOpen, setTextOpen] = useState(false);
  const [textName, setTextName] = useState('');
  const [textBody, setTextBody] = useState('');

  const load = useCallback(async () => {
    try {
      setDocs(await listDocuments(ctx, space));
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, settings.baseUrl, settings.userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Embedding süren belge varsa periyodik tazele
  useEffect(() => {
    const hasRunning = docs.some(d => d.status === 'RUNNING' || d.status === 'TODO');
    if (!hasRunning) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [docs, load]);

  const showAddMenu = () => {
    Alert.alert('Belge ekle', 'Yöntem seç', [
      { text: 'Dosya yükle (PDF, TXT, DOCX…)', onPress: pickFile },
      { text: 'Metin ekle', onPress: () => setTextOpen(true) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.length) return;
      const f = res.assets[0];
      setBusy('Yükleniyor…');
      const docId = await uploadDocument(ctx, space, { uri: f.uri, name: f.name, mimeType: f.mimeType });
      setBusy('Embed ediliyor…');
      if (docId != null) await syncDocument(ctx, space, [docId]);
      await load();
      Alert.alert('Başarılı', 'Belge yüklendi ve işleniyor.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Yükleme başarısız');
    } finally {
      setBusy('');
    }
  };

  const addText = async () => {
    const name = textName.trim() || 'Metin belge';
    const body = textBody.trim();
    if (!body) return;
    setTextOpen(false);
    setBusy('Ekleniyor…');
    try {
      const docId = await addTextDocument(ctx, space, name, body);
      setBusy('Embed ediliyor…');
      if (docId != null) await syncDocument(ctx, space, [docId]);
      setTextName('');
      setTextBody('');
      await load();
      Alert.alert('Başarılı', 'Metin eklendi ve işleniyor.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Eklenemedi');
    } finally {
      setBusy('');
    }
  };

  const startChat = () => {
    newChat('chat_knowledge', space);
    router.push('/chat');
  };

  const statusInfo = (s?: string): { label: string; color: string } => {
    switch (s) {
      case 'FINISHED':
        return { label: 'Hazır', color: colors.success };
      case 'FAILED':
        return { label: 'Hata', color: colors.danger };
      case 'RUNNING':
      case 'TODO':
        return { label: 'İşleniyor', color: colors.warning };
      default:
        return { label: s || '—', color: colors.textMuted };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {space}
        </Text>
        <Pressable onPress={showAddMenu} hitSlop={8} style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}>
          <Plus size={18} color={colors.onPrimary} />
        </Pressable>
      </View>

      {busy ? (
        <View style={[styles.busyBar, { backgroundColor: colors.primarySoft }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.primary, fontFamily: font.medium, fontSize: fontSize.sm }}>{busy}</Text>
        </View>
      ) : null}

      {/* Sohbet et butonu */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Pressable
          onPress={startChat}
          style={({ pressed }) => [styles.chatBtn, { backgroundColor: pressed ? colors.primaryPressed : colors.primary, borderRadius: radius.lg }]}
        >
          <MessageSquare size={18} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>Bu bilgi tabanıyla sohbet et</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={docs}
          keyExtractor={d => String(d.id)}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListHeaderComponent={
            <Text style={{ color: colors.textMuted, fontFamily: font.semibold, fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Belgeler ({docs.length})
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <FileText size={34} color={colors.textFaint} />
              <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.md, marginTop: 12, textAlign: 'center' }}>
                Henüz belge yok
              </Text>
              <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 4, textAlign: 'center' }}>
                Sağ üstten dosya veya metin ekleyin
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = statusInfo(item.status);
            return (
              <Card style={styles.row}>
                <View style={[styles.docIcon, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }} numberOfLines={1}>
                    {item.doc_name}
                  </Text>
                  <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, marginTop: 2 }}>
                    {item.doc_type} · {item.chunk_size ?? 0} parça
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: st.color + '22', borderRadius: radius.full }]}>
                  <Text style={{ color: st.color, fontFamily: font.medium, fontSize: 11 }}>{st.label}</Text>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Metin ekleme modalı */}
      <Modal visible={textOpen} transparent animationType="fade" onRequestClose={() => setTextOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setTextOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.elevated, borderRadius: radius.xl }]}>
            <View style={styles.sheetHeader}>
              <Text style={{ flex: 1, color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>Metin ekle</Text>
              <Pressable onPress={() => setTextOpen(false)} hitSlop={8}>
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md, fontFamily: font.regular, fontSize: fontSize.md }]}
              value={textName}
              onChangeText={setTextName}
              placeholder="Başlık (ör. Notlar)"
              placeholderTextColor={colors.textFaint}
            />
            <TextInput
              style={[styles.input, styles.body, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md, fontFamily: font.regular, fontSize: fontSize.md }]}
              value={textBody}
              onChangeText={setTextBody}
              placeholder="İçeriği buraya yapıştır…"
              placeholderTextColor={colors.textFaint}
              multiline
            />
            <Pressable
              onPress={addText}
              disabled={!textBody.trim()}
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: textBody.trim() ? (pressed ? colors.primaryPressed : colors.primary) : colors.borderStrong, borderRadius: radius.md }]}
            >
              <Plus size={17} color={colors.onPrimary} />
              <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>Ekle</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 52, borderBottomWidth: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  busyBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 9, paddingVertical: 4 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 440, padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  body: { minHeight: 120, maxHeight: 220, textAlignVertical: 'top' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
});
