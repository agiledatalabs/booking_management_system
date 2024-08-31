import { BookingType, TimeSlots } from './enums';

export const BookingTypeTimeSlots = {
  [BookingType.TWO_HOUR]: [
    TimeSlots.SLOT_10_12,
    TimeSlots.SLOT_12_14,
    TimeSlots.SLOT_14_16,
    TimeSlots.SLOT_16_18,
  ],
  [BookingType.HALF_DAY]: [TimeSlots.SLOT_10_14, TimeSlots.SLOT_14_18],
  [BookingType.FULL_DAY]: [TimeSlots.SLOT_10_18],
};
