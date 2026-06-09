/**
 * Yumuşak giriş animasyonu (opaklık + hafif yükselme).
 * RN Animated ile — worklet bağımlılığı yok, her yerde güvenli.
 * `delay` ile listelerde kademeli (staggered) giriş yapılabilir.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  delay?: number;
  /** Başlangıç dikey kayması (px). */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export default function FadeIn({ children, delay = 0, offset = 10, duration = 280, style }: Props) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [t, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: t,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
