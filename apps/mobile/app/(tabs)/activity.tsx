import { Link, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '@borrowcircle/shared';
import { formatDate, formatMoney, statusLabel } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Button, EmptyState, StatusPill, Card } from '@/components/ui';
import { colors, font } from '@/theme';
import { itemImageUrl } from '@/lib/backend';

type Tab = 'borrowing' | 'lending' | 'history';

export default function Activity() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>('borrowing');
  const [requests, setRequests] = useState<api.BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (tab === 'history') {
        const all = await api.listMyRequests({ role: 'all' });
        setRequests(all.filter((r) => !api.isLiveStatus(r.status)));
      } else {
        setRequests(await api.listMyRequests({ role: tab === 'borrowing' ? 'borrower' : 'lender' }));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>Activity</Text>
        <Text style={{ fontFamily: font.display, fontSize: 28, color: colors.deep, letterSpacing: -1, marginTop: 6 }}>Requests & borrowings</Text>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 4, marginHorizontal: 20, marginTop: 16, gap: 4 }}>
        {(
          [
            ['borrowing', 'Borrowing'],
            ['lending', 'Lending'],
            ['history', 'History'],
          ] as const
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, backgroundColor: tab === key ? colors.deep : 'transparent', borderRadius: 9, paddingVertical: 9, alignItems: 'center' }}>
            <Text style={{ color: tab === key ? colors.white : colors.muted, fontFamily: font.bodyBold, fontSize: 12 }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
        renderItem={({ item: r }) => {
          const isLender = r.lender_id === user?.id;
          const other = isLender ? r.borrower : r.lender;
          const image = r.item ? itemImageUrl(r.item.image_urls?.[0] ?? r.item.images?.[0]?.storage_path) : '';
          return (
            <Card onPress={() => router.push(`/borrowing/${r.id}`)} style={{ padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {image ? (
                <View style={{ width: 76, height: 64, borderRadius: 10, overflow: 'hidden', backgroundColor: '#EDF0ED' }}>
                  <ExpoImage uri={image} />
                </View>
              ) : (
                <View style={{ width: 76, height: 64, borderRadius: 10, backgroundColor: '#EDF0ED' }} />
              )}
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: font.display, fontSize: 13, color: colors.ink }}>{r.item?.title ?? 'Listing removed'}</Text>
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>
                  {isLender ? 'From' : 'To'} {other?.full_name} · {formatMoney(r.borrowing_fee)}
                </Text>
                <Text style={{ color: colors.faint, fontSize: 9, marginTop: 2 }}>
                  {formatDate(r.start_date)} → {formatDate(r.end_date)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <StatusPill status={r.status} />
                <Text style={{ fontSize: 9, color: colors.faint }}>{statusLabel(r.status) === r.status ? '' : ''}</Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Loading…</Text>
          ) : (
            <EmptyState
              icon="calendar"
              title={tab === 'lending' ? 'No requests received' : 'Nothing borrowed yet'}
              text="Requests, active borrowings and completed transactions appear here."
              action={
                <Link href="/discover" asChild>
                  <Button>Discover items</Button>
                </Link>
              }
            />
          )
        }
      />
    </View>
  );
}

function ExpoImage({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />;
}
