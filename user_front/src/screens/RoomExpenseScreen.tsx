import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View,TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormInput } from '../components/FormBits';
import Fab from '../components/Fab';
import IconCircleButton from '../components/IconCircleButton';
import RoomMenuOverlay from '../components/RoomMenuOverlay';
import RoomTabBar, { RoomTabKey } from '../components/RoomTabBar';
import { useToast } from '../components/Toast';
import TripHero from '../components/TripHero';
import { expensesByDate, formatWon, places, transfers, trips } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { ExpenseItem, PlaceItem, TransferItem } from '../types';
import { RootStackParamList } from '../navigation/types';
import AddEntryModal from './AddEntryModal';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomExpense'>;

type SubTab = 'spend' | 'place' | 'transfer';

export default function RoomExpenseScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const baseTrip = trips.find((t) => t.id === route.params.tripId) ?? trips[0];

  const [tripEmoji, setTripEmoji] = useState(baseTrip.emoji);
  const [tripName, setTripName] = useState(baseTrip.name);
  const trip = { ...baseTrip, emoji: tripEmoji, name: tripName };

  const [subTab, setSubTab] = useState<SubTab>('spend');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(expensesByDate);
  const [placeList, setPlaceList] = useState<PlaceItem[]>(places);
  const [transferList, setTransferList] = useState<TransferItem[]>(transfers);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const changeSubTab = (key: SubTab) => {
  setSubTab(key);
  setSearchOpen(false);
  setSearchQuery('');
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      if (prev) setSearchQuery('');
      return !prev;
    });
  };


  const grouped = useMemo(() => {
    const q = searchQuery.trim();
    const source = q ? expenses.filter((e) => e.name.includes(q) || e.payerName.includes(q)) : expenses;
    const map = new Map<string, ExpenseItem[]>();
    source.forEach((e) => {
      const list = map.get(e.dateLabel) ?? [];
      list.push(e);
      map.set(e.dateLabel, list);
    });
    return Array.from(map.entries());
  }, [expenses, searchQuery]);


  const filteredPlaceList = useMemo(() => {
    const q = searchQuery.trim();
    return q ? placeList.filter((p) => p.name.includes(q)) : placeList;
  }, [placeList, searchQuery]);

  const filteredTransferList = useMemo(() => {
    const q = searchQuery.trim();
    return q ? transferList.filter((t) => t.fromName.includes(q) || t.toName.includes(q)) : transferList;
  }, [transferList, searchQuery]);

  const searchResultCount =
    subTab === 'spend'
      ? grouped.reduce((sum, [, items]) => sum + items.length, 0)
      : subTab === 'place'
      ? filteredPlaceList.length
      : filteredTransferList.length;

  const onRoomTabChange = (key: RoomTabKey) => {
    if (key === 'settle') navigation.replace('RoomSettle', { tripId: trip.id });
    else if (key === 'map') navigation.replace('RoomMap', { tripId: trip.id });
  };

  const confirmDelete = (onOk: () => void) => {
    Alert.alert('삭제할까요?', undefined, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: onOk },
    ]);
  };

  const removeExpense = (id: string) => confirmDelete(() => setExpenses((prev) => prev.filter((e) => e.id !== id)));
  const removePlace = (id: string) => confirmDelete(() => setPlaceList((prev) => prev.filter((p) => p.id !== id)));

  const saveExpenseEdit = (id: string, name: string, amount: number, payer: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, name, amount, payerName: payer, myShare: Math.round(amount / trip.members.length) }
          : e
      )
    );
    setEditingId(null);
    showToast('✏️ 지출이 수정됐어요');
  };

  const fabLabel = subTab === 'spend' ? '지출 추가하기' : subTab === 'place' ? '장소 추가하기' : '송금 기록 추가하기';

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        {searchOpen ? (
          <>
            <Pressable onPress={toggleSearch} style={styles.backBtn}>
              <FontAwesome6 name="chevron-left" size={16} color={colors.txPrimary} />
            </Pressable>
            <View style={[styles.searchInlineBox, { backgroundColor: colors.bgInput, borderColor: colors.bdInput }]}>
              <FontAwesome6 name="magnifying-glass" size={13} color={colors.txMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={subTab === 'spend' ? '지출 내역 검색...' : subTab === 'place' ? '장소 검색...' : '송금 내역 검색...'}
                placeholderTextColor={colors.txPlaceholder}
                style={[styles.searchInlineInput, { color: colors.txPrimary }]}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <FontAwesome6 name="circle-xmark" iconStyle="solid" size={14} color={colors.txMuted} />
                </Pressable>
              )}
            </View>
            <Text style={[styles.searchCount, { color: colors.txMuted }]}>{searchResultCount}건</Text>
          </>
        ) : (
          <>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <FontAwesome6 name="chevron-left" size={16} color={colors.txPrimary} />
            </Pressable>
            <View style={styles.tripHead}>
              <View style={[styles.tripEmojiSm, { backgroundColor: colors.bgCard2 }]}>
                <Text style={{ fontSize: 17 }}>{trip.emoji}</Text>
              </View>
              <Text style={[styles.tripHdName, { color: colors.txPrimary }]} numberOfLines={1}>
                {trip.name}
              </Text>
            </View>
            <View style={styles.topRight}>
              <IconCircleButton icon="magnifying-glass" onPress={toggleSearch} />
              <IconCircleButton icon="ellipsis" onPress={() => setMenuOpen(true)} />
            </View>
          </>
        )}
      </View>

      <TripHero trip={trip} />
      <RoomTabBar active="expense" onChange={onRoomTabChange} />

      <View style={[styles.subTabRow, { borderBottomColor: colors.bdCard }]}>
        <SubTab label="💳 지출" active={subTab === 'spend'} changeSubTab={() => changeSubTab('spend')} />
        <SubTab label="📍 장소" active={subTab === 'place'} changeSubTab={() => changeSubTab('place')} />
        <SubTab label="💸 송금" active={subTab === 'transfer'} changeSubTab={() => changeSubTab('transfer')} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {subTab === 'spend' &&
          grouped.map(([date, items]) => (
            <View key={date} style={{ marginBottom: 8 }}>
              <Text style={[styles.dateLbl, { color: colors.txMuted }]}>{date}</Text>
              {items.map((e) =>
                editingId === e.id ? (
                  <ExpenseEditCard
                    key={e.id}
                    item={e}
                    members={trip.members.map((m) => m.name)}
                    onCancel={() => setEditingId(null)}
                    onSave={(name, amount, payer) => saveExpenseEdit(e.id, name, amount, payer)}
                  />
                ) : (
                  <View key={e.id} style={[styles.expCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
                    <View style={[styles.expIcon, { backgroundColor: colors.bgCard2 }]}>
                      <Text style={{ fontSize: 18 }}>{e.emoji}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.expName, { color: colors.txPrimary }]}>{e.name}</Text>
                      <Text style={[styles.expMeta, { color: colors.txMuted }]}>
                        {e.payerName} 결제 · {e.splitLabel}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                      <Text style={[styles.expAmt, { color: colors.txPrimary }]}>{formatWon(e.amount)}</Text>
                      <Text style={[styles.expMy, { color: colors.txMuted }]}>내 몫 {formatWon(e.myShare)}</Text>
                    </View>
                    <View style={{ gap: 6 }}>
                      <Pressable
                        onPress={() => setEditingId(e.id)}
                        style={[styles.iconSmBtn, { backgroundColor: colors.expEditBg }]}
                      >
                        <FontAwesome6 name="pen" size={10} color={colors.expEditColor} />
                      </Pressable>
                      <Pressable onPress={() => removeExpense(e.id)} style={[styles.iconSmBtn, { backgroundColor: colors.bgDel }]}>
                        <FontAwesome6 name="minus" size={11} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                )
              )}
            </View>
          ))}

        {subTab === 'place' && (
          <View>
            {filteredPlaceList.map((p) => (
              <View key={p.id} style={[styles.expCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard, marginHorizontal: 20 }]}>
                <View style={[styles.expIcon, { backgroundColor: colors.bgCard2 }]}>
                  <Text style={{ fontSize: 18 }}>{p.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.expName, { color: colors.txPrimary }]}>{p.name}</Text>
                  <Text style={[styles.expMeta, { color: colors.txMuted }]}>
                    {p.timeLabel} · {p.withMembers}
                  </Text>
                </View>
                <FontAwesome6 name="grip-lines" size={14} color={colors.txMuted} style={{ marginRight: 10 }} />
                <Pressable onPress={() => removePlace(p.id)} style={[styles.iconSmBtn, { backgroundColor: colors.bgDel }]}>
                  <FontAwesome6 name="minus" size={11} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
            <View style={[styles.tipBox, { backgroundColor: colors.bgCard2 }]}>
              <Text style={{ fontSize: 11, color: colors.txSecondary }}>
                💡 장소 추가 시 자동으로 지출내역 탭에도 동선이 반영됩니다.
              </Text>
            </View>
          </View>
        )}

        {subTab === 'transfer' && (
          <View style={{ paddingHorizontal: 20 }}>
            {filteredTransferList.map((t) => (
              <View key={t.id} style={[styles.transferCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
                <View style={[styles.expIcon, { backgroundColor: colors.bgCard2 }]}>
                  <Text style={{ fontSize: 18 }}>💸</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.expName, { color: colors.txPrimary }]}>
                    {t.fromName} → {t.toName}
                  </Text>
                  <Text style={[styles.expMeta, { color: colors.txMuted }]}>
                    {t.dateLabel} · {t.method}
                  </Text>
                </View>
                <Text style={[styles.expAmt, { color: colors.txPrimary }]}>{formatWon(t.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Fab label={fabLabel} onPress={() => setModalVisible(true)} />

      <AddEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        members={trip.members}
        initialTab={subTab}
        onSubmitExpense={(name, amount, payer) => {
          setExpenses((prev) => [
            {
              id: `e${Date.now()}`,
              dateLabel: grouped[0]?.[0] ?? '오늘',
              emoji: '💳',
              name,
              payerName: payer,
              splitLabel: `${trip.members.length}명 균등`,
              amount: Number(amount) || 0,
              myShare: Math.round((Number(amount) || 0) / trip.members.length),
            },
            ...prev,
          ]);
          showToast('✓ 지출이 등록됐어요');
        }}
        onSubmitPlace={(name) => {
          setPlaceList((prev) => [
            { id: `p${Date.now()}`, dateLabel: '오늘', emoji: '📍', name, timeLabel: '지금', withMembers: trip.members.map((m) => m.name).join(', ') },
            ...prev,
          ]);
          showToast('📍 장소가 추가됐어요 (지출내역 자동 반영)');
        }}
        onSubmitTransfer={(from, to, amount) => {
          setTransferList((prev) => [
            { id: `tf${Date.now()}`, fromName: from, toName: to, dateLabel: '오늘', method: '계좌이체', amount: Number(amount) || 0 },
            ...prev,
          ]);
          showToast('💸 송금 기록이 저장됐어요');
        }}
      />

      <RoomMenuOverlay
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
        emoji={trip.emoji}
        name={trip.name}
        dateLabel={trip.dateLabel}
        onSaveTripInfo={(e, n) => {
          setTripEmoji(e);
          setTripName(n);
        }}
      />
    </View>
  );
}

function ExpenseEditCard({
  item,
  members,
  onSave,
  onCancel,
}: {
  item: ExpenseItem;
  members: string[];
  onSave: (name: string, amount: number, payer: string) => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(String(item.amount));
  const [payer, setPayer] = useState(item.payerName);

  return (
    <View style={[styles.expCard, { backgroundColor: colors.bgCard, borderColor: colors.bgChipActive, borderWidth: 1 }]}>
      <View style={{ flex: 1, gap: 6 }}>
        <FormInput value={name} onChangeText={setName} style={{ paddingVertical: 7, fontSize: 13, fontWeight: '600' }} autoFocus />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {members.map((m) => (
            <Pressable
              key={m}
              onPress={() => setPayer(m)}
              style={[styles.payerChip, { backgroundColor: payer === m ? colors.bgChipActive : colors.bgCard2 }]}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: payer === m ? '#FFF' : colors.txSecondary }}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FormInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        style={{ width: 92, textAlign: 'right', fontWeight: '700', marginLeft: 8 }}
      />
      <View style={{ gap: 6, marginLeft: 8 }}>
        <Pressable onPress={() => onSave(name, Number(amount) || 0, payer)} style={[styles.iconSmBtn, { backgroundColor: colors.expEditBg }]}>
          <FontAwesome6 name="check" size={11} color={colors.expEditColor} />
        </Pressable>
        <Pressable onPress={onCancel} style={[styles.iconSmBtn, { backgroundColor: colors.bgDel }]}>
          <FontAwesome6 name="xmark" size={11} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function SubTab({ label, active, changeSubTab }: { label: string; active: boolean; changeSubTab: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={changeSubTab} style={styles.subTabBtn}>
      <Text
        style={[
          styles.subTabLabel,
          { color: active ? colors.txSecondary : colors.txMuted, fontWeight: active ? '600' : '500' },
        ]}
      >
        {label}
      </Text>
      <View style={[styles.subTabUnderline, { backgroundColor: active ? colors.subTabBorder : 'transparent' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({

  
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  backBtn: { marginRight: 10 },
  tripHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 2 },
  tripEmojiSm: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripHdName: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  topRight: { flexDirection: 'row', gap: 8 },
  subTabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 0.5,
  },
  subTabBtn: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  subTabLabel: { fontSize: 12 },
  subTabUnderline: { height: 1.5, width: '70%', marginTop: 6, borderRadius: 1 },
  dateLbl: { fontSize: 12, fontWeight: '600', paddingHorizontal: 20, marginBottom: 8, marginTop: 6 },
  expCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
  },

  searchInlineBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInlineInput: { flex: 1, fontSize: 14, padding: 0 },
  searchCount: { fontSize: 11, marginLeft: 8, minWidth: 30, textAlign: 'center' },

  expIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expName: { fontSize: 13, fontWeight: '700' },
  expMeta: { fontSize: 11, marginTop: 2 },
  expAmt: { fontSize: 13, fontWeight: '700' },
  expMy: { fontSize: 10, marginTop: 2 },
  iconSmBtn: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  payerChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tipBox: { marginHorizontal: 20, marginTop: 4, padding: 12, borderRadius: 12 },
  transferCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
  },
});
