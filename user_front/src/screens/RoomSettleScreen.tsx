import { generateRecommendation } from '../api/recommendation';
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTripDetail } from '../hooks/useTrip';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../components/Toast';
import { apiError } from '../utils/apiError';
import TripHero from '../components/TripHero';
import RoomTabBar from '../components/RoomTabBar';
import RoomMenuOverlay from '../components/RoomMenuOverlay';
import BottomSheetModal from '../components/BottomSheetModal';
import FeedRecommendModal from '../components/FeedRecommendModal';
import { SubmitButton, CancelButton } from '../components/FormBits';
import { fetchSettlementBalances, fetchSettlementDetail, createSettlement, completeSettlement, completeSettlementRoute, SettlementBalance, SettlementDetail, SettlementTransfer } from '../api/settlements';
import { api } from '../api/client';
type Props = NativeStackScreenProps<RootStackParamList, 'RoomSettle'>;
export default function RoomSettleScreen({ route, navigation }: Props) {
    const id = route.params.tripId;
    const { trip, saveTrip, endTrip, removeTrip } = useTripDetail(id);
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [balances, setBalances] = useState<SettlementBalance[]>([]), [settlement, setSettlement] = useState<SettlementDetail | null>(null), [selected, setSelected] = useState<SettlementTransfer | null>(null);
    const [busy, setBusy] = useState(false), [error, setError] = useState(''), [menu, setMenu] = useState(false), [recommend, setRecommend] = useState(false);
    const money = (n: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: trip.currency ?? 'KRW' }).format(n);
    const reload = useCallback(async () => { const [b, s] = await Promise.all([fetchSettlementBalances(id), fetchSettlementDetail(id)]); setBalances(b); setSettlement(s); setError(''); }, [id]);
    useFocusEffect(useCallback(() => {
        let alive = true;
        reload().catch(e => {
            if (alive)
                setError(apiError(e));
        });
        return () => { alive = false; };
    }, [reload]));
    const run = async (fn: () => Promise<void>) => {
        if (busy)
            return;
        setBusy(true);
        try {
            await fn();
            await reload();
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setBusy(false);
        }
    };
    return <View style={{ flex: 1, backgroundColor: colors.bgScreen, paddingTop: 42 }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}><Pressable onPress={() => navigation.goBack()}><Text style={{ color: colors.txPrimary }}>‹ 뒤로</Text></Pressable><Text style={{ color: colors.txPrimary }}>{trip.name}</Text><Pressable onPress={() => setMenu(true)}><Text style={{ color: colors.txPrimary }}>•••</Text></Pressable></View>
  <TripHero trip={trip}/><RoomTabBar active="settle" onChange={key => {
            if (key !== 'settle')
                navigation.replace(key === 'map' ? 'RoomMap' : 'RoomExpense', { tripId: id });
        }}/>
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
   {!!error && <><Text style={{ color: colors.danger }}>{error}</Text><SubmitButton label="다시 불러오기" onPress={() => run(reload)}/></>}
   {settlement?.status === 'not_created' && <><Text style={{ color: colors.txSecondary }}>지출과 분할을 확인한 뒤 정산을 생성하세요. 생성 후에는 지출·멤버·일반 송금 내역을 변경할 수 없어요.</Text><SubmitButton label="정산 생성" disabled={busy} onPress={() => run(async () => { await createSettlement(id); })}/></>}
   <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>멤버별 남은 금액 · + 받을 돈 / − 보낼 돈</Text>
   {balances.map(b => <Pressable key={b.memberId} onPress={() => {
                const t = settlement?.transfers.find(t => t.status === 'requested' && (t.fromMemberId === b.memberId || t.toMemberId === b.memberId));
                if (t)
                    setSelected(t);
            }} style={{ padding: 14, backgroundColor: colors.bgCard, borderRadius: 12 }}><Text style={{ color: colors.txPrimary }}>{b.memberName}{b.isMe ? ' (나)' : ''}  {money(b.amount)}</Text></Pressable>)}
   <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>전체 송금 경로</Text>
   {settlement?.transfers.map(t => <Pressable key={t.transferId} disabled={t.status === 'completed'} onPress={() => setSelected(t)} style={{ padding: 14, backgroundColor: colors.bgCard, borderRadius: 12 }}><Text style={{ color: colors.txPrimary }}>{t.fromMemberName} → {t.toMemberName} · {money(t.amount)}</Text><Text style={{ color: colors.txMuted }}>{t.status === 'completed' ? '기록 완료' : '송금 확인하기'}</Text></Pressable>)}
   {settlement?.status === 'in_progress' && <SubmitButton label="정산 확정" disabled={busy || settlement.transfers.some(t => t.status !== 'completed')} onPress={() => run(async () => { await completeSettlement(id); setRecommend(true); })}/>}
   {settlement?.status === 'completed' && <SubmitButton label="여행 피드 초안 보기" disabled={busy} onPress={() => run(async () => {
                if (settlement.settlementId)
                    await generateRecommendation(id, Number(settlement.settlementId));
                setRecommend(true);
            })}/>}
  </ScrollView>
  <BottomSheetModal visible={!!selected} onClose={() => setSelected(null)} title="송금 확인">{selected && <>
   <Text style={{ color: colors.txPrimary }}>{selected.fromMemberName} → {selected.toMemberName} · {money(selected.amount)}</Text>
   <Text style={{ color: colors.txSecondary, marginVertical: 16 }}>{selected.accountNumber ? selected.bank + ' ' + selected.accountNumber : '등록된 계좌가 없어요'}</Text>
   <SubmitButton label="카카오페이 열기" disabled={busy} onPress={() => run(async () => {
                const res = await api.get<{
                    url: string;
                }>('/api/trips/' + id + '/settlements/routes/' + selected.transferId + '/payment-link');
                await Linking.openURL(res.data.url);
            })}/>
   <Text style={{ color: colors.txMuted, marginVertical: 12 }}>실제로 송금한 뒤 아래 버튼을 눌러 기록하세요.</Text>
   <SubmitButton label="송금 완료 기록" disabled={busy} onPress={() => run(async () => { await completeSettlementRoute(id, selected.transferId); setSelected(null); })}/><CancelButton onPress={() => setSelected(null)}/>
  </>}</BottomSheetModal>
  <FeedRecommendModal visible={recommend} tripId={id} onClose={() => setRecommend(false)} onCreateFeeds={() => showToast('피드가 생성됐어요')}/>
  <RoomMenuOverlay menuOpen={menu} onCloseMenu={() => setMenu(false)} emoji={trip.emoji} name={trip.name} dateLabel={trip.dateLabel} tripId={id} onSaveTripInfo={async (e, n) => { await saveTrip({ emoji: e, name: n }); }} onEndTrip={endTrip} onDeleteTrip={removeTrip} onDeleted={() => navigation.goBack()}/>
 </View>;
}
