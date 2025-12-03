import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Medicine, MedicineCategory} from '../types/Medicine';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';
import {useTheme} from '../context/ThemeContext';
import {getCategoryColor, getTimeBasedColor} from '../theme/colors';

interface Props {
  navigation: any;
}

export default function MedicineListScreen({navigation}: Props) {
  const {colors, isDark} = useTheme();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [todaysMedicines, setTodaysMedicines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | 'all'>('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadMedicines();
    loadTodaysMedicines();
    notificationService.initialize();

    const unsubscribe = navigation.addListener('focus', () => {
      loadMedicines();
      loadTodaysMedicines();
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Refresh today's medicines every minute
    const interval = setInterval(loadTodaysMedicines, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation]);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchQuery, selectedCategory]);

  const loadMedicines = async () => {
    const loadedMedicines = await storageService.getMedicines();
    setMedicines(loadedMedicines);
  };

  const loadTodaysMedicines = async () => {
    const todays = await storageService.getTodaysMedicines();
    setTodaysMedicines(todays);
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredMedicines(filtered);
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

  const markAsTaken = async (medicineId: string, time: string) => {
    await storageService.recordIntake(medicineId, time, true);
    loadTodaysMedicines();
    Alert.alert('복용 완료', '약 복용이 기록되었습니다! 👍');
  };

  const getCategoryIcon = (category: MedicineCategory) => {
    switch (category) {
      case 'prescription':
        return 'medical-bag';
      case 'otc':
        return 'pill';
      case 'supplement':
        return 'bottle-tonic';
      default:
        return 'pill';
    }
  };

  const getCategoryLabel = (category: MedicineCategory) => {
    switch (category) {
      case 'prescription':
        return '처방약';
      case 'otc':
        return '일반약';
      case 'supplement':
        return '영양제';
      default:
        return '';
    }
  };

  const renderTodayMedicine = ({item}: any) => {
    const {medicine, nextTime, timeRemaining} = item;
    const dateStr = new Date().toISOString().split('T')[0];
    const isTaken = medicine.intakeHistory.some(
      (r: any) => r.date === dateStr && r.time === nextTime && r.taken,
    );

    return (
      <View style={[styles.todayCard, {backgroundColor: colors.card}]}>
        <View style={styles.todayCardHeader}>
          <View style={{flex: 1}}>
            <Text style={[styles.todayMedicineName, {color: colors.text}]}>
              {medicine.name}
            </Text>
            <Text style={[styles.todayTime, {color: colors.textSecondary}]}>
              {nextTime} - {timeRemaining}
            </Text>
          </View>
          {isTaken ? (
            <View style={[styles.takenBadge, {backgroundColor: colors.success}]}>
              <Icon name="check" size={20} color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.takeButton, {backgroundColor: colors.primary}]}
              onPress={() => markAsTaken(medicine.id, nextTime)}>
              <Text style={styles.takeButtonText}>복용</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMedicine = ({item, index}: {item: Medicine; index: number}) => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    };

    return (
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.medicineCard,
            {
              backgroundColor: colors.card,
              borderLeftColor: getCategoryColor(item.category, isDark),
            },
          ]}>
          <View style={styles.medicineHeader}>
            <View style={styles.medicineTopRow}>
              {item.photoUri ? (
                <Image source={{uri: item.photoUri}} style={styles.medicinePhoto} />
              ) : (
                <View
                  style={[
                    styles.medicinePhotoPlaceholder,
                    {backgroundColor: getCategoryColor(item.category, isDark)},
                  ]}>
                  <Icon
                    name={getCategoryIcon(item.category)}
                    size={32}
                    color="#fff"
                  />
                </View>
              )}
              <View style={styles.medicineInfo}>
                <View style={styles.medicineNameRow}>
                  <Text style={[styles.medicineName, {color: colors.text}]}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      {backgroundColor: getCategoryColor(item.category, isDark)},
                    ]}>
                    <Text style={styles.categoryBadgeText}>
                      {getCategoryLabel(item.category)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.medicineDosage, {color: colors.textSecondary}]}>
                  {item.dosage}
                </Text>
                {item.remainingPills !== undefined && (
                  <View style={styles.pillsInfo}>
                    <Icon name="pill" size={14} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.pillsText,
                        {
                          color:
                            item.remainingPills <= 5
                              ? colors.error
                              : colors.textSecondary,
                        },
                      ]}>
                      남은 약: {item.remainingPills}
                      {item.totalPills ? `/${item.totalPills}` : ''}
                    </Text>
                  </View>
                )}
              </View>
              <Switch value={item.isActive} onValueChange={() => toggleMedicine(item)} />
            </View>
          </View>

          <View style={styles.timesContainer}>
            {item.times.map((time, idx) => {
              const timeColor = getTimeBasedColor(time, isDark);
              return (
                <View
                  key={idx}
                  style={[styles.timeChip, {backgroundColor: timeColor + '20'}]}>
                  <Icon name="clock-outline" size={14} color={timeColor} />
                  <Text style={[styles.timeText, {color: timeColor}]}>{time}</Text>
                </View>
              );
            })}
          </View>

          {item.effectiveness && (
            <View style={styles.infoRow}>
              <Icon name="information" size={16} color={colors.info} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {item.effectiveness}
              </Text>
            </View>
          )}

          {item.notes && (
            <Text style={[styles.notes, {color: colors.textSecondary}]} numberOfLines={2}>
              💬 {item.notes}
            </Text>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.editButton, {backgroundColor: colors.primary}]}
              onPress={() => navigation.navigate('AddMedicine', {medicine: item})}>
              <Icon name="pencil" size={16} color="#fff" />
              <Text style={styles.editButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, {backgroundColor: colors.error}]}
              onPress={() => deleteMedicine(item)}>
              <Icon name="delete" size={16} color="#fff" />
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const categories: Array<{key: MedicineCategory | 'all'; label: string; icon: string}> = [
    {key: 'all', label: '전체', icon: 'view-grid'},
    {key: 'prescription', label: '처방약', icon: 'medical-bag'},
    {key: 'otc', label: '일반약', icon: 'pill'},
    {key: 'supplement', label: '영양제', icon: 'bottle-tonic'},
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientHeader: {
      paddingTop: 20,
      paddingBottom: 15,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: '#fff',
      marginLeft: 10,
    },
    categoryContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      gap: 6,
    },
    categoryButtonActive: {
      backgroundColor: '#fff',
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    categoryButtonTextActive: {
      color: colors.primary,
    },
    todaySection: {
      padding: 15,
    },
    todaySectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    todaySectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    todayCard: {
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    todayCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    todayMedicineName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    todayTime: {
      fontSize: 14,
    },
    takeButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    takeButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    takenBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      padding: 15,
    },
    medicineCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 15,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 4,
    },
    medicineHeader: {
      marginBottom: 12,
    },
    medicineTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    medicinePhoto: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginRight: 12,
    },
    medicinePhotoPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    medicineInfo: {
      flex: 1,
    },
    medicineNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },
    medicineName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    categoryBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
    },
    medicineDosage: {
      fontSize: 14,
      marginBottom: 4,
    },
    pillsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    pillsText: {
      fontSize: 13,
      fontWeight: '500',
    },
    timesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
      gap: 8,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    timeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      flex: 1,
    },
    notes: {
      fontSize: 14,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
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
      padding: 40,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>내 약 목록</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Statistics')}>
              <Icon name="chart-bar" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddMedicine')}>
              <Icon name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#fff" />
          <TextInput
            style={styles.searchInput}
            placeholder="약 이름으로 검색..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoryContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryButton,
                selectedCategory === cat.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}>
              <Icon
                name={cat.icon}
                size={16}
                color={
                  selectedCategory === cat.key ? colors.primary : '#fff'
                }
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat.key &&
                    styles.categoryButtonTextActive,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {todaysMedicines.length > 0 && (
        <View style={styles.todaySection}>
          <View style={styles.todaySectionHeader}>
            <Icon name="calendar-today" size={22} color={colors.primary} />
            <Text style={styles.todaySectionTitle}>오늘 복용할 약</Text>
          </View>
          <FlatList
            data={todaysMedicines}
            renderItem={renderTodayMedicine}
            keyExtractor={(item, index) => `today-${item.medicine.id}-${index}`}
            horizontal={false}
          />
        </View>
      )}

      {filteredMedicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="pill-off" size={80} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            {searchQuery
              ? '검색 결과가 없습니다'
              : selectedCategory !== 'all'
              ? `${getCategoryLabel(selectedCategory as MedicineCategory)}이 없습니다`
              : '등록된 약이 없습니다'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchQuery || selectedCategory !== 'all'
              ? '다른 검색어나 카테고리를 시도해보세요'
              : '+ 버튼을 눌러 약을 추가하세요'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedicines}
          renderItem={renderMedicine}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}
