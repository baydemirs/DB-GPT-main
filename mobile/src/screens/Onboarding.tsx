/**
 * İlk açılış deneyimi: tanıtım slaytları + isim girişi.
 * Bitince settings.onboarded = true olur ve uygulama sekmeli yapıya geçer.
 */
import { ArrowRight, Database, MessagesSquare, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

type Slide = { key: string; Icon: typeof Sparkles; title: string; subtitle: string };

const SLIDES: Slide[] = [
  { key: 's1', Icon: Sparkles, title: 'DB-GPT’ye hoş geldin', subtitle: 'Yapay zeka asistanın artık cebinde. İstediğin an, istediğin yerde sohbet et.' },
  { key: 's2', Icon: MessagesSquare, title: 'Akıllı sohbet', subtitle: 'Sorularını sor, fikir al, kod yaz, özetle. Cevaplar anında akar.' },
  { key: 's3', Icon: Database, title: 'Verilerinle konuş', subtitle: 'Yakında veritabanların ve bilgi tabanlarınla doğrudan sohbet edebileceksin.' },
];

export default function Onboarding() {
  const { theme, updateSettings } = useApp();
  const { colors, font, fontSize, radius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      finish();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const finish = () => {
    updateSettings({ onboarded: true, userName: name.trim() });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={8}>
            <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>Atla</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={s => s.key}
          onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item, index: i }) => {
            const Icon = item.Icon;
            return (
              <View style={[styles.slide, { width }]}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft, borderRadius: radius.xxl }]}>
                  <Icon size={48} color={colors.primary} strokeWidth={1.8} />
                </View>
                <Text style={[styles.title, { color: colors.text, fontFamily: font.bold, fontSize: fontSize.display }]}>
                  {item.title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.md }]}>
                  {item.subtitle}
                </Text>

                {i === SLIDES.length - 1 && (
                  <View style={[styles.nameBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, marginTop: spacing.xxl }]}>
                    <TextInput
                      style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.lg, textAlign: 'center' }}
                      value={name}
                      onChangeText={setName}
                      placeholder="Adın nedir?"
                      placeholderTextColor={colors.textFaint}
                      autoCapitalize="words"
                      returnKeyType="done"
                      onSubmitEditing={finish}
                      maxLength={24}
                    />
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Noktalar */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 7,
                  backgroundColor: i === index ? colors.primary : colors.borderStrong,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              borderRadius: radius.lg,
              marginBottom: insets.bottom + 16,
              marginHorizontal: spacing.xl,
            },
          ]}
        >
          <Text style={{ color: colors.onPrimary, fontFamily: font.semibold, fontSize: fontSize.md }}>
            {isLast ? 'Başla' : 'Devam'}
          </Text>
          <ArrowRight size={18} color={colors.onPrimary} />
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: { height: 40, paddingHorizontal: 20, alignItems: 'flex-end', justifyContent: 'center' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  title: { textAlign: 'center', marginBottom: 14 },
  subtitle: { textAlign: 'center', lineHeight: 23, paddingHorizontal: 8 },
  nameBox: { width: '100%', borderWidth: 1, paddingVertical: 16, paddingHorizontal: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 20 },
  dot: { height: 7, borderRadius: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
});
