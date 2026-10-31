import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@borrowcircle/shared';
import { dayCount, feeLabel, fieldErrors, formatMoney, initials } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Alert } from '@/components/AuthShell';
import { Button } from '@/components/ui';
import { colors, font, radius, shadow } from '@/theme';
import { itemImageUrl } from '@/lib/backend';

const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, savedIds, toggleSave, showToast } = useApp();
  const [item, setItem] = useState<api.Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [startDate, setStartDate] = useState(plusDays(1));
  const [endDate, setEndDate] = useState(plusDays(4));
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setItem(await api.getItem(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this listing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const days = useMemo(() => {
    try {
      return dayCount(startDate, endDate);
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  if (loading) return <Centered text="Loading…" />;
  if (!item) return <Centered text={error || 'Listing unavailable.'} />;

  const image = itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path);
  const saved = savedIds.includes(item.id);
  const isOwner = user?.id === item.owner_id;
  const total = item.borrowing_fee * Math.max(days, 1);

  async function submitRequest() {
    if (!user) {
      showToast('Sign in to send a borrowing request');
      router.replace('/login');
      return;
    }
    const parsed = api.borrowRequestSchema.safeParse({ start_date: startDate, end_date: endDate, message });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const request = await api.createBorrowRequest({ item_id: item!.id, start_date: startDate, end_date: endDate, message });
      setRequestOpen(false);
      showToast('Request sent to the owner');
      router.push(`/borrowing/${request.id}`);
    } catch (err) {
      setErrors({ _: err instanceof Error ? err.message : 'Could not send the request.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ height: 320, backgroundColor: '#EDF0ED', position: 'relative' }}>
          {image ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: colors.forest, fontSize: 9, fontFamily: font.bodyBold }}>{item.status === 'ACTIVE' ? 'AVAILABLE NOW' : 'CURRENTLY OUT'}</Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -26 }}>
          <View style={[styles.sheet, shadow.card]}>
            <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 9 }}>
              {item.category?.name} · {item.location_label}
            </Text>
            <Text style={{ fontFamily: font.display, fontSize: 24, color: colors.deep, letterSpacing: -0.8, marginTop: 8 }}>{item.title}</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={13} color={colors.gold} />
                <Text style={{ fontSize: 11, color: colors.muted }}>{item.owner?.rating_avg ? item.owner.rating_avg.toFixed(1) : 'New'} · {item.owner?.rating_count ?? 0} reviews</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.muted }}>{item.condition} condition</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 20, marginTop: 16 }}>{item.description}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 14, marginTop: 18 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.forest, fontSize: 10, fontFamily: font.bodyBold }}>{initials(item.owner?.full_name ?? 'BC')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 9 }}>Shared by</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: colors.ink }}>
                  {item.owner?.full_name} {item.owner?.is_verified ? '✓' : ''}
                </Text>
              </View>
              <View style={{ backgroundColor: colors.greenLight, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 }}>
                <Text style={{ color: colors.forest, fontSize: 9, fontFamily: font.bodyBold }}>Verified lender</Text>
              </View>
            </View>

            <View style={{ backgroundColor: colors.greenSoft, borderRadius: 12, padding: 14, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.muted, fontSize: 9, marginBottom: 3 }}>Borrowing fee</Text>
                <Text style={{ fontSize: 12, color: colors.ink, fontFamily: font.bodySemi }}>{feeLabel(item.borrowing_fee)}</Text>
              </View>
              <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: colors.forest }}>{formatMoney(total)}</Text>
            </View>
            {item.security_deposit > 0 && (
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 8 }}>Refundable deposit of {formatMoney(item.security_deposit)} applies.</Text>
            )}

            <View style={{ marginTop: 16, gap: 8 }}>
              <DateRow label="Start date" value={startDate} min={plusDays(0)} onChange={setStartDate} />
              <DateRow label="Return date" value={endDate} min={startDate} onChange={setEndDate} />
              {errors.end_date ? <Text style={{ color: colors.red, fontSize: 11 }}>{errors.end_date}</Text> : null}
            </View>

            {isOwner ? (
              <View style={{ marginTop: 16 }}>
                <Alert kind="info" text="This is your listing." />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
                <Button style={{ flex: 1.4 }} onPress={() => setRequestOpen(true)}>
                  Request to borrow
                </Button>
                <Button style={{ flex: 1 }} variant="secondary" onPress={() => void toggleSave(item.id)}>
                  {saved ? 'Saved' : 'Save item'}
                </Button>
              </View>
            )}
          </View>

          <Pressable
            onPress={() =>
              api
                .createReport({ reason: 'Listing reported from mobile', reported_item_id: item.id })
                .then(() => showToast('Report submitted — thank you'))
                .catch(() => showToast('Could not submit the report'))
            }
          >
            <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center', paddingVertical: 14 }}>Report this listing</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={requestOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(7,32,25,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: insets.bottom + 22 }}>
            <Text style={{ fontFamily: font.display, fontSize: 19, color: colors.deep }}>Request to borrow</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 16 }}>
              {Math.max(days, 1)} day(s) × {feeLabel(item.borrowing_fee)} = {formatMoney(total)}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.muted, marginBottom: 7 }}>Message to the owner (optional)</Text>
            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Introduce yourself and explain what you need."
                placeholderTextColor={colors.faint}
                multiline
                style={{ minHeight: 60, fontSize: 13, color: colors.ink, fontFamily: font.body }}
              />
            </View>
            {errors._ ? <Alert kind="error" text={errors._} /> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => setRequestOpen(false)}>
                Cancel
              </Button>
              <Button style={{ flex: 1.4 }} onPress={() => void submitRequest()} disabled={busy}>
                {busy ? 'Sending…' : 'Send request'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DateRow({ label, value, min, onChange }: { label: string; value: string; min: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: colors.white }}>
        <Text style={{ fontSize: 13, color: colors.ink, fontFamily: font.bodySemi }}>{value}</Text>
        <Ionicons name="calendar-outline" size={15} color={colors.forest} />
      </Pressable>
      {open && (
        <DateTimePicker
          value={new Date(`${value}T00:00:00`)}
          minimumDate={new Date(`${min}T00:00:00`)}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setOpen(false);
            if (date) onChange(date.toISOString().slice(0, 10));
          }}
        />
      )}
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.white, borderRadius: radius.cardLg, padding: 20 },
});
