import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, Text, View } from 'react-native';
import { api } from '../api/client';
import { fetchTrips } from '../api/trip';
import { fetchIntegrationCapabilities } from '../api/integrations';
import { Trip } from '../types';
import { captureNative, captureStatus, CaptureSource, enableCapture, disableCapture, isCaptureAvailable, syncCapturedPayments } from '../services/paymentCapture';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, FormRow, MemberChip, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';

type Candidate = { eventId: string; amount: number; sourcePackage: string; observedAt: number };
const koreaDate = (ms: number) => new Date(ms + 9 * 3600000).toISOString().slice(0, 19);
const categories = [['meal', '식사'], ['ticket', '입장권'], ['cafe', '카페'], ['shop', '쇼핑'], ['trans', '교통']];

export default function PaymentCapturePanel() {
  const { colors } = useTheme();
  const available = isCaptureAvailable();
  const [open, setOpen] = useState(false), [enabled, setEnabled] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [ready, setReady] = useState(false);
  const lock = useRef(false);
  const [sources, setSources] = useState<CaptureSource[]>([]), [packages, setPackages] = useState<string[]>([]), [search, setSearch] = useState('');
  const [items, setItems] = useState<Candidate[]>([]), [trips, setTrips] = useState<Trip[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null), [tripId, setTripId] = useState('');
  const [name, setName] = useState(''), [amount, setAmount] = useState(''), [category, setCategory] = useState('meal'), [spentAt, setSpentAt] = useState('');
  const reload = useCallback(async () => {
    if (!available) return;
    const capabilities = await fetchIntegrationCapabilities(); setReady(capabilities.paySync);
    if (!capabilities.paySync) { setError('서버의 결제 수집 기능이 아직 준비되지 않았어요.'); return; }
    const state = await captureStatus(); setEnabled(state.enabled && state.granted); setPackages(state.packages);
    await syncCapturedPayments();
    const [r, t, apps] = await Promise.all([api.get<Candidate[]>('/api/payment-candidates'), fetchTrips('ongoing'), captureNative().sources()]);
    setSources(apps.sort((a, b) => a.label.localeCompare(b.label, 'ko')));
    setItems(r.data); setTrips(t.filter(x => x.currency === 'KRW'));
  }, [available]);
  const run = useCallback(async (fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(apiError(e)); }
    finally { lock.current = false; setBusy(false); }
  }, []);
  useEffect(() => {
    if (!open) return;
    void run(reload);
    const sub = AppState.addEventListener('change', s => { if (s === 'active') void run(reload); });
    return () => sub.remove();
  }, [open, reload, run]);
  const textStyle = { color: colors.txSecondary, lineHeight: 21 };
  return <View style={{ paddingVertical: 12 }}>
    <Text style={{ color: colors.txPrimary, fontWeight: '700', marginBottom: 8 }}>문자·결제 알림 수집</Text>
    <Text style={textStyle}>선택한 앱의 새 결제 알림을 모아 확인한 뒤 지출에 등록해요.</Text>
    <CancelButton label="수집 설정·수집함 열기" onPress={() => setOpen(true)} />
    <BottomSheetModal visible={open} onClose={() => { if (!busy) { setOpen(false); setSelected(null); } }} title="결제 알림 수집" maxHeightPct={92}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12 }}>
        <Text style={textStyle}>허용한 앱의 알림에서 금액·발생 시각·앱 식별자를 읽어 기기에 보관하고, 앱에 돌아오면 내 수집함으로 전송해요. 문자 원문·전화번호·계좌번호는 저장하거나 전송하지 않아요.</Text>
        <Text style={textStyle}>과거 문자나 본문이 가려진 알림은 수집할 수 없어요. 같은 결제가 여러 앱에서 수집되면 하나만 등록해 주세요.</Text>
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
        {!available ? <Text style={textStyle}>Android 전용 기능입니다. 결제 수집이 포함된 개발 APK 또는 배포 APK에서 열어 주세요.</Text> : <>
          <Text style={{ color: colors.txPrimary }}>이 기기 수집: {enabled ? '켜짐' : '꺼짐'}</Text>
          {!enabled && ready && <>
            <FormInput placeholder="수집할 문자·카드 앱 검색" value={search} onChangeText={setSearch} />
            <Text style={textStyle}>수집을 허용할 앱을 선택하세요. ({packages.length}/20)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{sources.filter(s => s.label.toLowerCase().includes(search.toLowerCase())).map(s => <MemberChip key={s.packageName} label={s.label} active={packages.includes(s.packageName)} onPress={() => {
              if (!busy) setPackages(prev => prev.includes(s.packageName) ? prev.filter(x => x !== s.packageName) : prev.length < 20 ? [...prev, s.packageName] : prev);
            }} />)}</View>
          </>}
          <SubmitButton disabled={busy || !ready || (!enabled && packages.length === 0)} label={enabled ? '수집 끄기·기기 대기목록 삭제' : '동의하고 수집 켜기'} onPress={() => void run(async () => {
            if (enabled) await disableCapture();
            else if (!(await enableCapture(packages))) { setError('설정에서 알림 접근을 허용한 뒤 앱을 선택하고 다시 켜 주세요.'); return; }
            await reload();
          })} />
          <Text style={textStyle}>끄면 기기 대기목록도 삭제됩니다. 서버 항목은 아래에서 개별 무시할 수 있어요.</Text>
          <CancelButton label={busy ? '불러오는 중…' : '수집함 새로고침'} onPress={() => void run(reload)} />
          {ready && items.length === 0 && <Text style={textStyle}>아직 수집된 결제 알림이 없어요.</Text>}
          {items.map(item => <View key={item.eventId} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.bgCard2, gap: 6 }}>
            <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>{Number(item.amount).toLocaleString()}원 · {sources.find(s => s.packageName === item.sourcePackage)?.label ?? '결제 앱'}</Text>
            <Text style={textStyle}>{koreaDate(Number(item.observedAt)).replace('T', ' ')} 수집</Text>
            <SubmitButton disabled={busy} label="확인해서 등록" onPress={() => { setSelected(item); setName(''); setAmount(String(item.amount)); setSpentAt(koreaDate(Number(item.observedAt))); setTripId(''); }} />
            <CancelButton label="무시" onPress={() => void run(async () => {
              await api.post(`/api/payment-candidates/${item.eventId}/dismiss`); if (selected?.eventId === item.eventId) setSelected(null); await reload();
            })} />
          </View>)}
          {selected && <View style={{ gap: 8 }}>
            <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>등록할 지출 확인</Text>
            <Text style={textStyle}>본인 결제 금액을 선택한 여행 전체 멤버와 균등분할합니다. 상호명·금액·실제 결제 시각을 확인하세요.</Text>
            {trips.length === 0 && <Text style={textStyle}>진행 중인 원화 여행이 없어요. 먼저 여행을 만들어 주세요.</Text>}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{trips.map(t => <MemberChip key={t.id} label={t.name} active={tripId === t.id} onPress={() => { if (!busy) setTripId(t.id); }} />)}</View>
            <FormRow label="상호명"><FormInput value={name} onChangeText={setName} maxLength={100} editable={!busy} placeholder="상호명을 입력하세요" /></FormRow>
            <FormRow label="금액 (원)"><FormInput keyboardType="number-pad" value={amount} onChangeText={setAmount} editable={!busy} /></FormRow>
            <FormRow label="결제 시각 (한국시간)"><FormInput value={spentAt} onChangeText={setSpentAt} placeholder="2026-09-06T12:30:00" editable={!busy} /></FormRow>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{categories.map(([c, label]) => <MemberChip key={c} label={label} active={category === c} onPress={() => { if (!busy) setCategory(c); }} />)}</View>
            <SubmitButton label="확인한 지출 등록" disabled={busy || !tripId || !name.trim() || !/^[1-9]\d*$/.test(amount) || Number(amount) > 1000000000} onPress={() => void run(async () => {
              await api.post(`/api/payment-candidates/${selected.eventId}/confirm`, { tripId, name: name.trim(), amount: Number(amount), categoryCode: category, spentAt }); setSelected(null); await reload();
            })} />
            <CancelButton label="등록 취소" onPress={() => { if (!busy) setSelected(null); }} />
          </View>}
        </>}
      </ScrollView>
    </BottomSheetModal>
  </View>;
}
