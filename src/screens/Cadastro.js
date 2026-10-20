import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AuthScreenShell from '../components/auth/AuthScreenShell';
import AuthTextField from '../components/auth/AuthTextField';
import AuthPrimaryButton from '../components/auth/AuthPrimaryButton';
import { authStyles as styles } from '../components/auth/authStyles';
import { useProfile } from '../context/ProfileContext';

export default function RegisterScreen({ navigation }) {
 const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirmPassword,setConfirmPassword]=useState('');const [error,setError]=useState('');
 const [age,setAge]=useState('');const [weight,setWeight]=useState('');const [height,setHeight]=useState('');const [bloodType,setBloodType]=useState('');
 const { updateProfile } = useProfile();
 const createAccount=()=>{
  if(!name.trim()){setError('Informe seu nome.');return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Informe um e-mail válido.');return}
  if(password.length<6){setError('A senha deve ter pelo menos 6 caracteres.');return}
  if(password!==confirmPassword){setError('As senhas não coincidem.');return}
  if(age&&(!/^\d{1,3}$/.test(age)||Number(age)>130)){setError('Confira a idade informada.');return}
  const weightNumber=weight?Number(weight.replace(',','.')):null;
  const heightNumber=height?Number(height.replace(',','.')):null;
  if(weight&&( !Number.isFinite(weightNumber)||weightNumber<=0||weightNumber>500)){setError('Informe um peso válido em quilogramas.');return}
  if(height&&(!Number.isFinite(heightNumber)||heightNumber<40||heightNumber>250)){setError('Informe uma altura válida em centímetros.');return}
  updateProfile({name:name.trim(),email:email.trim(),age,bloodType,weight:weightNumber,height:heightNumber});
  setError('');navigation.navigate('Login',{registeredEmail:email.trim()});
 };
 return <AuthScreenShell title="Criar cadastro" subtitle="Preencha seus dados para acessar o aplicativo." onBack={()=>navigation.goBack()} footer={<View style={styles.footer}><Text style={styles.footerText}>Já tem uma conta?</Text><Pressable onPress={()=>navigation.navigate('Login')}><Text style={styles.footerLink}> Entrar</Text></Pressable></View>}>
  <AuthTextField label="Nome completo" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" autoCapitalize="words" autoComplete="name" />
  <AuthTextField label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoComplete="email" />
  <Text style={styles.sectionLabel}>Informações de saúde <Text style={styles.optional}>(opcionais)</Text></Text>
  <View style={styles.row}>
   <View style={styles.half}><AuthTextField label="Idade" value={age} onChangeText={setAge} placeholder="Anos" keyboardType="number-pad" autoComplete="off" /></View>
   <View style={styles.half}><AuthTextField label="Peso" value={weight} onChangeText={setWeight} placeholder="kg" keyboardType="decimal-pad" autoComplete="off" /></View>
  </View>
  <AuthTextField label="Altura" value={height} onChangeText={setHeight} placeholder="Centímetros (ex.: 170)" keyboardType="decimal-pad" autoComplete="off" />
  <Text style={styles.label}>Tipo sanguíneo</Text>
  <View style={styles.bloodTypes}>{['A+','A-','B+','B-','AB+','AB-','O+','O-',''].map((type,index)=><Pressable key={type||'unknown'} accessibilityRole="radio" accessibilityState={{checked:bloodType===type}} onPress={()=>setBloodType(type)} style={[styles.bloodTypeChip,bloodType===type&&styles.bloodTypeChipSelected]}><Text style={[styles.bloodTypeText,bloodType===type&&styles.bloodTypeTextSelected]}>{type||'Não sei'}</Text></Pressable>)}</View>
  <AuthTextField label="Senha" value={password} onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" secure autoComplete="new-password" />
  <AuthTextField label="Confirmar senha" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite a senha novamente" secure autoComplete="new-password" />
  {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
  <AuthPrimaryButton label="Criar conta" onPress={createAccount} />
 </AuthScreenShell>;
}

