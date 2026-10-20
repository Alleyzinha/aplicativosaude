import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default function InfoTile({ icon, title, body, styles }) { return <View style={styles.infoTile}><Ionicons name={icon} size={20} color="#C62828" /><View style={styles.infoText}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.body}>{body}</Text></View></View>; }

