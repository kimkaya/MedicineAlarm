import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import {Medicine} from '../types/Medicine';

export const notificationService = {
  async initialize() {
    try {
      const settings = await notifee.requestPermission();
      console.log('알림 권한 상태:', settings);

      await notifee.createChannel({
        id: 'medicine-alarm',
        name: 'Medicine Alarms',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
      console.log('알림 채널 생성 완료');
    } catch (error) {
      console.error('알림 초기화 오류:', error);
      throw new Error('알림 권한을 설정할 수 없습니다. 설정에서 알림 권한을 허용해주세요.');
    }
  },

  async scheduleAlarms(medicine: Medicine) {
    if (!medicine.isActive) {
      return;
    }

    for (const time of medicine.times) {
      const [hour, minute] = time.split(':').map(Number);
      const notificationDate = new Date();
      notificationDate.setHours(hour, minute, 0, 0);

      if (notificationDate.getTime() < Date.now()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationDate.getTime(),
        repeatFrequency: 'daily',
      };

      await notifee.createTriggerNotification(
        {
          id: `${medicine.id}-${time}`,
          title: '약 복용 시간',
          body: `${medicine.name} ${medicine.dosage}를 복용하세요`,
          android: {
            channelId: 'medicine-alarm',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            sound: 'default',
          },
        },
        trigger,
      );
    }
  },

  async cancelAlarms(medicineId: string, times: string[]) {
    for (const time of times) {
      await notifee.cancelNotification(`${medicineId}-${time}`);
    }
  },

  async cancelAllAlarmsForMedicine(medicine: Medicine) {
    await this.cancelAlarms(medicine.id, medicine.times);
  },

  async updateAlarms(medicine: Medicine) {
    await this.cancelAllAlarmsForMedicine(medicine);

    if (medicine.isActive) {
      await this.scheduleAlarms(medicine);
    }
  },
};
