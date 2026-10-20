import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const EMPTY_FORM = { name: '', dosage: '', time: '' };
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
    async function restorePendingImage() {
      const pendingResult = await ImagePicker.getPendingResultAsync();
      if (pendingResult && !pendingResult.canceled && pendingResult.assets?.[0]) {
        setImageUri(pendingResult.assets[0].uri);
      }
    }
    restorePendingImage();
  }, []);

  const keepSelectedImage = (result) => {
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o remédio.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      ...IMAGE_OPTIONS,
      cameraType: ImagePicker.CameraType.back,
    });
    keepSelectedImage(result);
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

  const handleAdd = () => {
    const name = form.name.trim();
    if (!name) {
      setError('Informe o nome do remédio.');
      return;
    }
    setMedicines((current) => [{ id: String(Date.now()), ...form, name, imageUri }, ...current]);
    setForm(EMPTY_FORM);
    setImageUri(null);
    setError('');
  };

  const handleDelete = (id) => {
    setMedicines((current) => current.filter((item) => item.id !== id));
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
