import moment from 'moment';

import { forceLogout } from './auth';
import { StorageKeys } from './enum';

export interface DurationTime {
  days: number;
  hours: number;
  milliseconds: number;
  minutes: number;
  months: number;
  seconds: number;
  years: number;
}
export const formatDurationTime = (durationTime: string | number) => {
  return moment.duration(durationTime, 'second')['_data'] as DurationTime;
};

export const checkAccountPermission = async () => {
  const token = localStorage.getItem(StorageKeys.SESSION_KEY);
  if (!token) {
    forceLogout();
  }
};

export const uniqueArr = (arr: [any]) => [...new Set(arr)];

export const getFormatDate = (dateInput) => {
  const date = new Date(dateInput);

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // timeZone: 'UTC',
  };

  const formattedDate = date.toLocaleString('en-US', options as any);
  return formattedDate;
};
