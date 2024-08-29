import { BookingType, TimeSlots } from './enums';

export const BookingTypeTimeSlots = {
  [BookingType.TYPE1]: [
    TimeSlots.SLOT_10_12,
    TimeSlots.SLOT_12_14,
    TimeSlots.SLOT_14_16,
    TimeSlots.SLOT_16_18,
  ],
  [BookingType.TYPE2]: [
    TimeSlots.SLOT_10_14,
    TimeSlots.SLOT_14_18,
  ],
  [BookingType.TYPE3]: [
    TimeSlots.SLOT_10_18,
  ],
};