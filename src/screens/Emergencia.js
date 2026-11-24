import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Header from '../components/Header';
import { apiRequest } from '../services/api';

const RED = '#D32F2F';

export default function EmergenciaScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { locateAndSearch(); }, []);

  async function locateAndSearch() {
    setLoading(true);
    setError('');
    try {
      let coords = null;
      if (Platform.OS === 'web' && navigator.geolocation) {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            reject,
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
          );
        });
      } else {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) throw new Error('Permissão de localização não concedida.');
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = current.coords;
      }

      setLocation(coords);
      const data = await apiRequest(`/api/emergency/ubs?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=8000`);
      setUnits(Array.isArray(data.units) ? data.units : []);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível obter sua localização ou encontrar unidades próximas.');
    } finally {
      setLoading(false);
    }
  }

  function openMap(unit) {
    const latitude = unit?.latitude ?? location?.latitude;
    const longitude = unit?.longitude ?? location?.longitude;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}${unit ? `&query_place_id=` : ''}`).catch(() => {});
  }

  function openDirections(unit) {
    const destination = `${unit.latitude},${unit.longitude}`;
    const origin = location ? `${location.latitude},${location.longitude}` : '';
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`).catch(() => {});
  }

  async function callNumber(number) {
    try { await Linking.openURL(`tel:${number}`); } catch {}
  }

  function distance(distanceMeters) {
    if (!Number.isFinite(distanceMeters)) return '';
    return distanceMeters < 1000 ? `${distanceMeters} m` : `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />
      <Header title="Emergência" subtitle="Ajuda rápida e unidades próximas" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIcon}><Ionicons name="warning" size={30} color="#FFFFFF" /></View>
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>Situação grave?</Text>
            <Text style={styles.emergencySubtitle}>Para risco imediato, ligue agora.</Text>
          </View>
        </View>

        <View style={styles.callGrid}>
          <Pressable onPress={() => callNumber('192')} style={styles.callButtonPrimary}>
            <Ionicons name="medical" size={22} color="#FFFFFF" /><View><Text style={styles.callNumber}>192</Text><Text style={styles.callLabel}>SAMU</Text></View>
          </Pressable>
          <Pressable onPress={() => callNumber('193')} style={styles.callButtonSecondary}>
            <Ionicons name="flame" size={22} color={RED} /><View><Text style={styles.callNumberRed}>193</Text><Text style={styles.callLabelRed}>Bombeiros</Text></View>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapGrid} />
            <View style={styles.mapPin}><Ionicons name="location" size={28} color="#FFFFFF" /></View>
            <View style={styles.mapRoadOne} /><View style={styles.mapRoadTwo} />
          </View>
          <View style={styles.mapFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>{location ? 'Sua localização atual' : 'Localização não disponível'}</Text>
              <Text style={styles.mapSubtitle}>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Ative o GPS para buscar unidades'}</Text>
            </View>
            <Pressable onPress={() => openMap(null)} disabled={!location} style={styles.mapButton}>
              <Ionicons name="map-outline" size={18} color={RED} /><Text style={styles.mapButtonText}>Abrir mapa</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Unidades próximas</Text><Text style={styles.sectionSubtitle}>Clínicas e hospitais encontrados</Text></View>
          <Pressable onPress={locateAndSearch} style={styles.refreshButton}><Ionicons name="refresh" size={18} color={RED} /></Pressable>
        </View>

        {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={RED} /><Text style={styles.loadingText}>Localizando unidades de saúde...</Text></View> : null}
        {!!error && <View style={styles.errorCard}><Ionicons name="alert-circle-outline" size={22} color="#B42318" /><Text style={styles.errorText}>{error}</Text></View>}

        {!loading && !error && units.length === 0 && (
          <View style={styles.empty}><Ionicons name="medical-outline" size={32} color="#A7ADB6" /><Text style={styles.emptyTitle}>Nenhuma unidade encontrada</Text><Text style={styles.emptyText}>Tente atualizar a localização ou ampliar o mapa.</Text></View>
        )}

        {units.map((unit, index) => (
          <View key={unit.id} style={styles.unitCard}>
            <View style={[styles.unitIcon, unit.isHospital && styles.hospitalIcon]}>
              <Ionicons name={unit.isHospital ? 'medical' : 'add-circle'} size={23} color="#FFFFFF" />
            </View>
            <View style={styles.unitMain}>
              <Text style={styles.unitName}>{unit.name}</Text>
              <Text style={styles.unitAddress}>{unit.address}</Text>
              <View style={styles.unitMeta}>
                <Text style={styles.distance}>{distance(unit.distanceMeters)}</Text>
                {unit.phone ? <Pressable onPress={() => callNumber(unit.phone.replace(/[^0-9]/g, ''))}><Text style={styles.phone}>{unit.phone}</Text></Pressable> : null}
              </View>
            </View>
            <Pressable onPress={() => openDirections(unit)} style={styles.routeButton}>
              <Ionicons name="navigate" size={20} color={RED} /><Text style={styles.routeText}>Rota</Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.tipCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#667085" />
          <Text style={styles.tipText}>Se estiver em risco imediato, não dirija sozinho. Ligue para o SAMU pelo 192 ou vá acompanhado a uma unidade.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { padding: 16, paddingBottom: 36 },
  emergencyCard: { minHeight: 82, borderRadius: 18, backgroundColor: RED, flexDirection: 'row', alignItems: 'center', padding: 15 },
  emergencyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.18)' },
  emergencyText: { flex: 1, marginLeft: 12 },
  emergencyTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  emergencySubtitle: { marginTop: 3, color: 'rgba(255,255,255,.88)', fontSize: 12.5 },
  callGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  callButtonPrimary: { flex: 1, height: 70, borderRadius: 15, backgroundColor: '#B71C1C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  callButtonSecondary: { flex: 1, height: 70, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1C8C8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  callNumber: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  callLabel: { color: 'rgba(255,255,255,.85)', fontSize: 10.5, fontWeight: '700' },
  callNumberRed: { color: RED, fontSize: 21, fontWeight: '900' },
  callLabelRed: { color: '#8C5A5A', fontSize: 10.5, fontWeight: '700' },
  mapCard: { marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: '#E4E7EC', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  mapPlaceholder: { height: 190, backgroundColor: '#E9EFE7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mapGrid: { position: 'absolute', width: '130%', height: '130%', backgroundColor: '#EEF3EA', transform: [{ rotate: '10deg' }] },
  mapRoadOne: { position: 'absolute', width: 260, height: 14, backgroundColor: '#FFFFFF', transform: [{ rotate: '-18deg' }] },
  mapRoadTwo: { position: 'absolute', width: 14, height: 220, backgroundColor: '#FFFFFF', transform: [{ rotate: '28deg' }] },
  mapPin: { zIndex: 3, width: 46, height: 46, borderRadius: 23, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6 },
  mapFooter: { minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  mapTitle: { fontSize: 13, fontWeight: '800', color: '#30343A' },
  mapSubtitle: { marginTop: 3, fontSize: 10.5, color: '#7A8088' },
  mapButton: { minHeight: 40, borderRadius: 11, borderWidth: 1, borderColor: '#F1C8C8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 9 },
  mapButtonText: { color: RED, fontSize: 11.5, fontWeight: '800' },
  sectionHeader: { marginTop: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#30343A' },
  sectionSubtitle: { marginTop: 2, fontSize: 11.5, color: '#7A8088' },
  refreshButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBEAEA' },
  loading: { minHeight: 120, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 8, fontSize: 12, color: '#69717A' },
  errorCard: { borderRadius: 14, backgroundColor: '#FEE4E2', flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17, color: '#B42318' },
  empty: { minHeight: 150, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '800', color: '#455A64' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#9AA1A9', textAlign: 'center' },
  unitCard: { minHeight: 108, borderRadius: 16, borderWidth: 1, borderColor: '#E4E7EC', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 11, marginBottom: 8 },
  unitIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#43A047', alignItems: 'center', justifyContent: 'center' },
  hospitalIcon: { backgroundColor: RED },
  unitMain: { flex: 1, marginHorizontal: 10 },
  unitName: { fontSize: 13.5, fontWeight: '900', color: '#30343A' },
  unitAddress: { marginTop: 3, fontSize: 11, lineHeight: 15, color: '#7A8088' },
  unitMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  distance: { fontSize: 10.5, fontWeight: '800', color: RED },
  phone: { fontSize: 10.5, fontWeight: '700', color: '#2871A8' },
  routeButton: { width: 52, height: 52, borderRadius: 13, backgroundColor: '#FBEAEA', alignItems: 'center', justifyContent: 'center' },
  routeText: { marginTop: 2, fontSize: 9.5, fontWeight: '800', color: RED },
  tipCard: { marginTop: 14, borderRadius: 14, backgroundColor: '#EEF2F6', flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  tipText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: '#667085' },
});
