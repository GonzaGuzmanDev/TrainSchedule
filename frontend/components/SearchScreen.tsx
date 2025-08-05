import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Picker, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { DAY_TYPES, STATIONS } from '@/constants/stations';

const SearchScreen = () => {
  const [dayType, setDayType] = useState(DAY_TYPES[0]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Por favor selecciona origen y destino');
      return;
    }

    if (origin === destination) {
      Alert.alert('Error', 'Origen y destino no pueden ser iguales');
      return;
    }

    try {
      setLoading(true);

      // Reemplaza con la IP de tu servidor backend
      const BASE_URL = 'http://127.0.0.1:8000';

      const response = await axios.get(`${BASE_URL}/horarios`, {
        params: {
          dia: dayType,
          origen: origin,
          destino: destination,
          horario_desde: startTime,
          horario_hasta: endTime
        }
      });

      // Navegamos a la pantalla de resultados pasando los parámetros
      router.push({
        pathname: '/results',
        params: {
          trips: JSON.stringify(response.data.viajes),
          searchParams: JSON.stringify({
            dayType,
            origin,
            destination,
            startTime,
            endTime
          })
        }
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron obtener los horarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de día:</Text>
      <Picker
        selectedValue={dayType}
        onValueChange={(itemValue) => setDayType(itemValue)}
        style={styles.picker}
      >
        {DAY_TYPES.map(day => (
          <Picker.Item key={day} label={day} value={day} />
        ))}
      </Picker>

      <Text style={styles.label}>Estación de origen:</Text>
      <Picker
        selectedValue={origin}
        onValueChange={(itemValue) => setOrigin(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione origen" value="" />
        {STATIONS.map(station => (
          <Picker.Item key={station} label={station} value={station} />
        ))}
      </Picker>

      <Text style={styles.label}>Estación de destino:</Text>
      <Picker
        selectedValue={destination}
        onValueChange={(itemValue) => setDestination(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione destino" value="" />
        {STATIONS.map(station => (
          <Picker.Item key={station} label={station} value={station} />
        ))}
      </Picker>

      <Text style={styles.label}>Horario desde (HH:MM):</Text>
      <TextInput
        value={startTime}
        onChangeText={setStartTime}
        placeholder="08:00"
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Horario hasta (HH:MM):</Text>
      <TextInput
        value={endTime}
        onChangeText={setEndTime}
        placeholder="10:00"
        style={styles.input}
        keyboardType="numeric"
      />

      <Button
        title={loading ? "Buscando..." : "Buscar Horarios"}
        onPress={handleSearch}
        disabled={loading}
        color="#2c3e50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
});

export default SearchScreen;