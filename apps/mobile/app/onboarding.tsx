import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Logo } from '@/components/ui';
import { useApp } from '@/components/AppContext';
import { colors, font, radius } from '@/theme';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1709879057923-9f846b583154?auto=format&fit=crop&w=1200&q=85',
    kicker: 'Welcome to BorrowCircle',
    title: 'Your neighbourhood has more to offer.',
    text: 'Useful things sit unused every day — while someone nearby needs exactly that. BorrowCircle connects the two.',
  },
  {
    image: 'https://images.unsplash.com/photo-1595475349262-88ba1e1eecaf?auto=format&fit=crop&w=1200&q=85',
    kicker: 'Simple and safe',
    title: 'Borrow what you need. Share what you own.',
    text: 'Clear agreements, condition records and community ratings keep every exchange easy and respectful.',
  },
  {
    image: 'https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=1200&q=85',
    kicker: 'Location, on your terms',
    title: 'Good things are better when shared.',
    text: 'We use your approximate area to show items nearby. Your exact location is never shared — you can also pick your area manually.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { setOnboarded } = useApp();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  function finish() {
    setOnboarded();
    router.replace('/login');
  }

  function next() {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topbar}>
        <Logo />
        <Pressable onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width))}
        renderItem={({ item }) => (
          <View style={{ width: Dimensions.get('window').width, paddingHorizontal: 24 }}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            </View>
            <Text style={styles.kicker}>{item.kicker}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button onPress={next} style={{ flex: 1 }}>
          {index < slides.length - 1 ? (
            'Continue'
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.white, fontFamily: font.bodyBold, fontSize: 14 }}>Get started</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          )}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  skip: { color: colors.muted, fontFamily: font.bodySemi, fontSize: 13 },
  imageWrap: { borderRadius: radius.hero, overflow: 'hidden', marginTop: 8, borderWidth: 8, borderColor: colors.white, backgroundColor: '#EDF0ED' },
  image: { width: '100%', height: 340 },
  kicker: { color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10, marginTop: 26 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36, color: colors.deep, letterSpacing: -1, marginTop: 10 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 12 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.forest, width: 20 },
});
