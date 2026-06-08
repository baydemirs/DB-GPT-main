/** Alttan açılan model seçim paneli. */
import { Check, Cpu } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  visible: boolean;
  models: string[];
  selected: string;
  onSelect: (m: string) => void;
  onClose: () => void;
};

export default function ModelPickerSheet({ visible, models, selected, onSelect, onClose }: Props) {
  const theme = useTheme();
  const { colors, radius, font, fontSize } = theme;
  const insets = useSafeAreaInsets();
  const list = models.length ? models : [selected];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: insets.bottom + 12 },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.title, { color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }]}>
            Model seç
          </Text>
          <ScrollView style={{ maxHeight: 340 }}>
            {list.map(m => {
              const active = m === selected;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    onSelect(m);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: active ? colors.primarySoft : pressed ? colors.surface : 'transparent',
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Cpu size={18} color={active ? colors.primary : colors.textMuted} />
                  <Text
                    style={{
                      flex: 1,
                      color: active ? colors.primary : colors.text,
                      fontFamily: active ? font.semibold : font.regular,
                      fontSize: fontSize.md,
                    }}
                    numberOfLines={1}
                  >
                    {m}
                  </Text>
                  {active && <Check size={18} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 16, paddingTop: 8 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  title: { marginBottom: 12, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14 },
});
