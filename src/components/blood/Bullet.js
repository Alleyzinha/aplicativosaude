import React from 'react';
import { View, Text } from 'react-native';
export default function Bullet({ text, styles }) { return <View style={styles.bulletRow}><View style={styles.bullet} /><Text style={[styles.body, styles.bulletText]}>{text}</Text></View>; }

