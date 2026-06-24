import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '../../constants/theme';

/** tabs: [{ key, label }], activeKey, onChange */
export default function SegmentedTabBar({ tabs, activeKey, onChange, style }) {
  return (
    <View style={[styles.bar, style]}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, active && styles.activeTab]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.text, active && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.bgPrimary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.textPrimary,
  },
});
