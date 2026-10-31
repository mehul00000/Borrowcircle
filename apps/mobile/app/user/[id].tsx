import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as api from '@borrowcircle/shared';
import { formatDate, initials, ratingLabel } from '@borrowcircle/shared';
import { Avatar, Card, EmptyState } from '@/components/ui';
import { colors, font } from '@/theme';
import { itemImageUrl } from '@/lib/backend';

export default function PublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState<api.PublicProfile | null>(null);
  const [reviews, setReviews] = useState<api.Review[]>([]);
  const [listings, setListings] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const p = await api.getPublicProfile(id);
        setProfile(p);
        if (p) {
          const [r, items] = await Promise.all([api.listReviewsForUser(id), api.listItems({ limit: 60 })]);
          setReviews(r);
          setListings(items.filter((i) => i.owner_id === id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 100, color: colors.muted }}>Loading…</Text>;
  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 30, backgroundColor: colors.bg }}>
        <EmptyState icon="person-outline" title="Profile not found" text="This member may have deactivated their account." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={profile.full_name} size={70} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 21, color: colors.deep, letterSpacing: -0.5 }}>
            {profile.full_name} {profile.is_verified ? '✓' : ''}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>
            {ratingLabel(profile.rating_avg, profile.rating_count)}
          </Text>
          <Text style={{ color: colors.faint, fontSize: 10, marginTop: 2 }}>
            {profile.locality ? `${profile.locality}, ` : ''}
            {profile.city} · Member since {profile.created_at ? formatDate(profile.created_at) : 'recently'}
          </Text>
        </View>
      </View>
      {profile.bio ? <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 14 }}>{profile.bio}</Text> : null}

      <Text style={{ fontFamily: font.display, fontSize: 17, color: colors.deep, marginTop: 24, marginBottom: 12 }}>Listings ({listings.length})</Text>
      {listings.length ? (
        listings.map((item) => (
          <Card key={item.id} onPress={() => router.push(`/item/${item.id}`)} style={{ padding: 12, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#EDF0ED', overflow: 'hidden' }}>
              {itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path) ? (
                <Image source={{ uri: itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 13, color: colors.ink }}>{item.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
                {item.condition} · ₹{Math.round(item.borrowing_fee / 100)}/day
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.faint} />
          </Card>
        ))
      ) : (
        <Text style={{ color: colors.muted, fontSize: 12 }}>No active listings.</Text>
      )}

      <Text style={{ fontFamily: font.display, fontSize: 17, color: colors.deep, marginTop: 24, marginBottom: 12 }}>Reviews ({reviews.length})</Text>
      {reviews.length ? (
        reviews.map((r) => (
          <Card key={r.id} style={{ padding: 14, marginBottom: 10 }}>
            <Text style={{ color: colors.gold, fontSize: 12 }}>{'★'.repeat(r.rating)}</Text>
            <Text style={{ color: colors.ink, fontSize: 12, marginTop: 6, lineHeight: 18 }}>{r.comment ?? 'No comment added.'}</Text>
            <Text style={{ color: colors.faint, fontSize: 10, marginTop: 6 }}>
              {r.reviewer?.full_name ?? initials('Unknown')} · {formatDate(r.created_at)}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={{ color: colors.muted, fontSize: 12 }}>No reviews yet.</Text>
      )}
    </ScrollView>
  );
}
