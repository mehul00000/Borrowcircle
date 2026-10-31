import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/ui';
import { useApp } from '@/components/AppContext';
import { colors, font } from '@/theme';

// Landing route for Clerk OAuth redirects (borrowcircle://oauth2-redirect).
// Clerk finishes the session exchange when the deep link arrives; this screen
// just holds the UI until then and moves into the app.
export default function OAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { refresh } = useApp();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refresh();
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router, refresh]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.deep, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
      <Logo inverse />
      <Text style={{ color: '#A8CFC1', fontSize: 12, fontFamily: font.bodySemi, marginTop: 18 }}>
        Finishing sign-in…
      </Text>
      <ActivityIndicator color={colors.white} size="large" style={{ marginTop: 16 }} />
    </View>
  );
}
