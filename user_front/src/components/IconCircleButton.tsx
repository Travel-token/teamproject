import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  icon: React.ComponentProps<typeof FontAwesome6>['name'];
  iconStyle?: React.ComponentProps<typeof FontAwesome6>['iconStyle'];
  onPress?: () => void;
  showDot?: boolean;
  size?: number;
}

export default function IconCircleButton({ icon, iconStyle = 'solid', onPress, showDot, size = 34 }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.bgIconBtn,
          borderColor: colors.bdCard,
        },
      ]}
    >
      <FontAwesome6 name={icon} iconStyle={iconStyle} size={size * 0.42} color={colors.txSecondary} />
      {showDot && <View style={[styles.dot, { backgroundColor: colors.bgDel }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
