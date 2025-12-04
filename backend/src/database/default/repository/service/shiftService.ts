import { In } from "typeorm";
import Shift from "../../entity/shift";
import { AppDataSource } from "../../..";

/**
 * Checks if a shift crosses midnight (endTime < startTime)
 */
const crossesMidnight = (startTime: string, endTime: string): boolean => {
  return endTime < startTime;
};

/**
 * Normalizes a date to YYYY-MM-DD string format
 * Handles both string dates and Date objects from the database
 */
const normalizeDateToString = (date: string | Date): string => {
  if (date instanceof Date) {
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // If it's already a string, extract just the date part (in case it has time)
  return date.split('T')[0];
};

/**
 * Converts a shift to actual datetime range (start and end as Date objects)
 * Handles midnight-crossing shifts by extending end to next day
 */
const getShiftDateTimeRange = (
  date: string | Date,
  startTime: string,
  endTime: string
): { start: Date; end: Date } => {
  const dateStr = normalizeDateToString(date);
  const startDate = new Date(`${dateStr}T${startTime}`);
  let endDate = new Date(`${dateStr}T${endTime}`);

  // If shift crosses midnight, end time is on the next day
  if (crossesMidnight(startTime, endTime)) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { start: startDate, end: endDate };
};

/**
 * Checks if two datetime ranges overlap
 * Two intervals [A, B] and [C, D] overlap if A < D AND C < B
 * Boundary touches (A == D or C == B) are NOT considered overlaps
 */
const rangesOverlap = (
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean => {
  return range1.start < range2.end && range2.start < range1.end;
};

/**
 * Gets the previous day's date string
 */
const getPreviousDate = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

/**
 * Gets the next day's date string
 */
const getNextDate = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

/**
 * Finds all shifts that overlap with the given shift data.
 * Handles all cases including:
 * - Normal same-day overlaps
 * - Existing shift crosses midnight
 * - New shift crosses midnight
 * - Both shifts cross midnight
 */
export const getOverlappingShifts = async (data: Shift): Promise<Shift[]> => {
  const repository = AppDataSource.getRepository(Shift);

  // Get the datetime range for the new shift
  const newShiftRange = getShiftDateTimeRange(data.date, data.startTime, data.endTime);
  const newCrossesMidnight = crossesMidnight(data.startTime, data.endTime);

  // Determine which dates we need to check for potential overlaps
  // We need to check:
  // 1. Same date - always
  // 2. Previous date - in case an existing shift crosses midnight into our date
  // 3. Next date - if our new shift crosses midnight
  const datesToCheck = [data.date, getPreviousDate(data.date)];
  if (newCrossesMidnight) {
    datesToCheck.push(getNextDate(data.date));
  }

  // Fetch all shifts on relevant dates
  const potentialShifts = await repository.find({
    where: {
      date: In(datesToCheck),
    },
  });

  // Filter to find actual overlaps
  const overlappingShifts = potentialShifts.filter((existingShift) => {
    // Skip if it's the same shift (for update scenarios)
    if (data.id && existingShift.id === data.id) {
      return false;
    }

    const existingRange = getShiftDateTimeRange(
      existingShift.date,
      existingShift.startTime,
      existingShift.endTime
    );

    const overlaps = rangesOverlap(newShiftRange, existingRange);

    return overlaps;
  });

  return overlappingShifts;
};