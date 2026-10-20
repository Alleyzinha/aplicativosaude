import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home';
import ImcScreen from '../screens/Imc';
import AguaScreen from '../screens/Agua';
import RemedioScreen from '../screens/Remedio';
import PerfilScreen from '../screens/Perfil';
import SangueScreen from '../screens/Sangue';
import AlimentacaoScreen from '../screens/Alimentacao';
import PressaoScreen from '../screens/Pressao';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Cadastro';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A8A',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Sangue" component={SangueScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Alimentacao" component={AlimentacaoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Pressao" component={PressaoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Imc"
          component={ImcScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Agua"
          component={AguaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Remedio"
          component={RemedioScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


