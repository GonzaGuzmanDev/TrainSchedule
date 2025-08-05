import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ResultsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parseamos los parámetros
  const trips = params.trips ? JSON.parse(params.trips as string) : [];
  const searchParams = params.searchParams ? JSON.parse(params.searchParams as string) : {};

  const { dayType, origin, destination, startTime, endTime } = searchParams;

  const formatTimeRange = () => {
    if (!startTime && !endTime) return 'Todo el día';
    if (startTime && !endTime) return `Desde ${startTime}`;
    if (!startTime && endTime) return `Hasta ${endTime}`;
    return `De ${startTime} a ${endTime}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemHeader}>Viaje {item.trip_id}</Text>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Salida:</Text>
        <Text style={styles.timeValue}>{item.origen}</Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Llegada:</Text>
        <Text style={styles.timeValue}>{item.destino}</Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Duración:</Text>
        <Text style={styles.timeValue}>{item.duracion}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Horarios de {origin} a {destination}
      </Text>

      <Text style={styles.subHeader}>
        {dayType} - {formatTimeRange()}
      </Text>

      {trips.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No se encontraron viajes</Text>
          <Text style={styles.noResultsSubText}>Intenta con otros parámetros de búsqueda</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderItem}
          keyExtractor={item => item.trip_id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Button
        title="Nueva Búsqueda"
        onPress={() => router.back()}
        color="#2c3e50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e74c3c',
  },
  noResultsSubText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
});

export default ResultsScreen;