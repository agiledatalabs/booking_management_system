// src/types/enums.ts
export enum BookingType {
  TYPE1 = '2 Hour',
  TYPE2 = 'Half Day',
  TYPE3 = 'Full Day',
}

export enum TimeSlots {
  SLOT_10_12 = '10:00-12:00',
  SLOT_12_14 = '12:00-14:00',
  SLOT_14_16 = '14:00-16:00',
  SLOT_16_18 = '16:00-18:00',
  SLOT_10_14 = '10:00-14:00',
  SLOT_14_18 = '14:00-18:00',
  SLOT_10_18 = '10:00-18:00',
}

export enum UserTypes {
  ADMIN = "admin",
  INTERNAL = "internal",
  EXTERNAL = "external"
}