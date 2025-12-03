import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {LineChart, BarChart, ProgressChart} from 'react-native-chart-kit';
import {storageService} from '../services/storageService';
import {DailyIntakeSummary} from '../types/Medicine';
import {useTheme} from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export const StatisticsScreen = () => {
  const {colors, isDark} = useTheme();
  const [summaries, setSummaries] = useState<DailyIntakeSummary[]>([]);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    const data = await storageService.getDailyIntakeSummary(period);
    setSummaries(data);
    setLoading(false);
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const complianceData = {
    labels: summaries.map(s => {
      const date = new Date(s.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: summaries.map(s => s.percentage),
        color: (opacity = 1) => colors.success,
        strokeWidth: 2,
      },
    ],
  };

  const intakeData = {
    labels: summaries.map(s => {
      const date = new Date(s.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: summaries.map(s => s.takenMedicines),
        color: (opacity = 1) => colors.primary,
      },
    ],
  };

  const averageCompliance =
    summaries.length > 0
      ? summaries.reduce((sum, s) => sum + s.percentage, 0) / summaries.length
      : 0;

  const totalTaken = summaries.reduce((sum, s) => sum + s.takenMedicines, 0);
  const totalMissed = summaries.reduce((sum, s) => sum + s.missedMedicines, 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    periodSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    periodButtonTextActive: {
      color: '#FFFFFF',
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    complianceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.success,
      textAlign: 'center',
      marginVertical: 10,
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 15,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={styles.emptyText}>통계를 불러오는 중...</Text>
      </View>
    );
  }

  if (summaries.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.header}>복용 통계</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              아직 복용 기록이 없습니다.{'\n'}약을 복용하고 기록을 시작하세요!
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.header}>복용 통계</Text>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 7 && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(7)}>
            <Text
              style={[
                styles.periodButtonText,
                period === 7 && styles.periodButtonTextActive,
              ]}>
              7일
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 14 && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(14)}>
            <Text
              style={[
                styles.periodButtonText,
                period === 14 && styles.periodButtonTextActive,
              ]}>
              14일
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 30 && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(30)}>
            <Text
              style={[
                styles.periodButtonText,
                period === 30 && styles.periodButtonTextActive,
              ]}>
              30일
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>전체 요약</Text>
          <Text style={styles.complianceValue}>
            {averageCompliance.toFixed(1)}%
          </Text>
          <Text style={[styles.summaryLabel, {textAlign: 'center', marginBottom: 20}]}>
            평균 복용률
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총 복용</Text>
            <Text style={[styles.summaryValue, {color: colors.success}]}>
              {totalTaken}회
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>미복용</Text>
            <Text style={[styles.summaryValue, {color: colors.error}]}>
              {totalMissed}회
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>복용률 추이</Text>
          <LineChart
            data={complianceData}
            width={screenWidth - 70}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            withDots={true}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            segments={4}
          />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>일별 복용 횟수</Text>
          <BarChart
            data={intakeData}
            width={screenWidth - 70}
            height={220}
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero={true}
            showValuesOnTopOfBars={true}
          />
        </View>
      </ScrollView>
    </View>
  );
};
