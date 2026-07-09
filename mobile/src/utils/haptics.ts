/**
 * Dokunsal geri bildirim — "gerçek uygulama" hissi için.
 * Web'de ve haptik desteklemeyen cihazlarda sessizce yok sayılır.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Hafif dokunuş — kart/buton basışları. */
export const tapLight = () => {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

/** Orta dokunuş — durdurma / önemli aksiyon. */
export const tapMedium = () => {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

/** Seçim tıkırtısı — sekme değişimi, segment seçimi. */
export const selection = () => {
  if (enabled) Haptics.selectionAsync().catch(() => {});
};

/** Başarı bildirimi — işlem tamamlandı (yükleme, kaydetme). */
export const success = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

/** Hata bildirimi. */
export const error = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
