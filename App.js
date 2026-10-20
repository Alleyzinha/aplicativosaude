import AppNavigator from './src/navigation/AppNavigator';
import { ProfileProvider } from './src/context/ProfileContext';

export default function App() {
  return <ProfileProvider><AppNavigator /></ProfileProvider>;
}
