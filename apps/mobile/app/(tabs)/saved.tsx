import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Button, EmptyState, ItemCard } from '@/components/ui';
import { colors, font } from '@/theme';

export default function Saved() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savedIds, toggleSave } = useApp();
  const [saved, setSaved] = useState<api.SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setSaved(await api.listSavedItems());
      setLoading(false);
    })();
  }, [savedIds]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>Your shortlist</Text>
        <Text style={{ fontFamily: font.display, fontSize: 28, color: colors.deep, letterSpacing: -1, marginTop: 6 }}>Saved items</Text>
      </View>
      <FlatList
        data={saved}
        numColumns={2}
        keyExtractor={(s) => s.id}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 20 }}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
        renderItem={({ item: s }) =>
          s.item ? (
            <ItemCard item={s.item} saved onPress={() => router.push(`/item/${s.item_id}`)} onSave={() => void toggleSave(s.item_id)} style={{ flex: 1 }} />
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Loading…</Text>
          ) : (
            <View style={{ paddingHorizontal: 0 }}>
              <EmptyState
                icon="heart"
                title="Nothing saved yet"
                text="Tap the heart on any listing to keep it here for later."
                action={
                  <Link href="/discover" asChild>
                    <Button>Discover items</Button>
                  </Link>
                }
              />
            </View>
          )
        }
      />
    </View>
  );
}
