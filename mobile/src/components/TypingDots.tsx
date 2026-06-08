/** "Yazıyor…" üç nokta animasyonu (built-in Animated — düşük risk, akıcı). */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TypingDots() {
  const theme = useTheme();
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 380, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.row}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.textMuted,
              opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [
                { translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
