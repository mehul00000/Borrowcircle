import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert as RNAlert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { activeBackend } from '@/lib/backend';
import { useApp } from '@/components/AppContext';
import { Button, Card } from '@/components/ui';
import { colors, font } from '@/theme';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, showToast, refresh } = useApp();
  const [form, setForm] = useState({ full_name: '', username: '', bio: '', city: '', locality: '' });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        locality: profile.locality ?? '',
      });
    }
  }, [profile]);

  async function save() {
    setBusy(true);
    try {
      await api.updateMyProfile(form as Partial<api.Profile>);
      showToast('Profile updated');
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setBusy(false);
    }
  }

  async function togglePush(value: boolean) {
    if (value) {
      try {
        const Notifications = await import('expo-notifications');
        const existing = await Notifications.getPermissionsAsync();
        const granted = existing.granted || (await Notifications.requestPermissionsAsync()).granted;
        setPushEnabled(granted);
        showToast(granted ? 'Push notifications enabled' : 'Notification permission was declined');
        if (granted) {
          const token = await Notifications.getDevicePushTokenAsync().catch(() => null);
          // Expo Push — delivered by the send-notification Edge Function.
          void token;
          if (activeBackend() === 'supabase' && token) {
            await api.registerPushToken(token.data, Platform.OS === 'ios' ? 'ios' : 'android');
          }
        }
      } catch {
        setPushEnabled(false);
        showToast('Push is unavailable in demo mode');
      }
    } else {
      setPushEnabled(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 50, paddingHorizontal: 20 }}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Ionicons name="chevron-back" size={18} color={colors.forest} />
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, fontSize: 13 }}>Back</Text>
      </Pressable>
      <Text style={{ fontFamily: font.display, fontSize: 27, color: colors.deep, letterSpacing: -0.8 }}>Settings</Text>

      <Card style={{ padding: 18, marginTop: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 16, color: colors.deep, marginBottom: 14 }}>Profile</Text>
        {(
          [
            ['full_name', 'Full name'],
            ['username', 'Username'],
            ['city', 'City'],
            ['locality', 'Locality (approximate area)'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={{ marginBottom: 13 }}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} value={form[key]} onChangeText={(t) => setForm({ ...form, [key]: t })} placeholderTextColor={colors.faint} />
          </View>
        ))}
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} multiline value={form.bio} onChangeText={(t) => setForm({ ...form, bio: t })} placeholderTextColor={colors.faint} />
        <Button onPress={() => void save()} disabled={busy} style={{ marginTop: 8 }}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </Card>

      <Card style={{ padding: 18, marginTop: 16 }}>
        <Text style={{ fontFamily: font.display, fontSize: 16, color: colors.deep, marginBottom: 10 }}>Notifications</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 14 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: colors.ink }}>Push notifications</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3, lineHeight: 16 }}>Request alerts, agreement updates and return reminders.</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={(v) => void togglePush(v)} trackColor={{ true: colors.forest, false: colors.border }} />
        </View>
      </Card>

      <Card style={{ padding: 18, marginTop: 16 }}>
        <Text style={{ fontFamily: font.display, fontSize: 16, color: colors.deep, marginBottom: 8 }}>Privacy</Text>
        <Text style={{ color: colors.muted, fontSize: 11.5, lineHeight: 18 }}>
          BorrowCircle never publishes your exact address or coordinates. Handover locations are shared only between the two participants of an accepted transaction, and condition evidence is private.
        </Text>
      </Card>

      <Button
        variant="secondary"
        style={{ marginTop: 20 }}
        onPress={() =>
          RNAlert.alert('Log out', 'Sign out of BorrowCircle on this device?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log out',
              style: 'destructive',
              onPress: () => {
                void api.signOut().then(() => showToast('Signed out'));
              },
            },
          ])
        }
      >
        Log out
      </Button>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.muted, marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 14, minHeight: 46, fontSize: 14, color: colors.ink, fontFamily: 'Inter_400Regular' },
});
