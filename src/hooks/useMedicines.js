import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saude/medicines/v1';
const EMPTY_FORM = {
  name: '',
  dosage: '',
  time: '',
  frequency: 'Uma vez ao dia',
  route: 'Oral',
  instructions: '',
};
const IMAGE_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

export default function useMedicines() {
  const [imageUri, setImageUri] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    let active = true;

    async function restoreMedicines() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setMedicines(parsed);
        }
      } catch {
        // Mantém a tela utilizável mesmo se o armazenamento estiver indisponível.
      }

      const pendingResult = await ImagePicker.getPendingResultAsync();
      if (active && pendingResult && !pendingResult.canceled && pendingResult.assets?.[0]) {
        setImageUri(pendingResult.assets[0].uri);
      }
    }

    restoreMedicines();
    return () => { active = false; };
  }, []);

  const persist = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch {
      setError('Não foi possível salvar o remédio neste aparelho.');
      return false;
    }
  };

  const keepSelectedImage = (result) => {
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o remédio.');
      return;
    }
    keepSelectedImage(await ImagePicker.launchCameraAsync({
      ...IMAGE_OPTIONS,
      cameraType: ImagePicker.CameraType.back,
    }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para escolher uma imagem.');
      return;
    }
    keepSelectedImage(await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS));
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const handleAdd = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('Informe o nome do remédio.');
      return;
    }

    const medicine = {
      id: String(Date.now()),
      ...form,
      name,
      dosage: form.dosage.trim(),
      time: form.time.trim(),
      instructions: form.instructions.trim(),
      imageUri,
    };
    const next = [medicine, ...medicines];
    if (!(await persist(next))) return;

    setMedicines(next);
    setForm(EMPTY_FORM);
    setImageUri(null);
    setError('');
  };

  const handleDelete = async (id) => {
    const next = medicines.filter((item) => item.id !== id);
    if (await persist(next)) setMedicines(next);
  };

  return {
    imageUri,
    setImageUri,
    form,
    error,
    medicines,
    handleTakePhoto,
    handlePickImage,
    handleChange,
    handleAdd,
    handleDelete,
  };
}
