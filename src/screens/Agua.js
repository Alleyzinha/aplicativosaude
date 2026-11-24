import WaterHistory from '../components/water/WaterHistory';
import WaterIntakeForm from '../components/water/WaterIntakeForm';
import WaterProgressCard from '../components/water/WaterProgressCard';
import WaterGoalCalculator from '../components/water/WaterGoalCalculator';
import useWaterTracker from '../hooks/useWaterTracker';
import React from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../components/Header';
import { colors } from '../constants/theme';

export default function AguaScreen({ navigation }) {
  const {
    goal,
    logs,
    customAmount,
    setCustomAmount,
    editingGoal,
    setEditingGoal,
    goalInput,
    setGoalInput,
    weight,
    setWeight,
    height,
    setHeight,
    calculationError,
    calculatedProfile,
    current,
    addLog,
    handleAddCustom,
    handleDeleteLog,
    handleClearDay,
    handleConfirmGoal,
    handleCalculateGoal,
  } = useWaterTracker();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2B46" />

      <Header
        title="Hora de beber Água!"
        subtitle="Acompanhe sua hidratação ao longo do dia"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <WaterGoalCalculator
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            calculationError={calculationError}
            calculatedProfile={calculatedProfile}
            handleCalculateGoal={handleCalculateGoal}
          />

          <WaterProgressCard
            current={current}
            goal={goal}
            editingGoal={editingGoal}
            goalInput={goalInput}
            setGoalInput={setGoalInput}
            setEditingGoal={setEditingGoal}
            handleConfirmGoal={handleConfirmGoal}
          />

          <WaterIntakeForm
            addLog={addLog}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            handleAddCustom={handleAddCustom}
          />

          <WaterHistory
            logs={logs}
            handleClearDay={handleClearDay}
            handleDeleteLog={handleDeleteLog}
          />

          <Text style={styles.footerNote}>
            Manter-se hidratado ajuda na concentração, digestão e disposição ao longo do dia.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.textPlaceholder,
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
