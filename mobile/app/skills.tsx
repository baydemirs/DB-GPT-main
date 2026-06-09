import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ChevronLeft, Link, Plus, Sparkles, Trash2, Upload, Wrench, X } from 'lucide-react-native';
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
import { deleteSkill, getSkills, importGithubSkill, Skill, uploadSkill } from '../src/api/skills';
import Card from '../src/components/Card';
import { useApp } from '../src/theme/ThemeContext';
import { trSkillDescription } from '../src/utils/tr';

export default function SkillsScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ctx = { baseUrl: settings.baseUrl, userId: settings.userId };

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>(''); // işlem mesajı
  const [githubOpen, setGithubOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  const load = useCallback(async () => {
    try {
      setSkills(await getSkills(ctx));
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.baseUrl, settings.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAgent = (skill?: Skill) => {
    if (skill) router.push({ pathname: '/agent', params: { skillId: skill.id, skillName: skill.name } });
    else router.push('/agent');
  };

  const showAddMenu = () => {
    Alert.alert('Beceri ekle', 'Yöntem seç', [
      { text: "GitHub'dan içe aktar", onPress: () => setGithubOpen(true) },
      { text: 'Dosya yükle (.zip/.skill)', onPress: pickFile },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.length) return;
      const f = res.assets[0];
      setBusy('Yükleniyor…');
      await uploadSkill(ctx, { uri: f.uri, name: f.name, mimeType: f.mimeType });
      await load();
      Alert.alert('Başarılı', 'Beceri yüklendi.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Yükleme başarısız');
    } finally {
      setBusy('');
    }
  };

  const doImportGithub = async () => {
    const url = githubUrl.trim();
    if (!url) return;
    setGithubOpen(false);
    setBusy('İçe aktarılıyor…');
    try {
      await importGithubSkill(ctx, url);
      setGithubUrl('');
      await load();
      Alert.alert('Başarılı', 'Beceri GitHub’dan içe aktarıldı.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'İçe aktarma başarısız');
    } finally {
      setBusy('');
    }
  };

  const confirmDelete = (skill: Skill) => {
    Alert.alert('Beceriyi sil', `"${skill.name}" kalıcı olarak silinecek. Emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setBusy('Siliniyor…');
          try {
            await deleteSkill(ctx, skill.id || skill.name);
            await load();
          } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Silinemedi');
          } finally {
            setBusy('');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>Ajan & Beceriler</Text>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={s => s.id}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListHeaderComponent={
            <>
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: spacing.md }}>
                Düşünüp adım adım iş yapan ajan. İstersen bir beceriyle başlat. Sağ üstten yeni beceri ekleyebilirsin.
              </Text>
              <Card onPress={() => openAgent()} style={[styles.row, { marginBottom: 10, borderColor: colors.primary }]}>
                <View style={[styles.icon, { backgroundColor: colors.primary, borderRadius: radius.md }]}>
                  <Sparkles size={22} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>Genel Ajan</Text>
                  <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
                    Becerisiz, serbest ajan sohbeti
                  </Text>
                </View>
              </Card>
              <Text style={{ color: colors.textMuted, fontFamily: font.semibold, fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 4 }}>
                Beceriler
              </Text>
            </>
          }
          renderItem={({ item }) => {
            const personal = item.type === 'personal';
            return (
              <Card onPress={() => openAgent(item)} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
                  <Wrench size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md, flexShrink: 1 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {personal && (
                      <View style={[styles.badge, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full }]}>
                        <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: 10 }}>Kişisel</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }} numberOfLines={2}>
                    {trSkillDescription(item.id, item.description)}
                  </Text>
                </View>
                {personal && (
                  <Pressable onPress={() => confirmDelete(item)} hitSlop={10} style={{ padding: 2 }}>
                    <Trash2 size={18} color={colors.danger} />
                  </Pressable>
                )}
              </Card>
            );
          }}
        />
      )}

      {/* GitHub import modal */}
      <Modal visible={githubOpen} transparent animationType="fade" onRequestClose={() => setGithubOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setGithubOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.elevated, borderRadius: radius.xl }]}>
            <View style={styles.sheetHeader}>
              <Link size={20} color={colors.text} />
              <Text style={{ flex: 1, color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>GitHub’dan içe aktar</Text>
              <Pressable onPress={() => setGithubOpen(false)} hitSlop={8}>
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: 12 }}>
              Açık bir GitHub deposu veya skills.sh linki yapıştır.
            </Text>
            <TextInput
              style={[styles.urlInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md, fontFamily: font.regular, fontSize: fontSize.md }]}
              value={githubUrl}
              onChangeText={setGithubUrl}
              placeholder="https://github.com/kullanici/depo"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Pressable
              onPress={doImportGithub}
              disabled={!githubUrl.trim()}
              style={({ pressed }) => [styles.importBtn, { backgroundColor: githubUrl.trim() ? (pressed ? colors.primaryPressed : colors.primary) : colors.borderStrong, borderRadius: radius.md }]}
            >
              <Upload size={17} color={colors.onPrimary} />
              <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>İçe aktar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 52,
    borderBottomWidth: 1,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  busyBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 7, paddingVertical: 2 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 420, padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  urlInput: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  importBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
});
