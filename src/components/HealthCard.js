import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export const NUM_COLUMNS = 3;
const H_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH =
  (Dimensions.get('window').width - H_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export default function HealthCard({ item, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width: CARD_WIDTH }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '18' }]}>
        {item.type === 'ion' ? (
          <Ionicons name={item.icon} size={26} color={item.color} />
        ) : (
          <FontAwesome5 name={item.icon} size={22} color={item.color} />
        )}
      </View>
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMedium,
    textAlign: 'center',
  },
});
