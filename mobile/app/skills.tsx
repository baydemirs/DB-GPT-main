import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Wrench } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSkills, Skill } from '../src/api/skills';
import Card from '../src/components/Card';
import { useApp } from '../src/theme/ThemeContext';
import { trSkillDescription } from '../src/utils/tr';

export default function SkillsScreen() {
  const { theme, settings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getSkills({ baseUrl: settings.baseUrl, userId: settings.userId });
        setSkills(list);
      } catch {
        setSkills([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [settings.baseUrl, settings.userId]);

  const openAgent = (skill?: Skill) => {
    if (skill) {
      router.push({ pathname: '/agent', params: { skillId: skill.id, skillName: skill.name } });
    } else {
      router.push('/agent');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>Ajan & Beceriler</Text>
        <View style={{ width: 40 }} />
      </View>

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
                Düşünüp adım adım iş yapan ajan. İstersen bir beceriyle başlat.
              </Text>
              {/* Genel ajan */}
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
          ListEmptyComponent={
            <Text style={{ color: colors.textFaint, textAlign: 'center', marginTop: 30, fontFamily: font.regular, fontSize: fontSize.md }}>
              Beceri bulunamadı
            </Text>
          }
          renderItem={({ item }) => (
            <Card onPress={() => openAgent(item)} style={styles.row}>
              <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
                <Wrench size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm, marginTop: 2 }} numberOfLines={2}>
                  {trSkillDescription(item.id, item.description)}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
