import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import {Medicine} from '../types/Medicine';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';

interface Props {
  navigation: any;
}

export default function MedicineListScreen({navigation}: Props) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    loadMedicines();
    notificationService.initialize();

    const unsubscribe = navigation.addListener('focus', () => {
      loadMedicines();
    });

    return unsubscribe;
  }, [navigation]);

  const loadMedicines = async () => {
    const loadedMedicines = await storageService.getMedicines();
    setMedicines(loadedMedicines);
  };

  const toggleMedicine = async (medicine: Medicine) => {
    const updatedMedicine = {...medicine, isActive: !medicine.isActive};
    await storageService.saveMedicine(updatedMedicine);
    await notificationService.updateAlarms(updatedMedicine);
    loadMedicines();
  };

  const deleteMedicine = (medicine: Medicine) => {
    Alert.alert('약 삭제', `${medicine.name}를 삭제하시겠습니까?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await notificationService.cancelAllAlarmsForMedicine(medicine);
          await storageService.deleteMedicine(medicine.id);
          loadMedicines();
        },
      },
    ]);
  };

  const renderMedicine = ({item}: {item: Medicine}) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <Text style={styles.medicineDosage}>{item.dosage}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleMedicine(item)}
        />
      </View>

      <View style={styles.timesContainer}>
        {item.times.map((time, index) => (
          <View key={index} style={styles.timeChip}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </View>

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddMedicine', {medicine: item})}>
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMedicine(item)}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 약 목록</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedicine')}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {medicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>등록된 약이 없습니다</Text>
          <Text style={styles.emptySubText}>
            + 버튼을 눌러 약을 추가하세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicine}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#666',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  timeChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
  },
});
