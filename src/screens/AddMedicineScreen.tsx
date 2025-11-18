import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {Medicine} from '../types/Medicine';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';

interface Props {
  navigation: any;
  route: any;
}

export default function AddMedicineScreen({navigation, route}: Props) {
  const editingMedicine = route.params?.medicine as Medicine | undefined;
  const isEditing = !!editingMedicine;

  const [name, setName] = useState(editingMedicine?.name || '');
  const [dosage, setDosage] = useState(editingMedicine?.dosage || '');
  const [notes, setNotes] = useState(editingMedicine?.notes || '');
  const [times, setTimes] = useState<string[]>(editingMedicine?.times || []);
  const [newTime, setNewTime] = useState('');

  const addTime = () => {
    if (!newTime) {
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(newTime)) {
      Alert.alert('알림', '올바른 시간 형식을 입력하세요 (예: 09:00)');
      return;
    }

    if (times.includes(newTime)) {
      Alert.alert('알림', '이미 추가된 시간입니다');
      return;
    }

    setTimes([...times, newTime].sort());
    setNewTime('');
  };

  const removeTime = (time: string) => {
    setTimes(times.filter(t => t !== time));
  };

  const saveMedicine = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '약 이름을 입력하세요');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('알림', '용량을 입력하세요');
      return;
    }

    if (times.length === 0) {
      Alert.alert('알림', '최소 한 개의 복용 시간을 추가하세요');
      return;
    }

    const medicine: Medicine = {
      id: editingMedicine?.id || Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: 'custom',
      times,
      startDate: new Date().toISOString(),
      notes: notes.trim(),
      isActive: editingMedicine?.isActive ?? true,
    };

    try {
      await storageService.saveMedicine(medicine);
      await notificationService.updateAlarms(medicine);
      Alert.alert(
        '성공',
        isEditing ? '약 정보가 수정되었습니다' : '약이 추가되었습니다',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('오류', '저장 중 오류가 발생했습니다');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>약 이름 *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="예: 타이레놀"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>용량 *</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="예: 500mg, 1정"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>복용 시간 *</Text>
        <View style={styles.timeInputContainer}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:mm (예: 09:00)"
            placeholderTextColor="#999"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
            <Text style={styles.addTimeButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timesContainer}>
          {times.map((time, index) => (
            <View key={index} style={styles.timeChip}>
              <Text style={styles.timeText}>{time}</Text>
              <TouchableOpacity onPress={() => removeTime(time)}>
                <Text style={styles.removeTimeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.label}>메모 (선택사항)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="복용 시 주의사항 등을 입력하세요"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveMedicine}>
          <Text style={styles.saveButtonText}>
            {isEditing ? '수정하기' : '저장하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
  addTimeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTimeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  timeChip: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeTimeText: {
    color: '#1976D2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notesInput: {
    height: 100,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
