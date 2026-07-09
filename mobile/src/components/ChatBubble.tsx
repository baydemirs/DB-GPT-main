/** Tek bir sohbet mesajı: kullanıcı (sağ balon) veya asistan (sol, avatarlı). */
import { Sparkles } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AssistantMessage from './AssistantMessage';
import TypingDots from './TypingDots';

export type BubbleMessage = {
  id: string;
  role: 'human' | 'view';
  content: string;
  thinking?: boolean;
};

export default function ChatBubble({ message }: { message: BubbleMessage }) {
  const theme = useTheme();
  const { colors, spacing, radius, font, fontSize } = theme;
  const isUser = message.role === 'human';

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const animStyle = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
  };

  if (isUser) {
    return (
      <Animated.View style={[styles.rowEnd, animStyle]}>
        <View
          style={[
            styles.userBubble,
            { backgroundColor: colors.userBubble, borderRadius: radius.lg },
          ]}
        >
          <Text style={{ color: colors.onUserBubble, fontSize: fontSize.md, fontFamily: font.regular, lineHeight: 22 }}>
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const isEmpty = message.content.trim() === '';

  return (
    <Animated.View style={[styles.rowStart, animStyle]}>
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Sparkles size={16} color={colors.primary} />
      </View>
      <View style={[styles.assistantBody, { marginLeft: spacing.md }]}>
        {isEmpty || message.thinking ? (
          <View style={{ paddingTop: 4 }}>
            <TypingDots />
          </View>
        ) : (
          <AssistantMessage content={message.content} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rowEnd: { alignItems: 'flex-end', marginBottom: 14 },
  rowStart: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, paddingRight: 8 },
  userBubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomRightRadius: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  assistantBody: { flex: 1, paddingTop: 2 },
});
