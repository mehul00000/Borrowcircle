import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Alert as RNAlert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as api from '@borrowcircle/shared';
import { formatDate, formatDateTime, formatMoney, statusLabel, timelineFor } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Alert } from '@/components/AuthShell';
import { Button, StatusPill } from '@/components/ui';
import { colors, font, radius, shadow } from '@/theme';
import { itemImageUrl, uriToBlob } from '@/lib/backend';

export default function BorrowingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, showToast, refresh } = useApp();
  const [request, setRequest] = useState<api.BorrowRequest | null>(null);
  const [agreement, setAgreement] = useState<api.Agreement | null>(null);
  const [reports, setReports] = useState<api.ConditionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<'HANDOVER' | 'RETURN'>('HANDOVER');
  const [reportNotes, setReportNotes] = useState('');
  const [pendingUris, setPendingUris] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await api.getBorrowRequest(id);
      setRequest(r);
      if (r) {
        const [a, rs] = await Promise.all([api.getAgreement(id), api.listConditionReports(id)]);
        setAgreement(a);
        setReports(rs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this transaction.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Centered><Text style={{ color: colors.muted, fontSize: 13 }}>Loading…</Text></Centered>;
  if (!request || !user) {
    return (
      <Centered>
        <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 30 }}>{error || 'Transaction not found.'}</Text>
      </Centered>
    );
  }

  const isLender = request.lender_id === user.id;
  const isBorrower = request.borrower_id === user.id;
  const other = isLender ? request.borrower : request.lender;
  const item = request.item;
  const stages = timelineFor(request.status);
  const handoverReport = reports.find((r) => r.report_type === 'HANDOVER');
  const returnReport = reports.find((r) => r.report_type === 'RETURN');
  const itemImage = item ? itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path) : '';

  async function act(key: string, fn: () => Promise<unknown>, successMessage: string) {
    setBusy(key);
    setError('');
    try {
      await fn();
      showToast(successMessage);
      refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy('');
    }
  }

  async function pickImage(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Permission needed to document the item condition');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsMultipleSelection: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, selectionLimit: 6, allowsMultipleSelection: true });
    if (!result.canceled) {
      setPendingUris((uris) => [...uris, ...result.assets.map((a) => a.uri)].slice(0, 6));
    }
  }

  async function submitReport() {
    setBusy('report');
    try {
      const images = await Promise.all(
        pendingUris.map(async (uri, i) => ({ blob: await uriToBlob(uri), fileName: `condition_${Date.now()}_${i}.jpg` })),
      );
      await api.createConditionReport({ request_id: request!.id, report_type: reportType, notes: reportNotes, images });
      setReportNotes('');
      setPendingUris([]);
      setReportOpen(false);
      showToast('Condition report submitted');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit the report');
    } finally {
      setBusy('');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 150, paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Ionicons name="chevron-back" size={18} color={colors.forest} />
          <Text style={{ color: colors.forest, fontFamily: font.bodyBold, fontSize: 13 }}>All requests</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 9 }}>
              {isLender ? 'Lending transaction' : 'Borrowing transaction'}
            </Text>
            <Text style={{ fontFamily: font.display, fontSize: 23, color: colors.deep, letterSpacing: -0.7, marginTop: 6 }}>{item?.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 5 }}>
              {formatDate(request.start_date)} → {formatDate(request.end_date)} · {formatMoney(request.borrowing_fee)}
            </Text>
          </View>
          <StatusPill status={request.status} />
        </View>

        {error ? <View style={{ marginTop: 12 }}>{<Alert kind="error" text={error} />}</View> : null}

        {/* Timeline */}
        <View style={[styles.panel, { marginTop: 18 }]}>
          <Text style={styles.panelTitle}>Progress</Text>
          {stages.map((stage, i) => (
            <View key={stage.key} style={{ flexDirection: 'row', gap: 12, paddingBottom: i === stages.length - 1 ? 0 : 16 }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: stage.done ? colors.forest : colors.white,
                    borderWidth: 2,
                    borderColor: stage.done || stage.current ? colors.forest : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stage.done && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
                {i < stages.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 }} />}
              </View>
              <View style={{ flex: 1, paddingTop: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 12.5, color: stage.current ? colors.forest : colors.ink }}>{stage.label}</Text>
                {stage.current && <Text style={{ color: colors.faint, fontSize: 10, marginTop: 2 }}>Current stage</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Agreement */}
        {agreement && (
          <View style={[styles.agreement, { marginTop: 16 }]}>
            <Text style={{ fontFamily: font.display, fontSize: 15, color: colors.deep }}>Digital borrowing agreement</Text>
            <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3, marginBottom: 14 }}>Version {agreement.version} · Immutable snapshot of the agreed terms</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                ['Start', formatDate(request.start_date)],
                ['Return', formatDate(request.end_date)],
                ['Fee', formatMoney(request.borrowing_fee)],
                ['Deposit', formatMoney(request.security_deposit)],
              ].map(([k, v]) => (
                <View key={k} style={{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 9 }}>
                  <Text style={{ color: colors.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</Text>
                  <Text style={{ fontSize: 11, fontFamily: font.bodySemi, color: colors.deep, marginTop: 2 }}>{v}</Text>
                </View>
              ))}
            </View>
            {((agreement.agreement_content?.responsibilities as string[]) ?? []).map((r) => (
              <Text key={r} style={{ color: '#46514C', fontSize: 11, lineHeight: 19, marginTop: 8 }}>
                • {r}
              </Text>
            ))}

            {request.status === 'AWAITING_ACKNOWLEDGEMENT' ? (
              <>
                <Pressable onPress={() => setAgreeChecked(!agreeChecked)} style={{ flexDirection: 'row', gap: 9, marginTop: 16, alignItems: 'flex-start' }}>
                  <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: agreeChecked ? colors.forest : colors.border, backgroundColor: agreeChecked ? colors.forest : colors.white, alignItems: 'center', justifyContent: 'center' }}>
                    {agreeChecked && <Ionicons name="checkmark" size={11} color={colors.white} />}
                  </View>
                  <Text style={{ flex: 1, fontSize: 11.5, color: '#46514C', lineHeight: 17 }}>I have read and agree to these borrowing terms.</Text>
                </Pressable>
                <Button disabled={!agreeChecked || busy === 'ack'} onPress={() => act('ack', () => api.acknowledgeAgreement(request.id), 'Agreement acknowledged')} style={{ marginTop: 12 }}>
                  {busy === 'ack' ? 'Recording…' : 'Acknowledge agreement'}
                </Button>
              </>
            ) : (
              <View style={{ gap: 7, marginTop: 14 }}>
                <AckRow label="Borrower" done={Boolean(agreement.borrower_accepted_at)} at={agreement.borrower_accepted_at} />
                <AckRow label="Lender" done={Boolean(agreement.lender_accepted_at)} at={agreement.lender_accepted_at} />
              </View>
            )}
          </View>
        )}

        {/* Condition records */}
        <View style={[styles.panel, { marginTop: 16 }]}>
          <Text style={styles.panelTitle}>Condition records</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 12 }}>Private to you and {other?.full_name}.</Text>
          {[
            ['Initial handover condition', handoverReport],
            ['Return condition', returnReport],
          ].map(([label, report]) => {
            const r = report as api.ConditionReport | undefined;
            return (
              <View key={label as string} style={{ backgroundColor: colors.bg, borderRadius: 12, padding: 13, marginBottom: 10 }}>
                <Text style={{ color: colors.faint, fontSize: 9, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label as string}</Text>
                {r ? (
                  <>
                    <Text style={{ fontFamily: font.bodySemi, fontSize: 11.5, color: colors.ink, marginTop: 5 }}>Recorded {formatDateTime(r.created_at)}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>{r.notes ?? 'No notes added.'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                      {(r.images ?? []).map((img) => (
                        <Image key={img.id} source={img.url ? { uri: img.url } : undefined} style={{ width: 64, height: 64, borderRadius: 9, backgroundColor: '#EDF0ED' }} />
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Not yet recorded.</Text>
                )}
              </View>
            );
          })}
          {['READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE'].includes(request.status) && (
            <Button variant="secondary" onPress={() => setReportOpen(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Ionicons name="camera-outline" size={15} color={colors.forestDark} />
                <Text style={{ color: colors.forestDark, fontFamily: font.bodyBold, fontSize: 13 }}>Add condition report</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Summary */}
        <View style={[styles.panel, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {itemImage ? <ExpoImage source={{ uri: itemImage }} style={{ width: 64, height: 64, borderRadius: 10 }} contentFit="cover" /> : <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: '#EDF0ED' }} />}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 14, color: colors.ink }}>{item?.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>
                {item?.category?.name} · {item?.condition} condition
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 12, gap: 5 }}>
            <Text style={{ fontSize: 11.5, color: colors.muted }}>
              <Text style={{ color: colors.ink, fontFamily: font.bodyBold }}>Borrower:</Text> {request.borrower?.full_name}
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.muted }}>
              <Text style={{ color: colors.ink, fontFamily: font.bodyBold }}>Lender:</Text> {request.lender?.full_name}
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.muted }}>
              <Text style={{ color: colors.ink, fontFamily: font.bodyBold }}>Requested:</Text> {formatDateTime(request.created_at)}
            </Text>
          </View>
          {request.message ? (
            <View style={{ marginTop: 10 }}>
              <Alert kind="info" text={`“${request.message}”`} />
            </View>
          ) : null}
        </View>

        {request.status === 'COMPLETED' && !busy && (
          <Button variant="secondary" onPress={() => setReviewOpen(true)} style={{ marginTop: 14 }}>
            Leave a review for {other?.full_name?.split(' ')[0]}
          </Button>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(250,249,246,0.96)', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 14, paddingBottom: insets.bottom + 14 }}>
        {error ? <Text style={{ color: colors.red, fontSize: 11, marginBottom: 8 }}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{renderActions()}</View>
      </View>

      {/* Report modal */}
      <Modal visible={reportOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(7,32,25,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: insets.bottom + 22 }}>
            <Text style={{ fontFamily: font.display, fontSize: 19, color: colors.deep }}>Condition report</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 12 }}>
              {(['HANDOVER', 'RETURN'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setReportType(t)}
                  style={{ flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: reportType === t ? colors.deep : colors.bg }}
                >
                  <Text style={{ color: reportType === t ? colors.white : colors.muted, fontFamily: font.bodyBold, fontSize: 12 }}>{t === 'HANDOVER' ? 'Handover' : 'Return'}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reportNotes}
              onChangeText={setReportNotes}
              placeholder="Describe the item's condition…"
              placeholderTextColor={colors.faint}
              multiline
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, padding: 12, minHeight: 70, fontSize: 13, color: colors.ink, fontFamily: font.body, marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => void pickImage(true)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="camera-outline" size={14} color={colors.forestDark} />
                  <Text style={{ color: colors.forestDark, fontFamily: font.bodyBold, fontSize: 12 }}>Camera</Text>
                </View>
              </Button>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => void pickImage(false)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="images-outline" size={14} color={colors.forestDark} />
                  <Text style={{ color: colors.forestDark, fontFamily: font.bodyBold, fontSize: 12 }}>Gallery</Text>
                </View>
              </Button>
            </View>
            {pendingUris.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {pendingUris.map((uri, i) => (
                  <Pressable key={i} onPress={() => setPendingUris(pendingUris.filter((_, x) => x !== i))}>
                    <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 9 }} />
                  </Pressable>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button style={{ flex: 1.4 }} onPress={() => void submitReport()} disabled={busy === 'report'}>
                {busy === 'report' ? 'Submitting…' : 'Submit report'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review modal */}
      <Modal visible={reviewOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(7,32,25,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: insets.bottom + 22 }}>
            <Text style={{ fontFamily: font.display, fontSize: 19, color: colors.deep }}>Review {other?.full_name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)}>
                  <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={30} color={n <= rating ? colors.gold : colors.border} />
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="How was the experience? (optional)"
              placeholderTextColor={colors.faint}
              multiline
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, padding: 12, minHeight: 70, fontSize: 13, color: colors.ink, fontFamily: font.body, marginBottom: 14 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => setReviewOpen(false)}>
                Cancel
              </Button>
              <Button
                style={{ flex: 1.4 }}
                onPress={() => {
                  void act('review', () => api.createReview({ request_id: request!.id, reviewee_id: other!.id, rating, comment: reviewText }), 'Review submitted').then(() => setReviewOpen(false));
                }}
                disabled={busy === 'review'}
              >
                {busy === 'review' ? 'Submitting…' : 'Submit review'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function renderActions() {
    const status = request!.status;
    const buttons: ReactNode[] = [];
    if (status === 'PENDING' && isLender) {
      buttons.push(
        <Button key="accept" style={{ flex: 1 }} disabled={busy === 'accept'} onPress={() => act('accept', () => api.acceptBorrowRequest(request!.id), 'Request accepted')}>
          {busy === 'accept' ? 'Accepting…' : 'Accept request'}
        </Button>,
        <Button key="decline" variant="secondary" style={{ flex: 1 }} onPress={() => act('decline', () => api.declineBorrowRequest(request!.id), 'Request declined')}>
          Decline
        </Button>,
      );
    }
    if (status === 'PENDING' && isBorrower) {
      buttons.push(
        <Button key="cancel" variant="secondary" style={{ flex: 1 }} onPress={() => act('cancel', () => api.cancelBorrowRequest(request!.id), 'Request cancelled')}>
          Cancel request
        </Button>,
      );
    }
    if (status === 'READY_FOR_HANDOVER' && isBorrower && handoverReport) {
      buttons.push(
        <Button key="receipt" style={{ flex: 1 }} disabled={busy === 'receipt'} onPress={() => act('receipt', () => api.confirmItemReceipt(request!.id), 'Receipt confirmed — borrowing active')}>
          {busy === 'receipt' ? 'Confirming…' : 'Confirm receipt'}
        </Button>,
      );
    }
    if (['ACTIVE', 'OVERDUE'].includes(status) && isBorrower) {
      buttons.push(
        <Button key="return" style={{ flex: 1 }} onPress={() => act('return', () => api.initiateReturn(request!.id), 'Return initiated')}>
          Initiate return
        </Button>,
      );
    }
    if (['RETURN_INITIATED', 'OVERDUE'].includes(status) && isLender) {
      buttons.push(
        <Button key="confirmReturn" style={{ flex: 1 }} disabled={busy === 'confirmReturn'} onPress={() => act('confirmReturn', () => api.confirmItemReturn(request!.id), 'Return confirmed — completed')}>
          {busy === 'confirmReturn' ? 'Confirming…' : 'Confirm return'}
        </Button>,
      );
    }
    if (['PENDING', 'ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER'].includes(status)) {
      buttons.push(
        <Button key="cancelTx" variant="secondary" style={{ flex: 1 }} onPress={() => act('cancelTx', () => api.cancelBorrowRequest(request!.id), 'Transaction cancelled')}>
          Cancel transaction
        </Button>,
      );
    }
    if (['READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE'].includes(status)) {
      buttons.push(
        <Button
          key="dispute"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() =>
            RNAlert.alert('Report an issue', 'Open a dispute on this transaction? An administrator will review it.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open dispute', style: 'destructive', onPress: () => void act('dispute', () => api.reportIssue(request!.id, 'Condition disagreement'), 'Dispute opened') },
            ])
          }
        >
          Report an issue
        </Button>,
      );
    }
    if (!buttons.length) {
      return (
        <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>
          {status === 'COMPLETED'
            ? 'This transaction is complete. Thank you for sharing!'
            : 'No actions available in this state.'}
        </Text>
      );
    }
    return buttons;
  }
}

function AckRow({ label, done, at }: { label: string; done: boolean; at: string | null }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <Ionicons name={done ? 'checkmark-circle' : 'time-outline'} size={14} color={done ? colors.forest : colors.warnText} />
      <Text style={{ fontSize: 11, fontFamily: font.bodyBold, color: done ? colors.forest : colors.warnText }}>
        {label} {done ? `acknowledged ${at ? formatDateTime(at) : ''}` : 'has not acknowledged yet'}
      </Text>
    </View>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>
  );
}

const styles = {
  panel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18 },
  panelTitle: { fontFamily: font.display, fontSize: 15, color: colors.deep, marginBottom: 10 },
  agreement: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18 },
};
