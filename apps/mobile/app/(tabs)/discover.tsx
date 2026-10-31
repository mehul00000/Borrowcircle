import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Button, EmptyState, ItemCard } from '@/components/ui';
import { colors, font, radius } from '@/theme';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'nearest', label: 'Nearest first' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'newest', label: 'Recently listed' },
] as const;

export default function Discover() {
  const params = useLocalSearchParams<{ category?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedIds, toggleSave } = useApp();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]['value']>('recommended');
  const [items, setItems] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setCategorySlug(params.category ?? null);
  }, [params.category]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.listItems({ query: submitted, categorySlug, sort }));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [submitted, categorySlug, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>Discover nearby</Text>
        <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, letterSpacing: -1, marginTop: 6 }}>Find something useful.</Text>
      </View>

      <View style={[styles.searchBar, { marginTop: 16 }]}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query)}
          placeholder="Search cameras, tools, books..."
          placeholderTextColor={colors.faint}
          style={{ flex: 1, fontSize: 14, color: colors.ink, fontFamily: font.body }}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => { setQuery(''); setSubmitted(''); }}>
            <Ionicons name="close-circle" size={18} color={colors.faint} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Chip label="All" active={!categorySlug} onPress={() => setCategorySlug(null)} />
          {categories.map((c) => (
            <Chip key={c.id} label={c.name} active={categorySlug === c.slug} onPress={() => setCategorySlug(c.slug)} />
          ))}
        </ScrollView>
        <Pressable
          onPress={() => {
            const next = SORTS[(SORTS.findIndex((s) => s.value === sort) + 1) % SORTS.length];
            setSort(next.value);
          }}
          style={{ paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 }}
        >
          <Ionicons name="swap-vertical" size={14} color={colors.forest} />
          <Text style={{ color: colors.forest, fontFamily: font.bodyBold, fontSize: 11 }}>{SORTS.find((s) => s.value === sort)?.label}</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: colors.ink }}>{loading ? 'Searching…' : `${items.length} useful things nearby`}</Text>
        <Text style={{ color: colors.faint, fontSize: 9 }}>Exact locations shared after acceptance</Text>
      </View>

      {loading ? (
        <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Loading…</Text>
      ) : items.length ? (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(i) => i.id}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
          renderItem={({ item }) => <ItemCard item={item} style={{ flex: 1 }} saved={savedIds.includes(item.id)} onSave={() => void toggleSave(item.id)} onPress={() => router.push(`/item/${item.id}`)} />}
        />
      ) : (
        <View style={{ paddingHorizontal: 20 }}>
          <EmptyState
            icon="search"
            title="No items found nearby"
            text="Try changing your search or choosing another category."
            action={
              <Button
                onPress={() => {
                  setQuery('');
                  setSubmitted('');
                  setCategorySlug(null);
                }}
              >
                Clear filters
              </Button>
            }
          />
        </View>
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: active ? colors.deep : colors.border,
        backgroundColor: active ? colors.deep : colors.white,
        borderRadius: radius.pill,
        paddingHorizontal: 14,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: active ? colors.white : colors.muted, fontSize: 11, fontFamily: font.bodySemi }}>{label}</Text>
    </Pressable>
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
    height: 50,
  },
});
