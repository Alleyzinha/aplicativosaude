import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Polygon, Text as SvgText, TSpan } from 'react-native-svg';
import { CATEGORIES } from '../constants/imcCategories';
import { polarToCartesian, valueToAngle } from '../utils/imc';
import { colors } from '../constants/theme';

const CX = 150;
const CY = 165;
const OUTER_R = 130;
const INNER_R = 78;

function describeSegment(startAngle, endAngle) {
  const outerStart = polarToCartesian(CX, CY, OUTER_R, startAngle);
  const outerEnd = polarToCartesian(CX, CY, OUTER_R, endAngle);
  const innerStart = polarToCartesian(CX, CY, INNER_R, startAngle);
  const innerEnd = polarToCartesian(CX, CY, INNER_R, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export default function BmiGauge({ bmi }) {
  const needleAngle = bmi ? valueToAngle(bmi) : -90;
  const needleTip = polarToCartesian(CX, CY, OUTER_R - 22, needleAngle);
  const needleLeft = polarToCartesian(CX, CY, 9, needleAngle + 90);
  const needleRight = polarToCartesian(CX, CY, 9, needleAngle - 90);

  return (
    <Svg width={300} height={190} viewBox="0 0 300 190">
      {CATEGORIES.map((c) => (
        <Path
          key={c.key}
          d={describeSegment(c.startAngle, c.endAngle)}
          fill={c.color}
        />
      ))}

      {CATEGORIES.map((c) => {
        const mid = (c.startAngle + c.endAngle) / 2;
        const pos = polarToCartesian(CX, CY, (OUTER_R + INNER_R) / 2, mid);
        return (
          <SvgText
            key={`label-${c.key}`}
            x={pos.x}
            y={pos.y}
            fill={colors.white}
            fontSize="9.5"
            fontWeight="700"
            textAnchor="middle"
          >
            <TSpan x={pos.x} dy="-3">
              {c.short}
            </TSpan>
            <TSpan x={pos.x} dy="12" fontSize="8.5" fontWeight="500">
              {c.range}
            </TSpan>
          </SvgText>
        );
      })}

      <Polygon
        points={`${needleLeft.x},${needleLeft.y} ${needleTip.x},${needleTip.y} ${needleRight.x},${needleRight.y}`}
        fill="#1E293B"
      />
      <Circle cx={CX} cy={CY} r={15} fill={colors.white} stroke="#CBD5E1" strokeWidth={2} />
      <Circle cx={CX} cy={CY} r={7} fill="#1E293B" />
    </Svg>
  );
}
