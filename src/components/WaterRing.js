import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { getProgress } from '../utils/water';

const SIZE = 220;
const STROKE_WIDTH = 18;
const RADIUS = SIZE / 2 - STROKE_WIDTH / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function WaterRing({ current, goal }) {
  const progress = getProgress(current, goal);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.waterTrack}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.water}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          fill="none"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
          rotation="-90"
        />
      </Svg>

      <View style={styles.center}>
        <Ionicons name="water" size={26} color={colors.water} style={styles.dropIcon} />
        <Text style={styles.value}>
          {current}
          <Text style={styles.valueGoal}>/{goal}ml</Text>
        </Text>
        <Text style={styles.caption}>
          {Math.round(progress * 100)}% da meta
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropIcon: {
    marginBottom: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textDark,
  },
  valueGoal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
  },
  caption: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
