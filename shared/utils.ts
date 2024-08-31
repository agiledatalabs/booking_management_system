// src/utils/getTimeSlots.ts
import { BookingType, TimeSlots } from './enums';
import { BookingTypeTimeSlots } from './types';

export function getTimeSlots(bookingType: BookingType): TimeSlots[] {
  return BookingTypeTimeSlots[bookingType] || [];
}

// src/utils/validationUtils.ts
export const validateRequiredFields = (body: any, requiredFields: string[] | null): string | null => {
  const fieldsToCheck = requiredFields || Object.keys(body);

  for (const field of fieldsToCheck) {
    if (!body.hasOwnProperty(field) || body[field] === undefined || body[field] === null || body[field] === '') {
      return `${field} is required`;
    }
  }
  return null;
};