import BmiLegend from '../components/bmi/BmiLegend';
import BmiForm from '../components/bmi/BmiForm';
import BmiResultCard from '../components/bmi/BmiResultCard';
import useBmiCalculator from '../hooks/useBmiCalculator';
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

export default function ImcScreen({ navigation }) {
  const {
    weight,
    setWeight,
    height,
    setHeight,
    bmi,
    error,
    activeCategory,
    handleCalculate,
    handleClear,
  } = useBmiCalculator();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2B46" />

      <Header
        title="Calculadora de IMC"
        subtitle="Descubra sua faixa de peso ideal em segundos"
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
          <BmiResultCard
            bmi={bmi}
            activeCategory={activeCategory}
          />

          <BmiForm
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            error={error}
            handleClear={handleClear}
            handleCalculate={handleCalculate}
          />

          <BmiLegend
            activeCategory={activeCategory}
          />

          <Text style={styles.footerNote}>
            O IMC é uma referência geral e não substitui uma avaliação médica.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
