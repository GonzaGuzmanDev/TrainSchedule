import SearchScreen from '@/components/SearchScreen';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Horarios de Tren' }} />
      <SearchScreen />
    </>
  );
}