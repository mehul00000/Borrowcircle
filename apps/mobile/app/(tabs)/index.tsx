import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { CATEGORY_SHORTCUTS } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Button, Card, ItemCard, Logo, SectionHeading } from '@/components/ui';
import { colors, font, radius, shadow } from '@/theme';

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  photography: 'camera-outline',
  'tools-and-hardware': 'build-outline',
  electronics: 'flash-outline',
  'books-and-study-material': 'book-outline',
  'sports-and-fitness': 'star-outline',
  'travel-and-luggage': 'briefcase-outline',
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, savedIds, toggleSave } = useApp();
  const [items, setItems] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api
      .listItems({ limit: 6 })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: colors.deep, letterSpacing: -0.5 }}>Hey, {profile?.full_name?.split(' ')[0] ?? 'neighbour'} 👋</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <Ionicons name="location-outline" size={12} color={colors.forest} />
            <Text style={{ color: colors.muted, fontSize: 11, fontFamily: font.bodySemi }}>Discovering near {profile?.locality ?? 'RK Puram'}</Text>
          </View>
        </View>
        <Link href="/notifications" asChild>
          <Pressable style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={19} color={colors.deep} />
          </Pressable>
        </Link>
      </View>

      <Link href="/discover" asChild>
        <Pressable style={[styles.searchBar, { marginTop: 18 }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <Text style={styles.searchText}>What are you looking for?</Text>
        </Pressable>
      </Link>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20, marginTop: 18 }}>
        {CATEGORY_SHORTCUTS.map((c, i) => (
          <Link key={c.slug} href={`/discover?category=${c.slug}`} asChild>
            <Pressable style={[styles.categoryCard, { backgroundColor: ['#EAF3F5', '#F4EEE4', '#EDF3E9', '#F3EDF5', '#EAF3F5', '#F7F1DF'][i] }]}>
              <View style={styles.categoryIcon}>
                <Ionicons name={categoryIcons[c.slug] ?? 'cube-outline'} size={20} color={colors.deep} />
              </View>
              <Text style={styles.categoryName}>{c.name}</Text>
              <Text style={styles.categoryCount}>{c.count}</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
        <SectionHeading
          kicker="Around your neighbourhood"
          title="Popular near you"
          action={
            <Link href="/discover" asChild>
              <Pressable>
                <Text style={{ color: colors.forest, fontFamily: font.bodyBold, fontSize: 12 }}>See all</Text>
              </Pressable>
            </Link>
          }
        />
        <FlatList
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14 }}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              width={250}
              saved={savedIds.includes(item.id)}
              onSave={() => void toggleSave(item.id)}
              onPress={() => router.push(`/item/${item.id}`)}
            />
          )}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={loading ? null : <Text style={{ color: colors.muted, fontSize: 12 }}>No items nearby yet.</Text>}
        />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <View style={[styles.heroCard, { backgroundColor: colors.deep }]}>
          <Text style={{ color: '#A8CFC1', fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 9 }}>Share what you have</Text>
          <Text style={{ color: colors.white, fontFamily: font.display, fontSize: 20, lineHeight: 27, marginTop: 8, letterSpacing: -0.4 }}>
            That thing sitting unused? Someone nearby needs it.
          </Text>
          <Link href="/items/new" asChild>
            <Button variant="light" style={{ marginTop: 16, alignSelf: 'flex-start' }}>
              List an item
            </Button>
          </Link>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <SectionHeading kicker="Simple by nature" title="How BorrowCircle works" />
        {[
          ['search', 'Discover', 'Find useful items available from trusted people in your neighbourhood.'],
          ['calendar', 'Request', 'Pick your dates, review clear terms and send a request to the owner.'],
          ['cube', 'Borrow & return', 'Meet nearby, enjoy what you need, and return it when you’re done.'],
        ].map(([icon, title, text], i) => (
          <Card key={title} style={{ padding: 16, marginBottom: 10, flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={icon as never} size={22} color={colors.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 14, color: colors.deep }}>
                {String(i + 1).padStart(2, '0')} · {title}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 3 }}>{text}</Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 52,
  },
  searchText: { color: colors.faint, fontSize: 13 },
  categoryCard: { borderRadius: radius.card, padding: 14, width: 130, minHeight: 108 },
  categoryIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontFamily: font.bodyBold, fontSize: 12, color: colors.deep, marginTop: 10 },
  categoryCount: { color: colors.muted, fontSize: 9, marginTop: 4 },
  heroCard: { borderRadius: radius.cardLg, padding: 22 },
});
