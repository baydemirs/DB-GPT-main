/** Satır nesnelerinden oluşan diziyi tablo olarak render eder (yatay kaydırmalı). */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const MAX_ROWS = 50;
const MIN_COL_WIDTH = 110;

export default function DataTable({ data }: { data: Record<string, any>[] }) {
  const theme = useTheme();
  const { colors, font, fontSize, radius } = theme;

  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);
  const rows = data.slice(0, MAX_ROWS);

  const cell = (text: string, header: boolean, last: boolean) => (
    <View
      style={[
        styles.cell,
        { width: MIN_COL_WIDTH, borderRightColor: colors.border, borderRightWidth: last ? 0 : StyleSheet.hairlineWidth },
      ]}
    >
      <Text
        numberOfLines={2}
        style={{
          color: header ? colors.text : colors.textMuted,
          fontFamily: header ? font.semibold : font.regular,
          fontSize: fontSize.sm,
        }}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.wrap, { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Başlık */}
          <View style={[styles.row, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
            {columns.map((c, i) => (
              <View key={c}>{cell(c, true, i === columns.length - 1)}</View>
            ))}
          </View>
          {/* Satırlar */}
          {rows.map((r, ri) => (
            <View key={ri} style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: ri === rows.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
              {columns.map((c, ci) => (
                <View key={c}>{cell(formatVal(r[c]), false, ci === columns.length - 1)}</View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {data.length > MAX_ROWS && (
        <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, padding: 8 }}>
          {data.length} satırdan ilk {MAX_ROWS} gösteriliyor
        </Text>
      )}
    </View>
  );
}

function formatVal(v: any): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
  return String(v);
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, overflow: 'hidden', marginTop: 8 },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  cell: { paddingHorizontal: 10, paddingVertical: 9, justifyContent: 'center' },
});
