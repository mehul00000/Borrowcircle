import type { ReactNode } from 'react';
import { Link, Stack } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/ui';
import { colors, font } from '@/theme';

export function AuthShell({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32, flex: 1 }}>
            <Logo />
            {children}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=900&q=80' }}
        style={{ height: 130, width: '100%' }}
        resizeMode="cover"
      />
      <View style={{ backgroundColor: colors.deep, paddingHorizontal: 24, paddingVertical: 18 }}>
        <Text style={{ color: '#A8CFC1', fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 9 }}>Better together</Text>
        <Text style={{ color: colors.white, fontFamily: font.display, fontSize: 17, marginTop: 6 }}>Why buy when you can borrow?</Text>
      </View>
    </View>
  );
}

export function AuthLink({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 22 }}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{text} </Text>
      <Link href={href as never}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, fontSize: 13 }}>{linkText}</Text>
      </Link>
    </View>
  );
}

export function Alert({ kind, text }: { kind: 'error' | 'success' | 'info'; text: string }) {
  const palette = { error: { bg: colors.redBg, fg: '#A83C3C' }, success: { bg: colors.successBg, fg: colors.success }, info: { bg: colors.blueBg, fg: colors.blue } }[kind];
  return (
    <View style={{ backgroundColor: palette.bg, borderRadius: 12, padding: 12, marginBottom: 16 }}>
      <Text style={{ color: palette.fg, fontSize: 12, fontFamily: font.bodySemi }}>{text}</Text>
    </View>
  );
}
