import * as ImagePicker from 'expo-image-picker';
import { parseReceipt } from '../api/ocr';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, FormInput, FormRow, MemberChip, SegmentChip, SubmitButton, } from '../components/FormBits';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../components/Toast';
import { apiError } from '../utils/apiError';
import { Member } from '../types';
type SplitMode = 'even' | 'manual' | 'percent';
// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type SubTab = 'spend' | 'place' | 'transfer';
const EMOJI_OPTIONS = ['🥩', '🍜', '☕', '🚕', '🏨', '🎡', '🛒', '🎫', '🍺', '⛽'];
export interface ExpenseFormValue {
    name: string;
    emoji: string;
    amount: string;
    payerName: string; // memberId
    categoryCode?: string;
    participants: string[]; // 함께한 멤버 이름 배열
    splitMode: SplitMode;
    manualAmounts: Record<string, string>; // memberId → 금액 (manual 모드)
    percentAmounts: Record<string, string>; // memberId → 퍼센트 (percent 모드)
    dateLabel: string;
    memo: string;
}
export interface TransferFormValue {
    fromMemberId: string;
    toMemberId: string;
    amount: string;
    memo: string;
}
export interface PlaceFormValue {
    name: string;
}
interface Props {
    visible: boolean;
    onClose: () => void | Promise<void>;
    members: Member[];
    initialTab?: SubTab;
    initialExpense?: ExpenseFormValue;
    tripId?: string;
    currency?: string;
    onSubmitExpense: (value: ExpenseFormValue) => void | Promise<void>;
    onSubmitPlace: (value: PlaceFormValue) => void | Promise<void>;
    onSubmitTransfer: (value: TransferFormValue) => void | Promise<void>;
}
// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function todayLabel(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}월 ${dd}일 ${hh}:${min}`;
}
function calcEvenShare(total: number, count: number): string {
    if (count === 0)
        return '0';
    return String(Math.ceil(total / count));
}
function sumManual(map: Record<string, string>): number {
    return Object.values(map).reduce((acc, v) => acc + (Number(v) || 0), 0);
}
function sumPercent(map: Record<string, string>): number {
    return Object.values(map).reduce((acc, v) => acc + (Number(v) || 0), 0);
}
// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function AddEntryModal({ visible, onClose, members, initialTab = 'spend', initialExpense, tripId, currency = "KRW", onSubmitExpense, onSubmitPlace, onSubmitTransfer, }: Props) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const submit = async (fn: () => void | Promise<void>) => {
        if (saving)
            return;
        setSaving(true);
        try {
            await fn();
            onClose();
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setSaving(false);
        }
    };
    const [tab, setTab] = useState<SubTab>(initialTab);
    useEffect(() => {
        if (visible)
            setTab(initialTab);
    }, [visible, initialTab]);
    const close = () => onClose();
    return (<BottomSheetModal visible={visible} onClose={close} title="추가" maxHeightPct={92}>
      {/* ── 서브 탭 ── */}
      <View style={[styles.subTabs, { backgroundColor: colors.bgTab }]}>
        <SubTabBtn label="💳 지출" active={tab === 'spend'} onPress={() => setTab('spend')}/>
        <SubTabBtn label="📍 장소" active={tab === 'place'} onPress={() => setTab('place')}/>
        <SubTabBtn label="💸 송금" active={tab === 'transfer'} onPress={() => setTab('transfer')}/>
      </View>

      {tab === 'spend' && (<SpendTab currency={currency} tripId={tripId} key={initialExpense?.name ?? String(visible)} initial={initialExpense} members={members} onSubmit={(v) => submit(() => onSubmitExpense(v))} onClose={close}/>)}
      {tab === 'place' && (<PlaceTab members={members} onSubmit={(v) => submit(() => onSubmitPlace(v))} onClose={close}/>)}
      {tab === 'transfer' && (<TransferTab currency={currency} members={members} onSubmit={(v) => submit(() => onSubmitTransfer(v))} onClose={close}/>)}
    </BottomSheetModal>);
}
// ─────────────────────────────────────────────
// 지출 탭
// ─────────────────────────────────────────────
function SpendTab({ members, initial, tripId, currency = "KRW", onSubmit, onClose, }: {
    members: Member[];
    initial?: ExpenseFormValue;
    tripId?: string;
    currency?: string;
    onSubmit: (v: ExpenseFormValue) => void | Promise<void>;
    onClose: () => void | Promise<void>;
}) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [ocrBusy, setOcrBusy] = useState(false);
    const scanReceipt = async () => {
        if (!tripId || ocrBusy)
            return;
        setOcrBusy(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                showToast('사진 접근 권한이 필요해요');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
            if (result.canceled)
                return;
            const parsed = await parseReceipt(tripId, result.assets[0]);
            setName(parsed.name);
            setAmount(String(parsed.amount));
            if (parsed.spentAt)
                setDateLabel(parsed.spentAt);
            if (parsed.categoryCode)
                setCategoryCode(parsed.categoryCode);
            showToast('인식 결과를 확인한 뒤 지출을 저장해 주세요');
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setOcrBusy(false);
        }
    };
    const [name, setName] = useState(initial?.name ?? '');
    const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJI_OPTIONS[0]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [amount, setAmount] = useState(initial?.amount ?? '');
    const [payer, setPayer] = useState(initial?.payerName ?? members[0]?.id ?? '');
    const [participants, setParticipants] = useState<string[]>(initial?.participants ?? members.map((m) => m.id));
    const [splitMode, setSplitMode] = useState<SplitMode>(initial?.splitMode ?? 'even');
    const [manualAmounts, setManualAmounts] = useState<Record<string, string>>(initial?.manualAmounts ?? {});
    const [percentAmounts, setPercentAmounts] = useState<Record<string, string>>(initial?.percentAmounts ?? {});
    const [dateLabel, setDateLabel] = useState(initial?.dateLabel ?? new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    const [memo, setMemo] = useState(initial?.memo ?? '');
    const [categoryCode, setCategoryCode] = useState(initial?.categoryCode ?? 'meal');
    const totalNum = Number(amount) || 0;
    const participantCount = participants.length;
    // 유효성
    const manualSum = participants.reduce((s, id) => s + (Number(manualAmounts[id]) || 0), 0);
    const percentSum = participants.reduce((s, id) => s + (Number(percentAmounts[id]) || 0), 0);
    const manualOk = splitMode !== 'manual' || manualSum === totalNum;
    const percentOk = splitMode !== 'percent' || percentSum === 100;
    const toggleParticipant = (name: string) => {
        setParticipants((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);
    };
    const handleSubmit = () => {
        if (!amount || Number(amount) <= 0)
            return;
        onSubmit({
            name: name.trim() || '새 지출',
            emoji,
            amount,
            payerName: payer,
            participants,
            splitMode,
            manualAmounts,
            percentAmounts,
            dateLabel,
            memo,
            categoryCode,
        });
    };
    return (<ScrollView showsVerticalScrollIndicator={false}>
      {/* OCR 영역 — PaddleOCR 구현 전 placeholder */}
      <Pressable onPress={scanReceipt} disabled={ocrBusy} style={[styles.receiptArea, { borderColor: colors.bdDashed }]}>
        <FontAwesome6 name="camera" size={18} color={colors.txMuted}/>
        <Text style={[styles.receiptText, { color: colors.txMuted }]}>
          영수증 사진으로 자동 입력
        </Text>
        <Text style={[styles.receiptSub, { color: colors.txPlaceholder }]}>
          {ocrBusy ? '영수증 인식 중...' : '영수증 사진으로 입력'}
        </Text>
      </Pressable>

      {/* 지출 이름 + 이모지 */}
      <FormRow label="지출 이름">
        <View style={styles.nameRow}>
          <Pressable onPress={() => setShowEmojiPicker((v) => !v)} style={[styles.emojiBtn, { backgroundColor: colors.bgCard2 }]}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <FormInput value={name} onChangeText={setName} placeholder="예: 흑돼지 구이"/>
          </View>
        </View>
        {showEmojiPicker && (<View style={[styles.emojiGrid, { marginTop: 8 }]}>
            {EMOJI_OPTIONS.map((e) => (<Pressable key={e} onPress={() => { setEmoji(e); setShowEmojiPicker(false); }} style={[
                    styles.emojiCell,
                    { backgroundColor: e === emoji ? colors.bgChipActive : colors.bgCard2 },
                ]}>
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>))}
          </View>)}
      </FormRow>

      {/* 금액 */}
      <FormRow label="금액">
        <View style={styles.amountRow}>
          <View style={{ flex: 1 }}>
            <FormInput value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))} placeholder="0" keyboardType="decimal-pad"/>
          </View>
          <Text style={[styles.wonLabel, { color: colors.txMuted }]}>{currency}</Text>
        </View>
        {amount === '' && (<Text style={[styles.errorText, { color: colors.danger }]}>금액을 채워주세요</Text>)}
      </FormRow>

      <FormRow label="카테고리"><View style={styles.chipWrap}>{[['meal', '식사'], ['ticket', '입장권'], ['cafe', '카페'], ['shop', '쇼핑'], ['trans', '교통']].map(([id, label]) => <MemberChip key={id} label={label} active={categoryCode === id} onPress={() => setCategoryCode(id)}/>)}</View></FormRow>
      {/* 결제한 사람 */}
      <FormRow label="결제한 사람">
        <View style={styles.chipWrap}>
          {members.map((m) => (<MemberChip key={m.id} label={m.name} active={payer === m.id} onPress={() => setPayer(m.id)}/>))}
        </View>
      </FormRow>

      {/* 함께한 멤버 */}
      <FormRow label="함께한 멤버">
        <View style={styles.chipWrap}>
          {members.map((m) => (<MemberChip key={m.id} label={m.name} active={participants.includes(m.id)} onPress={() => toggleParticipant(m.id)}/>))}
        </View>
      </FormRow>

      {/* 분배 방식 */}
      <FormRow label="분배">
        <View style={{ flexDirection: 'row' }}>
          <SegmentChip label="균등" active={splitMode === 'even'} onPress={() => setSplitMode('even')}/>
          <SegmentChip label="직접입력" active={splitMode === 'manual'} onPress={() => setSplitMode('manual')}/>
          <SegmentChip label="퍼센트" active={splitMode === 'percent'} onPress={() => setSplitMode('percent')}/>
        </View>

        {/* 균등 — 미리 계산 결과 표시 */}
        {splitMode === 'even' && totalNum > 0 && participantCount > 0 && (<View style={[styles.splitPreview, { backgroundColor: colors.bgCard2 }]}>
            <Text style={[styles.splitPreviewText, { color: colors.txSecondary }]}>
              인당 약{' '}
              <Text style={{ fontWeight: '700', color: colors.txPrimary }}>
                {Number(calcEvenShare(totalNum, participantCount)).toLocaleString()}{currency}
              </Text>
              {' '}({participantCount}명 기준)
            </Text>
          </View>)}

        {/* 직접입력 */}
        {splitMode === 'manual' && (<View style={{ marginTop: 10, gap: 8 }}>
            {participants.map((name) => (<View key={name} style={styles.splitRow}>
                <Text style={[styles.splitName, { color: colors.txSecondary }]}>{members.find(m => m.id === name)?.name ?? name}</Text>
                <View style={styles.splitInput}>
                  <FormInput value={manualAmounts[name] ?? ''} onChangeText={(v) => setManualAmounts((prev) => ({ ...prev, [name]: v.replace(/[^0-9.]/g, '') }))} placeholder="0" keyboardType="decimal-pad"/>
                </View>
                <Text style={[styles.splitUnit, { color: colors.txMuted }]}>{currency}</Text>
              </View>))}
            <View style={[styles.splitSumRow, { borderTopColor: colors.bdCard }]}>
              <Text style={[styles.splitSumLabel, { color: colors.txMuted }]}>합계</Text>
              <Text style={[
                styles.splitSumValue,
                { color: manualOk ? colors.positive : colors.danger },
            ]}>
                {manualSum.toLocaleString()}{currency} / {totalNum.toLocaleString()}{currency}
              </Text>
            </View>
            {!manualOk && (<Text style={[styles.errorText, { color: colors.danger }]}>
                합계가 총 금액과 달라요
              </Text>)}
          </View>)}

        {/* 퍼센트 */}
        {splitMode === 'percent' && (<View style={{ marginTop: 10, gap: 8 }}>
            {participants.map((name) => (<View key={name} style={styles.splitRow}>
                <Text style={[styles.splitName, { color: colors.txSecondary }]}>{members.find(m => m.id === name)?.name ?? name}</Text>
                <View style={styles.splitInput}>
                  <FormInput value={percentAmounts[name] ?? ''} onChangeText={(v) => setPercentAmounts((prev) => ({
                    ...prev,
                    [name]: v.replace(/[^0-9.]/g, ''),
                }))} placeholder="0" keyboardType="decimal-pad"/>
                </View>
                <Text style={[styles.splitUnit, { color: colors.txMuted }]}>%</Text>
                {totalNum > 0 && percentAmounts[name] && (<Text style={[styles.splitCalc, { color: colors.txMuted }]}>
                    ≈{Math.round(totalNum * (Number(percentAmounts[name]) / 100)).toLocaleString()}{currency}
                  </Text>)}
              </View>))}
            <View style={[styles.splitSumRow, { borderTopColor: colors.bdCard }]}>
              <Text style={[styles.splitSumLabel, { color: colors.txMuted }]}>합계</Text>
              <Text style={[
                styles.splitSumValue,
                { color: percentOk ? colors.positive : colors.danger },
            ]}>
                {percentSum}% / 100%
              </Text>
            </View>
            {!percentOk && (<Text style={[styles.errorText, { color: colors.danger }]}>
                퍼센트 합이 100%가 돼야 해요
              </Text>)}
          </View>)}
      </FormRow>

      {/* 날짜/시간 */}
      <FormRow label="날짜 / 시간">
        <FormInput value={dateLabel} onChangeText={setDateLabel} placeholder="2026-09-06T14:30"/>
      </FormRow>

      {/* 메모 */}
      <FormRow label="메모">
        <TextInput value={memo} onChangeText={setMemo} placeholder="특이사항을 남겨보세요" placeholderTextColor={colors.txPlaceholder} multiline style={[
            styles.memoInput,
            {
                backgroundColor: colors.bgInput,
                borderColor: colors.bdInput,
                color: colors.txPrimary,
            },
        ]}/>
      </FormRow>

      <SubmitButton label="지출 등록" onPress={handleSubmit} disabled={!amount || Number(amount) <= 0 || !participantCount || !manualOk || !percentOk}/>
      <CancelButton onPress={onClose}/>
    </ScrollView>);
}
// ─────────────────────────────────────────────
// 장소 탭 (김은채 담당 — 기존 로직 유지)
// ─────────────────────────────────────────────
function PlaceTab({ members, onSubmit, onClose, }: {
    members: Member[];
    onSubmit: (v: PlaceFormValue) => void | Promise<void>;
    onClose: () => void | Promise<void>;
}) {
    const [name, setName] = useState('');
    const [activeMembers, setActiveMembers] = useState<string[]>(members.map((m) => m.name));
    const toggleMember = (m: string) => setActiveMembers((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
    return (<View>
      <FormRow label="장소 이름">
        <FormInput value={name} onChangeText={setName} placeholder="예: 성산일출봉 🌅"/>
      </FormRow>
      <FormRow label="함께한 멤버">
        <View style={styles.chipWrap}>
          {members.map((m) => (<MemberChip key={m.id} label={m.name} active={activeMembers.includes(m.name)} onPress={() => toggleMember(m.name)}/>))}
        </View>
      </FormRow>
      <SubmitButton label="장소 추가" onPress={() => {
            onSubmit({ name: name.trim() || '새 장소' });
        }}/>
      <CancelButton onPress={onClose}/>
    </View>);
}
// ─────────────────────────────────────────────
// 송금 탭
// ─────────────────────────────────────────────
function TransferTab({ members, currency = "KRW", onSubmit, onClose, }: {
    members: Member[];
    currency?: string;
    onSubmit: (v: TransferFormValue) => void | Promise<void>;
    onClose: () => void | Promise<void>;
}) {
    const { colors } = useTheme();
    const [fromMemberId, setFromMemberId] = useState(members[0]?.id ?? '');
    const [toMemberId, setToMemberId] = useState(members[1]?.id ?? members[0]?.id ?? '');
    const [amount, setAmount] = useState('');
    const [dateLabel, setDateLabel] = useState(todayLabel());
    const [memo, setMemo] = useState('');
    const samePersonError = fromMemberId === toMemberId;
    const fromName = members.find((member) => member.id === fromMemberId)?.name ?? '';
    const toName = members.find((member) => member.id === toMemberId)?.name ?? '';
    const handleSubmit = () => {
        if (!amount || Number(amount) <= 0 || samePersonError)
            return;
        onSubmit({ fromMemberId, toMemberId, amount, memo });
    };
    return (<ScrollView showsVerticalScrollIndicator={false}>
      {/* 보내는 사람 */}
      <FormRow label="보내는 사람 (FROM)">
        <View style={styles.chipWrap}>
          {members.map((m) => (<MemberChip key={m.id} label={m.name} active={fromMemberId === m.id} onPress={() => setFromMemberId(m.id)}/>))}
        </View>
      </FormRow>

      {/* 화살표 */}
      <View style={styles.arrowRow}>
        <View style={[styles.arrowLine, { backgroundColor: colors.bdCard }]}/>
        <View style={[styles.arrowCircle, { backgroundColor: colors.bgCard2, borderColor: colors.bdCard }]}>
          <FontAwesome6 name="arrow-down" size={14} color={colors.txMuted}/>
        </View>
        <View style={[styles.arrowLine, { backgroundColor: colors.bdCard }]}/>
      </View>

      {/* 받는 사람 */}
      <FormRow label="받는 사람 (TO)">
        <View style={styles.chipWrap}>
          {members.map((m) => (<MemberChip key={m.id} label={m.name} active={toMemberId === m.id} onPress={() => setToMemberId(m.id)}/>))}
        </View>
        {samePersonError && (<Text style={[styles.errorText, { color: colors.danger }]}>
            보내는 사람과 받는 사람이 같아요
          </Text>)}
      </FormRow>

      {/* 송금 금액 */}
      <FormRow label="송금 금액">
        <View style={styles.amountRow}>
          <View style={{ flex: 1 }}>
            <FormInput value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))} placeholder="0" keyboardType="decimal-pad"/>
          </View>
          <Text style={[styles.wonLabel, { color: colors.txMuted }]}>{currency}</Text>
        </View>
        {amount !== '' && Number(amount) > 0 && !samePersonError && (<View style={[styles.transferPreview, { backgroundColor: colors.bgCard2 }]}>
            <Text style={[styles.transferPreviewText, { color: colors.txSecondary }]}>
              <Text style={{ fontWeight: '700', color: colors.txPrimary }}>{fromName}</Text>
              {' → '}
              <Text style={{ fontWeight: '700', color: colors.txPrimary }}>{toName}</Text>
              {'  '}
              <Text style={{ fontWeight: '700', color: colors.positive }}>
                {Number(amount).toLocaleString()}원
              </Text>
            </Text>
          </View>)}
      </FormRow>

      {/* 날짜/시간 */}
      <FormRow label="날짜 / 시간">
        <FormInput value={dateLabel} onChangeText={setDateLabel} placeholder="예: 07월 10일 14:30"/>
      </FormRow>

      {/* 메모 */}
      <FormRow label="메모">
        <TextInput value={memo} onChangeText={setMemo} placeholder="특이사항을 남겨보세요" placeholderTextColor={colors.txPlaceholder} multiline style={[
            styles.memoInput,
            {
                backgroundColor: colors.bgInput,
                borderColor: colors.bdInput,
                color: colors.txPrimary,
            },
        ]}/>
      </FormRow>

      <SubmitButton label="송금 기록 저장" onPress={handleSubmit} disabled={!amount || Number(amount) <= 0 || samePersonError}/>
      <CancelButton onPress={onClose}/>
    </ScrollView>);
}
// ─────────────────────────────────────────────
// 서브 탭 버튼
// ─────────────────────────────────────────────
function SubTabBtn({ label, active, onPress, }: {
    label: string;
    active: boolean;
    onPress: () => void | Promise<void>;
}) {
    const { colors } = useTheme();
    return (<Pressable onPress={onPress} style={[
            styles.subTabBtn,
            active && {
                backgroundColor: colors.bgCard,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
            },
        ]}>
      <Text style={{
            fontSize: 13,
            fontWeight: active ? '700' : '500',
            color: active ? colors.txSecondary : colors.txMuted,
        }}>
        {label}
      </Text>
    </Pressable>);
}
// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    subTabs: {
        flexDirection: 'row',
        padding: 3,
        borderRadius: 12,
        marginBottom: 16,
    },
    subTabBtn: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: 'center',
    },
    // 영수증
    receiptArea: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    receiptText: { fontSize: 13, marginTop: 4 },
    receiptSub: { fontSize: 10 },
    // 이름 + 이모지
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    emojiBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    emojiCell: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 금액
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wonLabel: { fontSize: 15, fontWeight: '600' },
    // 멤버
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
    // 분배
    splitPreview: {
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
    },
    splitPreviewText: { fontSize: 13, textAlign: 'center' },
    splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    splitName: { width: 44, fontSize: 13, fontWeight: '600' },
    splitInput: { flex: 1 },
    splitUnit: { width: 18, fontSize: 13 },
    splitCalc: { fontSize: 11 },
    splitSumRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 0.5,
        marginTop: 4,
    },
    splitSumLabel: { fontSize: 12 },
    splitSumValue: { fontSize: 13, fontWeight: '700' },
    // 메모
    memoInput: {
        borderWidth: 0.5,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    // 에러
    errorText: { fontSize: 11, marginTop: 4 },
    // 송금 탭
    arrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
    arrowLine: { flex: 1, height: 1 },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    transferPreview: {
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    transferPreviewText: { fontSize: 13 },
});
