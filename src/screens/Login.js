import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AuthScreenShell from '../components/auth/AuthScreenShell';
import AuthTextField from '../components/auth/AuthTextField';
import AuthPrimaryButton from '../components/auth/AuthPrimaryButton';
import { authStyles as styles } from '../components/auth/authStyles';
import { useProfile } from '../context/ProfileContext';
import { authenticate } from '../services/api';

export default function LoginScreen({ navigation, route }) {
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [notice,setNotice]=useState('');const [loading,setLoading]=useState(false);const {updateProfile}=useProfile();
 useEffect(()=>{if(route.params?.registeredEmail){setEmail(route.params.registeredEmail);setNotice('Cadastro realizado. Entre com seu e-mail e sua senha.');}},[route.params?.registeredEmail]);
 const signIn=async()=>{if(loading)return;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Informe um e-mail válido.');return}if(!password){setError('Informe sua senha.');return}setError('');setLoading(true);try{const user=await authenticate('login',{email:email.trim(),password});updateProfile(user);navigation.replace('Home')}catch(requestError){setError(requestError.message)}finally{setLoading(false)}};
 return <AuthScreenShell title="Entrar" subtitle="Acesse sua área de saúde para acompanhar suas informações." footer={<View style={styles.footer}><Text style={styles.footerText}>Ainda não tem conta?</Text><Pressable onPress={()=>navigation.navigate('Cadastro')}><Text style={styles.footerLink}> Criar cadastro</Text></Pressable></View>}>
  {notice?<Text style={styles.notice}>{notice}</Text>:null}
  <AuthTextField label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoComplete="email" />
  <AuthTextField label="Senha" value={password} onChangeText={setPassword} placeholder="Digite sua senha" secure autoComplete="password" />
  {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
  <AuthPrimaryButton label="Entrar" onPress={signIn} loading={loading} />
  <Pressable onPress={()=>navigation.navigate('Cadastro')} style={{marginTop:14,alignSelf:'center'}}><Text style={styles.footerLink}>Ainda não sou cadastrado</Text></Pressable>
 </AuthScreenShell>;
}

