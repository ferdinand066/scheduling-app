import { In } from "typeorm";
import Shift from "../../database/default/entity/shift";
import { AppDataSource } from "../../database";

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


/**
 * Checks for overlapping shifts purely at the database level.
 * Returns the first overlapping shift if found, null otherwise.
 * 
 * Uses PostgreSQL datetime arithmetic to calculate actual time ranges
 * and checks overlap directly in SQL for better performance.
 */
export const checkOverlapping = async (data: Shift): Promise<Shift | null> => {
  const repository = AppDataSource.getRepository(Shift);
  const newCrossesMidnight = crossesMidnight(data.startTime, data.endTime);
  
  // Determine which dates to check for potential overlaps
  const datesToCheck = [data.date, getPreviousDate(data.date)];
  if (newCrossesMidnight) {
    datesToCheck.push(getNextDate(data.date));
  }

  // Build query that calculates datetime ranges and checks overlap in SQL
  const queryBuilder = repository.createQueryBuilder("shift")
    .where("shift.date IN (:...dates)", { dates: datesToCheck });

  // Exclude current shift if updating
  if (data.id) {
    queryBuilder.andWhere("shift.id != :id", { id: data.id });
  }

  // Calculate actual datetime ranges in SQL and check for overlap
  // new_start < existing_end AND existing_start < new_end
  queryBuilder.andWhere(`
    (
      -- Calculate new shift's actual start datetime
      (:newDate::date + :newStartTime::time)
      <
      -- Calculate existing shift's actual end datetime (handles midnight crossing)
      CASE 
        WHEN shift."endTime" < shift."startTime" 
        THEN (shift.date + INTERVAL '1 day' + shift."endTime")
        ELSE (shift.date + shift."endTime")
      END
    )
    AND
    (
      -- Calculate existing shift's actual start datetime
      (shift.date + shift."startTime")
      <
      -- Calculate new shift's actual end datetime (handles midnight crossing)
      CASE 
        WHEN :newEndTime::time < :newStartTime::time 
        THEN (:newDate::date + INTERVAL '1 day' + :newEndTime::time)
        ELSE (:newDate::date + :newEndTime::time)
      END
    )
  `, {
    newDate: data.date,
    newStartTime: data.startTime,
    newEndTime: data.endTime,
  });

  // Return only the first overlapping shift (limit 1 for performance)
  queryBuilder.limit(1);

  const result = await queryBuilder.getOne();
  return result ?? null;
};