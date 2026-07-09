import { useRouter } from 'expo-router';
import { ChevronLeft, Database } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatModeParam, getChatModeParams } from '../src/api/dialogues';
import Card from '../src/components/Card';
import { useChat } from '../src/store/ChatContext';
import { useApp } from '../src/theme/ThemeContext';

const DB_MODE = 'chat_with_db_execute';

export default function SelectDbScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { newChat } = useChat();

  const [dbs, setDbs] = useState<ChatModeParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const list = await getChatModeParams({ baseUrl: settings.baseUrl, userId: settings.userId }, DB_MODE);
        setDbs(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setError(e?.message || 'Veritabanları alınamadı');
      } finally {
        setLoading(false);
      }
    })();
  }, [settings.baseUrl, settings.userId]);

  const pick = (db: ChatModeParam) => {
    newChat(DB_MODE, db.param);
    router.replace('/chat');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>Veritabanı seç</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger, fontFamily: font.medium, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: 32 }}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dbs}
          keyExtractor={d => d.param}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListHeaderComponent={
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginBottom: spacing.md }}>
              Hangi veritabanıyla konuşmak istersin? Sorularını doğal dille sor, SQL’i AI üretsin.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Database size={36} color={colors.textFaint} />
              <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.md, marginTop: 12, textAlign: 'center' }}>
                Bağlı veritabanı yok
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card onPress={() => pick(item)} style={styles.row}>
              <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
                <Database size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }} numberOfLines={1}>
                  {item.param}
                </Text>
                <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }}>
                  {item.type}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
