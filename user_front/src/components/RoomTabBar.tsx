import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type RoomTabKey = 'expense' | 'settle' | 'map';

const TABS: { key: RoomTabKey; label: string }[] = [
  { key: 'expense', label: '지출내역' },
  { key: 'settle', label: '정산결과' },
  { key: 'map', label: '동선지도' },
];

// 원본 CSS(.tab-bar/.tab-btn)는 iOS 세그먼트 컨트롤 스타일:
// 회색 트랙 안에서 활성 탭만 흰 카드 배경 + 그림자를 가짐
export default function RoomTabBar({
  active,
  onChange,
}: {
  active: RoomTabKey;
  onChange: (key: RoomTabKey) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bgTab }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            style={[
              styles.tabBtn,
              isActive && {
                backgroundColor: colors.bgCard,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              },
            ]}
            onPress={() => onChange(t.key)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: isActive ? '700' : '500',
                color: isActive ? colors.txSecondary : colors.txMuted,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 10,
    padding: 2,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
});
