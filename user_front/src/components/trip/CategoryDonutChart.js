import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../../constants/theme';

const COLOR_MAP = { tp: colors.tp, tt: colors.tt, ta: colors.ta, tc: colors.tc, tb: colors.tb };

/** data: [{ colorKey, total }], 단순 누적 도넛 차트 */
export default function CategoryDonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const radius = size / 2 - 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = data.map((d) => {
    const fraction = d.total / total;
    const dashLength = circumference * fraction;
    const offset = circumference * cumulative;
    cumulative += fraction;
    return { ...d, dashLength, offset };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle cx={center} cy={center} r={radius} stroke={colors.bgSecondary} strokeWidth={20} fill="none" />
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              stroke={COLOR_MAP[seg.colorKey] || colors.tp}
              strokeWidth={20}
              fill="none"
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
