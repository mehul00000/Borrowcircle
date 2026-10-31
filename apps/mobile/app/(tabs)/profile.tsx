import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { formatDate, ratingLabel } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Avatar, Button, Card, Logo } from '@/components/ui';
import { colors, font } from '@/theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, showToast, signOut } = useApp();
  const [listings, setListings] = useState<api.Item[]>([]);
  const [reviews, setReviews] = useState<api.Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [items, r] = await Promise.all([api.getMyItems(), api.listReviewsForUser(user.id)]);
      setListings(items);
      setReviews(r);
      if (r.length) {
        setAvgRating(r.reduce((sum, rev) => sum + rev.rating, 0) / r.length);
      }
    })();
  }, [user]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="sm" />
        <Link href="/notifications" asChild>
          <Pressable style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={18} color={colors.deep} />
          </Pressable>
        </Link>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={profile?.full_name ?? 'BC'} size={70} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 21, color: colors.deep, letterSpacing: -0.5 }}>
            {profile?.full_name} {profile?.is_verified ? '✓' : ''}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>
            {ratingLabel(avgRating, reviews.length)} · {profile?.locality ?? 'Your area'}
          </Text>
          <Text style={{ color: colors.faint, fontSize: 10, marginTop: 2 }}>Member since {profile?.created_at ? formatDate(profile.created_at) : 'recently'}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 20 }}>
        <Button style={{ flex: 1 }} onPress={() => router.push('/settings')}>
          Settings
        </Button>
        <Button
          style={{ flex: 1 }}
          variant="secondary"
          onPress={() =>
            Alert.alert('Log out', 'Sign out of BorrowCircle on this device?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log out',
                style: 'destructive',
                onPress: () => {
                  void signOut().then(() => showToast('Signed out'));
                },
              },
            ])
          }
        >
          Log out
        </Button>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Text style={{ fontFamily: font.display, fontSize: 17, color: colors.deep, marginBottom: 12 }}>Your listings ({listings.length})</Text>
        {listings.length ? (
          listings.map((item) => (
            <Card key={item.id} onPress={() => router.push(`/item/${item.id}`)} style={{ padding: 12, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#EDF0ED', overflow: 'hidden' }}>
                <ExpoImage uri={item.image_urls?.[0] ?? ''} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.display, fontSize: 13, color: colors.ink }}>{item.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
                  {item.category?.name} · ₹{Math.round(item.borrowing_fee / 100)}/day
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </Card>
          ))
        ) : (
          <Card style={{ padding: 18 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Nothing listed yet. Share something useful!</Text>
            <Link href="/items/new" asChild>
              <Button style={{ marginTop: 12 }}>List an item</Button>
            </Link>
          </Card>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Text style={{ fontFamily: font.display, fontSize: 17, color: colors.deep, marginBottom: 12 }}>Reviews ({reviews.length})</Text>
        {reviews.length ? (
          reviews.map((r) => (
            <Card key={r.id} style={{ padding: 14, marginBottom: 10 }}>
              <Text style={{ color: colors.gold, fontSize: 12 }}>{'★'.repeat(r.rating)}</Text>
              <Text style={{ color: colors.ink, fontSize: 12, marginTop: 6, lineHeight: 18 }}>{r.comment ?? 'No comment added.'}</Text>
              <Text style={{ color: colors.faint, fontSize: 10, marginTop: 6 }}>{r.reviewer?.full_name}</Text>
            </Card>
          ))
        ) : (
          <Text style={{ color: colors.muted, fontSize: 12 }}>No reviews yet — complete a transaction to receive your first one.</Text>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Pressable onPress={() => Alert.alert('Help & support', 'For questions, issues or feedback, contact the BorrowCircle team at support@borrowcircle.app.')}>
          <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="help-circle-outline" size={20} color={colors.forest} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: colors.ink, flex: 1 }}>Help & support</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.faint} />
          </Card>
        </Pressable>
      </View>
    </ScrollView>
  );
}

import { Image } from 'expo-image';
import { StatusPill } from '@/components/ui';

function ExpoImage({ uri }: { uri: string }) {
  return <Image source={uri ? { uri } : undefined} style={{ width: '100%', height: '100%' }} contentFit="cover" />;
}

function StatusBadge({ status }: { status: string }) {
  return <StatusPill status={status} />;
}
