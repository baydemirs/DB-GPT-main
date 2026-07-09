import { Tabs } from 'expo-router';
import { Compass, House, MessagesSquare, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { selection } from '../../src/utils/haptics';

export default function TabsLayout() {
  const theme = useTheme();
  const { colors, font } = theme;
  const insets = useSafeAreaInsets();

  // Android gezinme çubuğu (||| O <) yüksekliği kadar alt boşluk bırak.
  const bottomInset = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset + 8,
        },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
        tabBarIconStyle: { marginTop: 2 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
      screenListeners={{ tabPress: () => selection() }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Ana Sayfa', tabBarIcon: ({ color }) => <House size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: 'Sohbetler', tabBarIcon: ({ color }) => <MessagesSquare size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Keşfet', tabBarIcon: ({ color }) => <Compass size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
      />
    </Tabs>
  );
}
