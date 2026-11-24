import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../../constants/theme';
import WaterLogItem from '../WaterLogItem';

export default function WaterHistory({ logs, handleClearDay, handleDeleteLog }) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.formTitle}>Histórico de hoje</Text>
        {logs.length > 0 && (
          <Pressable onPress={handleClearDay} hitSlop={8}>
            <Text style={styles.clearText}>Limpar</Text>
          </Pressable>
        )}
      </View>

      {logs.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum registro ainda. Toque em um dos botões acima para começar.
        </Text>
      ) : (
        logs.map((log) => (
          <WaterLogItem key={log.id} log={log} onDelete={handleDeleteLog} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 14,
  },
  clearText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
