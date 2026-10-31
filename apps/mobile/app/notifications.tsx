import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { formatRelativeTime } from '@borrowcircle/shared';
import { useRouter } from 'expo-router';
import { useApp } from '@/components/AppContext';
import { Button, EmptyState } from '@/components/ui';
import { colors, font } from '@/theme';

const TYPE_ICONS: Partial<Record<api.NotificationType, keyof typeof Ionicons.glyphMap>> = {
  BORROW_REQUEST_RECEIVED: 'calendar-outline',
  BORROW_REQUEST_ACCEPTED: 'checkmark-circle-outline',
  BORROW_REQUEST_DECLINED: 'close-circle-outline',
  AGREEMENT_REQUIRED: 'document-text-outline',
  AGREEMENT_COMPLETED: 'checkmark-circle-outline',
  HANDOVER_REMINDER: 'time-outline',
  BORROWING_STARTED: 'cube-outline',
  RETURN_REMINDER: 'time-outline',
  RETURN_INITIATED: 'cube-outline',
  RETURN_COMPLETED: 'checkmark-circle-outline',
  BORROWING_OVERDUE: 'notifications-outline',
  DISPUTE_UPDATED: 'shield-outline',
  NEW_REVIEW: 'star-outline',
};

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUnread } = useApp();
  const [notifications, setNotifications] = useState<api.AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setNotifications(await api.listNotifications());
      setLoading(false);
    })();
  }, []);

  async function open(n: api.AppNotification) {
    if (!n.is_read) {
      await api.markNotificationRead(n.id);
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      refreshUnread();
    }
    if (n.reference_id) router.push(`/borrowing/${n.reference_id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 14 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>Stay in the loop</Text>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: colors.deep, letterSpacing: -0.8, marginTop: 6 }}>Notifications</Text>
        </View>
        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="secondary"
            onPress={async () => {
              await api.markAllNotificationsRead();
              setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
              refreshUnread();
            }}
          >
            Mark all read
          </Button>
        )}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Loading…</Text>
        ) : notifications.length ? (
          notifications.map((n) => (
            <Pressable key={n.id} onPress={() => void open(n)} style={{ flexDirection: 'row', gap: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderLeftWidth: n.is_read ? 1 : 3, borderLeftColor: n.is_read ? colors.border : colors.forest, borderRadius: 14, padding: 15 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={TYPE_ICONS[n.type] ?? 'notifications-outline'} size={17} color={colors.forest} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12.5, color: colors.ink }}>{n.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2, lineHeight: 17 }}>{n.message}</Text>
                <Text style={{ color: colors.faint, fontSize: 9.5, marginTop: 4 }}>{formatRelativeTime(n.created_at)}</Text>
              </View>
              {!n.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.forest, marginTop: 5 }} />}
            </Pressable>
          ))
        ) : (
          <EmptyState icon="notifications-outline" title="No notifications yet" text="Updates about your requests, agreements and returns will appear here." />
        )}
      </ScrollView>
    </View>
  );
}
