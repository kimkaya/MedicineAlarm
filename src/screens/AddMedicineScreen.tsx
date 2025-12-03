import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Medicine, MedicineCategory} from '../types/Medicine';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';
import {useTheme} from '../context/ThemeContext';
import {getCategoryColor} from '../theme/colors';

interface Props {
  navigation: any;
  route: any;
}

export default function AddMedicineScreen({navigation, route}: Props) {
  const {colors, isDark} = useTheme();
  const editingMedicine = route.params?.medicine as Medicine | undefined;
  const isEditing = !!editingMedicine;

  const [name, setName] = useState(editingMedicine?.name || '');
  const [dosage, setDosage] = useState(editingMedicine?.dosage || '');
  const [notes, setNotes] = useState(editingMedicine?.notes || '');
  const [times, setTimes] = useState<string[]>(editingMedicine?.times || []);
  const [newTime, setNewTime] = useState('');
  const [category, setCategory] = useState<MedicineCategory>(
    editingMedicine?.category || 'otc',
  );
  const [photoUri, setPhotoUri] = useState(editingMedicine?.photoUri);
  const [effectiveness, setEffectiveness] = useState(
    editingMedicine?.effectiveness || '',
  );
  const [sideEffects, setSideEffects] = useState(
    editingMedicine?.sideEffects || '',
  );
  const [totalPills, setTotalPills] = useState(
    editingMedicine?.totalPills?.toString() || '',
  );
  const [remainingPills, setRemainingPills] = useState(
    editingMedicine?.remainingPills?.toString() || '',
  );
  const [pharmacyName, setPharmacyName] = useState(
    editingMedicine?.pharmacy?.name || '',
  );
  const [pharmacyPhone, setPharmacyPhone] = useState(
    editingMedicine?.pharmacy?.phone || '',
  );
  const [pharmacyAddress, setPharmacyAddress] = useState(
    editingMedicine?.pharmacy?.address || '',
  );

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('오류', '이미지를 선택할 수 없습니다');
          return;
        }
        if (response.assets && response.assets[0].uri) {
          setPhotoUri(response.assets[0].uri);
        }
      },
    );
  };

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
      startDate: editingMedicine?.startDate || new Date().toISOString(),
      notes: notes.trim(),
      isActive: editingMedicine?.isActive ?? true,
      category,
      photoUri,
      effectiveness: effectiveness.trim() || undefined,
      sideEffects: sideEffects.trim() || undefined,
      totalPills: totalPills ? parseInt(totalPills, 10) : undefined,
      remainingPills: remainingPills ? parseInt(remainingPills, 10) : undefined,
      pharmacy:
        pharmacyName || pharmacyPhone || pharmacyAddress
          ? {
              name: pharmacyName.trim(),
              phone: pharmacyPhone.trim(),
              address: pharmacyAddress.trim(),
            }
          : undefined,
      intakeHistory: editingMedicine?.intakeHistory || [],
    };

    try {
      await storageService.saveMedicine(medicine);

      try {
        await notificationService.initialize();
        await notificationService.updateAlarms(medicine);
      } catch (notifError) {
        console.error('알림 설정 오류:', notifError);
        Alert.alert(
          '경고',
          '약은 저장되었지만 알림 설정에 실패했습니다.\n알림 권한을 확인해주세요.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ],
        );
        return;
      }

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
      console.error('약 저장 오류:', error);
      Alert.alert('오류', `저장 중 오류가 발생했습니다:\n${error}`);
    }
  };

  const getCategoryIcon = (cat: MedicineCategory) => {
    switch (cat) {
      case 'prescription':
        return 'medical-bag';
      case 'otc':
        return 'pill';
      case 'supplement':
        return 'bottle-tonic';
    }
  };

  const getCategoryLabel = (cat: MedicineCategory) => {
    switch (cat) {
      case 'prescription':
        return '처방약';
      case 'otc':
        return '일반약';
      case 'supplement':
        return '영양제';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 24,
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 15,
    },
    required: {
      color: colors.error,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    categoryContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 10,
    },
    categoryButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 8,
    },
    categoryButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    categoryIcon: {
      marginBottom: 4,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    categoryLabelActive: {
      color: colors.primary,
    },
    photoSection: {
      alignItems: 'center',
      marginVertical: 10,
    },
    photoPreview: {
      width: 120,
      height: 120,
      borderRadius: 12,
      marginBottom: 12,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 12,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    photoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.primary,
      gap: 8,
    },
    photoButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    timeInputContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    timeInput: {
      flex: 1,
    },
    addTimeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      borderRadius: 12,
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
      gap: 8,
    },
    timeChip: {
      backgroundColor: colors.primary + '20',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 8,
      borderRadius: 16,
      gap: 8,
    },
    timeText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    removeTimeButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notesInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    pillsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    pillsInput: {
      flex: 1,
    },
    pharmacyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      marginTop: 30,
      marginBottom: 40,
      borderRadius: 12,
      overflow: 'hidden',
    },
    saveButtonGradient: {
      padding: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>📋 기본 정보</Text>

        <Text style={styles.label}>
          카테고리 <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.categoryContainer}>
          {(['prescription', 'otc', 'supplement'] as MedicineCategory[]).map(
            cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}>
                <Icon
                  name={getCategoryIcon(cat)}
                  size={32}
                  color={
                    category === cat
                      ? getCategoryColor(cat, isDark)
                      : colors.textSecondary
                  }
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat && styles.categoryLabelActive,
                  ]}>
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <Text style={styles.label}>
          약 이름 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="예: 타이레놀"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>
          용량 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="예: 500mg, 1정"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>약 사진</Text>
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{uri: photoUri}} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera" size={40} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Icon name="image-plus" size={20} color="#fff" />
            <Text style={styles.photoButtonText}>
              {photoUri ? '사진 변경' : '사진 추가'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>⏰ 복용 시간</Text>

        <Text style={styles.label}>
          복용 시간 <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.timeInputContainer}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:mm (예: 09:00)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
            <Text style={styles.addTimeButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timesContainer}>
          {times.map((time, index) => (
            <View key={index} style={styles.timeChip}>
              <Icon name="clock-outline" size={14} color={colors.primary} />
              <Text style={styles.timeText}>{time}</Text>
              <TouchableOpacity
                style={styles.removeTimeButton}
                onPress={() => removeTime(time)}>
                <Icon name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>💊 상세 정보</Text>

        <Text style={styles.label}>효능</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={effectiveness}
          onChangeText={setEffectiveness}
          placeholder="이 약의 효능을 입력하세요"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>부작용</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={sideEffects}
          onChangeText={setSideEffects}
          placeholder="주의해야 할 부작용을 입력하세요"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>약 개수</Text>
        <View style={styles.pillsRow}>
          <View style={styles.pillsInput}>
            <Text style={[styles.label, {marginTop: 0}]}>전체 개수</Text>
            <TextInput
              style={styles.input}
              value={totalPills}
              onChangeText={setTotalPills}
              placeholder="30"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.pillsInput}>
            <Text style={[styles.label, {marginTop: 0}]}>남은 개수</Text>
            <TextInput
              style={styles.input}
              value={remainingPills}
              onChangeText={setRemainingPills}
              placeholder="30"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>🏥 약국 정보</Text>

        <View style={styles.pharmacyCard}>
          <Text style={styles.label}>약국 이름</Text>
          <TextInput
            style={styles.input}
            value={pharmacyName}
            onChangeText={setPharmacyName}
            placeholder="예: 행복약국"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={pharmacyPhone}
            onChangeText={setPharmacyPhone}
            placeholder="예: 02-1234-5678"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>주소</Text>
          <TextInput
            style={styles.input}
            value={pharmacyAddress}
            onChangeText={setPharmacyAddress}
            placeholder="약국 주소를 입력하세요"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <Text style={styles.sectionTitle}>📝 메모</Text>

        <Text style={styles.label}>메모</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="복용 시 주의사항 등을 입력하세요"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.saveButton}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.saveButtonGradient}>
            <TouchableOpacity onPress={saveMedicine}>
              <Text style={styles.saveButtonText}>
                {isEditing ? '수정하기' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}
