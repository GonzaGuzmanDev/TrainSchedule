import ResultsScreen from '@/components/ResultsScreen';
import { Stack } from 'expo-router';

export default function ResultsScreenWrapper() {
  return (
    <>
      <Stack.Screen options={{ title: 'Resultados' }} />
      <ResultsScreen />
    </>
  );
}