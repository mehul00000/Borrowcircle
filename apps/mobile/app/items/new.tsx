import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert as RNAlert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as api from '@borrowcircle/shared';
import { CONDITIONS, WIZARD_STEPS } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Button } from '@/components/ui';
import { colors, font, radius } from '@/theme';
import { uriToBlob } from '@/lib/backend';

const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function NewItemWizard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast, user } = useApp();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [details, setDetails] = useState({ title: '', description: '', category_id: '', condition: 'Good' });
  const [terms, setTerms] = useState({ borrowing_fee: '50', security_deposit: '200', minimum_days: '1', maximum_days: '14', borrowing_rules: '' });
  const [availability, setAvailability] = useState({ from: plusDays(0), until: plusDays(90) });
  const [locationLabel, setLocationLabel] = useState('RK Puram, Delhi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function pickImage(fromCamera: boolean) {
    const permission = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Permission needed to add photos');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, selectionLimit: 6, allowsMultipleSelection: true });
    if (!result.canceled) setUris((u) => [...u, ...result.assets.map((a) => a.uri)].slice(0, 6));
  }

  function validate(): string | null {
    if (step === 0 && uris.length === 0) return 'Add at least one photo.';
    if (step === 1) {
      if (details.title.trim().length < 4) return 'Give the item a clear title (4+ characters).';
      if (details.description.trim().length < 20) return 'Describe the item in at least 20 characters.';
      if (!details.category_id) return 'Choose a category.';
    }
    if (step === 2) {
      if (Number(terms.borrowing_fee) < 0 || Number(terms.security_deposit) < 0) return 'Fees and deposits cannot be negative.';
      if (Number(terms.maximum_days) < Number(terms.minimum_days)) return 'Maximum duration cannot be shorter than the minimum.';
    }
    if (step === 3 && availability.until <= availability.from) return 'The available-until date must be after the from date.';
    return null;
  }

  function next() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  async function publish(status: 'DRAFT' | 'ACTIVE') {
    if (!user) {
      showToast('Sign in first');
      router.replace('/login');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const images = await Promise.all(uris.map(async (uri, i) => ({ blob: await uriToBlob(uri), fileName: `item_${Date.now()}_${i}.jpg` })));
      await api.createItem(
        {
          title: details.title,
          description: details.description,
          category_id: details.category_id,
          condition: details.condition as api.Item['condition'],
          borrowing_fee: Number(terms.borrowing_fee),
          security_deposit: Number(terms.security_deposit),
          minimum_days: Number(terms.minimum_days),
          maximum_days: terms.maximum_days ? Number(terms.maximum_days) : null,
          borrowing_rules: terms.borrowing_rules,
          location_label: locationLabel,
          approximate_latitude: 28.5673,
          approximate_longitude: 77.1855,
          available_from: availability.from,
          available_until: availability.until,
          status,
        },
        images,
      );
      showToast(status === 'ACTIVE' ? 'Listing published' : 'Draft saved');
      router.replace('/(tabs)/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish the listing.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 140, paddingHorizontal: 20 }}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>
          Step {step + 1} of {WIZARD_STEPS.length}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, marginBottom: 18 }}>
          {WIZARD_STEPS.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= step ? colors.forest : colors.border }} />
          ))}
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 27, color: colors.deep, letterSpacing: -0.8, marginBottom: 20 }}>{WIZARD_STEPS[step]}</Text>

        {error ? <Text style={{ color: colors.red, fontSize: 12, fontFamily: font.bodySemi, marginBottom: 12 }}>{error}</Text> : null}

        {step === 0 && (
          <>
            <Pressable onPress={() => void pickImage(false)} style={styles.uploadZone}>
              <Ionicons name="images-outline" size={28} color={colors.forest} />
              <Text style={styles.uploadText}>Choose from gallery</Text>
            </Pressable>
            <Pressable onPress={() => void pickImage(true)} style={[styles.uploadZone, { marginTop: 10 }]}>
              <Ionicons name="camera-outline" size={28} color={colors.forest} />
              <Text style={styles.uploadText}>Take a photo</Text>
            </Pressable>
            {uris.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {uris.map((uri, i) => (
                  <Pressable key={i} onPress={() => setUris(uris.filter((_, x) => x !== i))} style={{ width: 92, height: 70, borderRadius: 10, overflow: 'hidden' }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={details.title} onChangeText={(t) => setDetails({ ...details, title: t })} placeholder="e.g. Sony Camera Tripod" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} multiline value={details.description} onChangeText={(t) => setDetails({ ...details, description: t })} placeholder="What is it, what condition is it in, and what's included?" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setDetails({ ...details, category_id: c.id })}
                  style={{ borderWidth: 1, borderColor: details.category_id === c.id ? colors.deep : colors.border, backgroundColor: details.category_id === c.id ? colors.deep : colors.white, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 }}
                >
                  <Text style={{ color: details.category_id === c.id ? colors.white : colors.muted, fontSize: 11, fontFamily: font.bodySemi }}>{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Condition</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setDetails({ ...details, condition: c })}
                  style={{ borderWidth: 1, borderColor: details.condition === c ? colors.deep : colors.border, backgroundColor: details.condition === c ? colors.deep : colors.white, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 }}
                >
                  <Text style={{ color: details.condition === c ? colors.white : colors.muted, fontSize: 11, fontFamily: font.bodySemi }}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            {(
              [
                ['borrowing_fee', 'Borrowing fee (₹/day, 0 for free)'],
                ['security_deposit', 'Security deposit (₹, refundable)'],
                ['minimum_days', 'Minimum days'],
                ['maximum_days', 'Maximum days'],
              ] as const
            ).map(([key, label]) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={terms[key]} onChangeText={(t) => setTerms({ ...terms, [key]: t })} />
              </View>
            ))}
            <Text style={styles.label}>Borrowing rules (optional)</Text>
            <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} multiline value={terms.borrowing_rules} onChangeText={(t) => setTerms({ ...terms, borrowing_rules: t })} placeholder="e.g. Please return cleaned." placeholderTextColor={colors.faint} />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.label}>Available from</Text>
            <TextInput style={styles.input} value={availability.from} onChangeText={(t) => setAvailability({ ...availability, from: t })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>Available until</Text>
            <TextInput style={styles.input} value={availability.until} onChangeText={(t) => setAvailability({ ...availability, until: t })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.faint} />
            <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 10 }}>
              Borrowers can only request dates inside this window, and overlapping confirmed reservations are blocked automatically.
            </Text>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.label}>Approximate location label</Text>
            <TextInput style={styles.input} value={locationLabel} onChangeText={setLocationLabel} placeholder="e.g. RK Puram, Delhi" placeholderTextColor={colors.faint} />
            <View style={{ backgroundColor: colors.blueBg, borderRadius: 12, padding: 13, marginTop: 10 }}>
              <Text style={{ color: '#2C5F96', fontSize: 11, lineHeight: 17 }}>
                Your exact address is never shown. Only your approximate area is public — the precise handover spot is shared with a borrower only after you accept their request.
              </Text>
            </View>
          </>
        )}

        {step === 5 && (
          <View style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 }}>
            {uris[0] ? <Image source={{ uri: uris[0] }} style={{ width: '100%', height: 160, borderRadius: 12, backgroundColor: '#EDF0ED' }} resizeMode="cover" /> : null}
            <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', fontSize: 9, letterSpacing: 1.2, marginTop: 14 }}>
              {categories.find((c) => c.id === details.category_id)?.name}
            </Text>
            <Text style={{ fontFamily: font.display, fontSize: 19, color: colors.deep, marginTop: 6 }}>{details.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 8 }}>{details.description}</Text>
            <Text style={{ fontSize: 12, marginTop: 12, color: colors.ink }}>
              ₹{terms.borrowing_fee}/day · deposit ₹{terms.security_deposit} · {terms.minimum_days}–{terms.maximum_days} days · {details.condition} · {locationLabel}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(250,249,246,0.96)', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 12, flexDirection: 'row', gap: 10 }}>
        <Button variant="secondary" style={{ flex: 1 }} onPress={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
          Back
        </Button>
        {step < WIZARD_STEPS.length - 1 ? (
          <Button style={{ flex: 1.3 }} onPress={next}>
            Continue
          </Button>
        ) : (
          <>
            <Button variant="ghost" style={{ flex: 1 }} onPress={() => void publish('DRAFT')} disabled={busy}>
              Draft
            </Button>
            <Button style={{ flex: 1.3 }} onPress={() => void publish('ACTIVE')} disabled={busy}>
              {busy ? 'Publishing…' : 'Publish'}
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.muted, marginBottom: 7, marginTop: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, backgroundColor: colors.white, paddingHorizontal: 14, minHeight: 48, fontSize: 14, color: colors.ink, fontFamily: 'Inter_400Regular' },
  uploadZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CCD6D0', borderRadius: 18, backgroundColor: colors.white, paddingVertical: 26, alignItems: 'center', gap: 8 },
  uploadText: { color: colors.muted, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
void RNAlert;
