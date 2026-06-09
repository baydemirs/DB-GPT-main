/** Sunucuya ulaşılamadığında üstte beliren uyarı + "Yeniden dene". */
import { useRouter } from 'expo-router';
import { RefreshCw, WifiOff } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnection } from '../store/ConnectionContext';
import { useTheme } from '../theme/ThemeContext';

export default function ConnectionBanner() {
  const { status, checking, recheck } = useConnection();
  const theme = useTheme();
  const { colors, font, fontSize } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (status !== 'offline') return null;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6, backgroundColor: colors.danger }]}>
      <WifiOff size={16} color="#fff" />
      <Pressable style={{ flex: 1 }} onPress={() => router.navigate('/(tabs)/profile')}>
        <Text style={{ color: '#fff', fontFamily: font.semibold, fontSize: fontSize.sm }}>
          Sunucuya bağlanılamadı
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: font.regular, fontSize: fontSize.xs }}>
          Adresi kontrol et (Profil) · dokun
        </Text>
      </Pressable>
      <Pressable
        onPress={recheck}
        disabled={checking}
        style={styles.retry}
        hitSlop={6}
      >
        {checking ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <RefreshCw size={14} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: font.medium, fontSize: fontSize.sm }}>Yeniden dene</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 8 },
});
