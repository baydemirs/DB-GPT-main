import { useRouter } from 'expo-router';
import { BookOpen, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react-native';
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
import { createSpace, getSpaces, KnowledgeSpace } from '../src/api/knowledge';
import Card from '../src/components/Card';
import { useApp } from '../src/theme/ThemeContext';

export default function SelectKnowledgeScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ctx = { baseUrl: settings.baseUrl, userId: settings.userId };

  const [spaces, setSpaces] = useState<KnowledgeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setSpaces(await getSpaces(ctx));
    } catch (e: any) {
      setError(e?.message || 'Bilgi tabanları alınamadı');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.baseUrl, settings.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (space: KnowledgeSpace) => {
    router.push({ pathname: '/knowledge-space', params: { space: space.name } });
  };

  const doCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreateOpen(false);
    setBusy(true);
    try {
      await createSpace(ctx, name);
      setNewName('');
      await load();
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Oluşturulamadı');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, flex: 1, textAlign: 'center' }}>Bilgi Tabanı</Text>
        <Pressable onPress={() => setCreateOpen(true)} hitSlop={8} style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}>
          <Plus size={18} color={colors.onPrimary} />
        </Pressable>
      </View>

      {busy ? (
        <View style={[styles.busyBar, { backgroundColor: colors.primarySoft }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.primary, fontFamily: font.medium, fontSize: fontSize.sm }}>Oluşturuluyor…</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger, fontFamily: font.medium, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: 32 }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={spaces}
          keyExtractor={d => String(d.id ?? d.name)}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListHeaderComponent={
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: spacing.md }}>
              Bir bilgi tabanı seç (belge ekle / sohbet et) ya da sağ üstten yeni oluştur.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <BookOpen size={36} color={colors.textFaint} />
              <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.md, marginTop: 12 }}>Bilgi tabanı yok</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isGraph = item.vector_type === 'KnowledgeGraph';
            return (
              <Card onPress={() => open(item)} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
                  <BookOpen size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
                    {item.docs ?? 0} belge · {item.vector_type || 'Chroma'}
                    {isGraph ? ' (TuGraph gerekir)' : ''}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textFaint} />
              </Card>
            );
          }}
        />
      )}

      {/* Yeni alan modalı */}
      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setCreateOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.elevated, borderRadius: radius.xl }]}>
            <View style={styles.sheetHeader}>
              <Text style={{ flex: 1, color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>Yeni bilgi tabanı</Text>
              <Pressable onPress={() => setCreateOpen(false)} hitSlop={8}>
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: 12 }}>
              Chroma tabanlı yeni bir bilgi tabanı oluşturulur (belge ekleyebilirsin).
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md, fontFamily: font.regular, fontSize: fontSize.md }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="İsim (ör. Notlarim)"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
            />
            <Pressable
              onPress={doCreate}
              disabled={!newName.trim()}
              style={({ pressed }) => [styles.createBtn, { backgroundColor: newName.trim() ? (pressed ? colors.primaryPressed : colors.primary) : colors.borderStrong, borderRadius: radius.md }]}
            >
              <Plus size={17} color={colors.onPrimary} />
              <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>Oluştur</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 420, padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
});
