import { useOAuth } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useApp } from '@/components/AppContext';
import { colors, font } from '@/theme';

// Keep the in-app browser session warm for a snappier OAuth open.
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

/**
 * "Continue with Google" — Clerk OAuth via an in-app browser.
 *
 * The redirect URI is the app's deep-link scheme; make sure
 * `borrowcircle://oauth2-redirect` is added to the Google connection's
 * allowed redirect URLs in the Clerk dashboard.
 */
export function GoogleButton({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  useWarmUpBrowser();
  const { showToast, refresh } = useApp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = useCallback(async () => {
    // OAuth needs the app's own deep-link scheme (borrowcircle://), which
    // Expo Go intercepts with its exp:// scheme — requires a dev/prod build.
    if ((Constants as { appOwnership?: string }).appOwnership === 'expo') {
      showToast('Google sign-in needs a development build (run: npx expo run:android, or eas build)');
      return;
    }
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'borrowcircle', path: 'oauth2-redirect' });
      const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        // The app-state provider auto-creates the Supabase profile from the
        // Clerk profile on the next session sync.
        showToast(mode === 'sign-up' ? 'Welcome to BorrowCircle' : 'Welcome back');
        refresh();
      } else {
        showToast('Google sign-in was cancelled');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }, [startOAuthFlow, showToast, refresh, mode]);

  return (
    <Pressable
      onPress={() => void onPress()}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="logo-google" size={17} color="#DB4437" />
      </View>
      <Text style={styles.label}>
        {mode === 'sign-up' ? 'Sign up with Google' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: 12,
  },
  iconWrap: { width: 22, alignItems: 'center' },
  label: { color: colors.ink, fontFamily: font.bodySemi, fontSize: 13.5 },
});
