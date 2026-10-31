import { ClerkProvider } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { AppProvider, SupabaseBridge, useApp } from '@/components/AppContext';
import { Toast } from '@/components/ui';
import { colors } from '@/theme';
import { clerkPublishableKey, demoMode } from '@/lib/backend';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.forest, text: colors.ink },
};

// Clerk session token cache (documented pattern from @clerk/clerk-expo).
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore — token caching is best-effort
    }
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const app = (
    <ThemeProvider value={navTheme}>
      <AppProvider>
        <Gate />
      </AppProvider>
    </ThemeProvider>
  );

  return clerkPublishableKey ? (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <SupabaseBridge />
      {app}
    </ClerkProvider>
  ) : (
    app
  );
}

function Gate() {
  const { user, loading, hasOnboarded } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const authRoutes = ['/login', '/signup', '/forgot-password'];
    if (!hasOnboarded) {
      if (pathname !== '/onboarding') router.replace('/onboarding');
      return;
    }
    if (user && (authRoutes.includes(pathname) || pathname === '/onboarding')) {
      router.replace('/(tabs)');
      return;
    }
    if (!user && !authRoutes.includes(pathname) && pathname !== '/onboarding') {
      router.replace('/login');
    }
  }, [user, loading, hasOnboarded, pathname, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      {demoMode() && (
        <View style={{ backgroundColor: colors.blueBg, paddingVertical: 6 }}>
          <Text style={{ color: '#2C5F96', fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'center', paddingHorizontal: 12 }}>
            Demo mode — no backend connected; data is stored on this device only
          </Text>
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
      <ToastHost />
    </View>
  );
}

function ToastHost() {
  const { toast } = useApp();
  return <Toast message={toast} />;
}
