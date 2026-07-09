import 'react-native-gesture-handler';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConnectionBanner from '../src/components/ConnectionBanner';
import Onboarding from '../src/screens/Onboarding';
import { ChatProvider } from '../src/store/ChatContext';
import { ConnectionProvider } from '../src/store/ConnectionContext';
import { ThemeProvider, useApp } from '../src/theme/ThemeContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ConnectionProvider>
            <ChatProvider>
              <Root fontsLoaded={fontsLoaded} />
            </ChatProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme, ready, settings } = useApp();

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const barStyle = theme.scheme === 'dark' ? 'light' : 'dark';

  if (!settings.onboarded) {
    return (
      <>
        <StatusBar style={barStyle} />
        <Onboarding />
      </>
    );
  }

  return (
    <>
      <StatusBar style={barStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="select-db" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="select-knowledge" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="knowledge-space" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="skills" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="agent" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <ConnectionBanner />
    </>
  );
}
