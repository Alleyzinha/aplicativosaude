import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default function SectionCard({ icon, title, subtitle, children, styles }) { return <View style={styles.card}><View style={styles.sectionHeading}><View style={styles.sectionIcon}><Ionicons name={icon} size={21} color="#C62828" /></View><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text></View>{subtitle ? <Text style={styles.smallNote}>{subtitle}</Text> : null}{children}</View>; }

