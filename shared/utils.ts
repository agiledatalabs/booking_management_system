// src/utils/getTimeSlots.ts
import { BookingType, TimeSlots } from './enums';
import { BookingTypeTimeSlots } from './types';

export function getTimeSlots(bookingType: BookingType): TimeSlots[] {
  return BookingTypeTimeSlots[bookingType] || [];
}