import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import useBloodPressure from '../hooks/useBloodPressure';
import PressureForm from '../components/PressureForm';
import PressureReadingCard from '../components/PressureReadingCard';
import MeasurementGuideCard from '../components/MeasurementGuideCard';
import { styles } from '../components/pressaoStyles';
const PINK = '#C2185B';
const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const initialForm = () => { const d = new Date(); return { systolic:'', diastolic:'', pulse:'', date:localDate(d), time:`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`, arm:'', note:'' }; };
export default function PressaoScreen({ navigation }) {
 const { readings, ready, error, addReading, updateReading, deleteReading } = useBloodPressure();
 const [form,setForm]=useState(initialForm); const [editingId,setEditingId]=useState(null); const [formError,setFormError]=useState(''); const [saving,setSaving]=useState(false); const [showForm,setShowForm]=useState(false);
 const setField=(key,value)=>setForm(current=>({...current,[key]:value}));
 const beginNew=()=>{setForm(initialForm());setEditingId(null);setFormError('');setShowForm(true)};
 const beginEdit=reading=>{setForm({...reading,systolic:String(reading.systolic),diastolic:String(reading.diastolic)});setEditingId(reading.id);setFormError('');setShowForm(true)};
 const save=async()=>{const systolic=Number(form.systolic),diastolic=Number(form.diastolic);if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(form.date)||!/^\\d{2}:\\d{2}$/.test(form.time)){setFormError('Informe data e horário válidos.');return}if(!Number.isInteger(systolic)||systolic<=0||!Number.isInteger(diastolic)||diastolic<=0){setFormError('Informe os valores sistólico e diastólico em mmHg.');return}if(form.pulse&&(!Number.isInteger(Number(form.pulse))||Number(form.pulse)<=0)){setFormError('O pulso deve ser um número inteiro positivo ou ficar vazio.');return}setSaving(true);setFormError('');const data={...form,systolic,diastolic};const saved=editingId?await updateReading(editingId,data):await addReading(data);setSaving(false);if(saved){setForm(initialForm());setEditingId(null);setShowForm(false)}else setFormError('Não foi possível salvar. Tente novamente.')};
 const remove=reading=>{const confirm=()=>deleteReading(reading.id);if(Platform.OS==='web'&&typeof globalThis.confirm==='function'){if(globalThis.confirm('Excluir esta medida?'))confirm()}else Alert.alert('Excluir medida?','Esta ação não pode ser desfeita.',[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:confirm}])};
 return <SafeAreaView style={styles.safe} edges={['top','left','right']}><StatusBar barStyle="light-content" backgroundColor={PINK}/><Header title="Pressão arterial" onBack={()=>navigation.goBack()}/><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
  <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="heart" size={25} color={PINK}/></View><View style={{flex:1}}><Text style={styles.heroTitle}>Suas medidas, organizadas</Text><Text style={styles.heroText}>Registre os valores do aparelho e acompanhe seu histórico.</Text></View></View>
  <Pressable style={styles.addButton} onPress={beginNew}><Ionicons name="add-circle-outline" size={22} color="#fff"/><Text style={styles.addText}>Registrar medida</Text></Pressable>
  {showForm&&<PressureForm form={form} setField={setField} editing={Boolean(editingId)} error={formError} saving={saving} onCancel={()=>{setShowForm(false);setEditingId(null)}} onSave={save}/>}
  <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Histórico</Text><Text style={styles.count}>{readings.length} {readings.length===1?'registro':'registros'}</Text></View>
  {!ready?<ActivityIndicator color={PINK} style={{margin:24}}/>:readings.length===0?<View style={styles.empty}><Ionicons name="clipboard-outline" size={30} color="#A0A6AE"/><Text style={styles.emptyTitle}>Nenhuma medida registrada</Text><Text style={styles.muted}>Use “Registrar medida” para guardar uma leitura.</Text></View>:readings.map(reading=><PressureReadingCard key={reading.id} reading={reading} onEdit={()=>beginEdit(reading)} onDelete={()=>remove(reading)}/>)}
  {error?<Text style={styles.error}>{error}</Text>:null}<MeasurementGuideCard/><Text style={styles.storage}>As medidas ficam salvas neste aparelho.</Text>
 </ScrollView></SafeAreaView>;
}

