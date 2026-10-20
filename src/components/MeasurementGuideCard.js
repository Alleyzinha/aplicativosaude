import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './pressaoStyles';
const GUIDE_URL = 'https://linhasdecuidado.saude.gov.br/resources/linhas-completas/LC_HAS_no_adulto.pdf';
export default function MeasurementGuideCard() {
  return <View style={styles.card}>
    <Text style={styles.cardTitle}>Como medir corretamente</Text>
    <Text style={styles.guideText}>– Descanse sentado por 3 a 5 minutos, em local tranquilo, sem conversar.</Text>
    <Text style={styles.guideText}>– Evite exercício, café, álcool e cigarro nos 30 minutos anteriores; esvazie a bexiga.</Text>
    <Text style={styles.guideText}>– Sente-se com costas apoiadas, pés no chão, pernas descruzadas e braço na altura do coração.</Text>
    <Text style={styles.guideText}>– Siga as instruções do aparelho e as orientações do profissional de saúde.</Text>
    <Text style={styles.disclaimer}>Os registros sóo para acompanhamento pessoal. A interpretação deve ser feita por um profissional de saúde.</Text>
    <Pressable onPress={() => Linking.openURL(GUIDE_URL)} style={styles.link}><Text style={styles.linkText}>Consultar guia do Ministério da Saúde</Text><Ionicons name="open-outline" size={16} color="#C2185B" /></Pressable>
  </View>;
}

