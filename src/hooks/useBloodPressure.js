import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY = '@saude/blood-pressure/v1';
function normalize(r) {
  if (!r || typeof r !== 'object' || !r.id) return null;
  const systolic = Number(r.systolic), diastolic = Number(r.diastolic);
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null;
  return { id: String(r.id), systolic, diastolic, pulse: r.pulse ? String(r.pulse) : '', date: typeof r.date === 'string' ? r.date : '', time: typeof r.time === 'string' ? r.time : '', arm: typeof r.arm === 'string' ? r.arm : '', note: typeof r.note === 'string' ? r.note : '' };
}
const sort = (items) => [...items].sort((a,b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`) || b.id.localeCompare(a.id));
export default function useBloodPressure() {
 const [readings,setReadings]=useState([]), [ready,setReady]=useState(false), [error,setError]=useState('');
 const records=useRef([]), writes=useRef(Promise.resolve());
 useEffect(()=>{let active=true; AsyncStorage.getItem(STORAGE_KEY).then(saved=>{if(!active||!saved)return; const parsed=JSON.parse(saved); if(!Array.isArray(parsed))throw Error(); const loaded=sort(parsed.map(normalize).filter(Boolean)); records.current=loaded;setReadings(loaded);}).catch(()=>{if(active)setError('Não foi possível carregar as medidas salvas neste aparelho.');}).finally(()=>{if(active)setReady(true);}); return()=>{active=false};},[]);
 const commit=useCallback(next=>{const sorted=sort(next);records.current=sorted;setReadings(sorted);setError('');writes.current=writes.current.catch(()=>{}).then(()=>AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(sorted)));return writes.current.then(()=>true).catch(()=>{setError('Não foi possível salvar as alterações neste aparelho. Tente novamente.');return false;});},[]);
 const addReading=useCallback(r=>{const record=normalize({...r,id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`});return record?commit([...records.current,record]):Promise.resolve(false);},[commit]);
 const updateReading=useCallback((id,changes)=>commit(records.current.map(r=>r.id===id?normalize({...r,...changes,id}):r).filter(Boolean)),[commit]);
 const deleteReading=useCallback(id=>commit(records.current.filter(r=>r.id!==id)),[commit]);
 return {readings,ready,error,addReading,updateReading,deleteReading};
}

