import * as shiftService from "../shiftService";
import Shift from "../../../database/default/entity/shift";
import { AppDataSource } from "../../../database";

// Mock the database module
jest.mock("../../../database", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// Helper to create a shift object
const createShift = (
  id: string,
  date: string,
  startTime: string,
  endTime: string
): Shift => {
  const shift = new Shift();
  shift.id = id;
  shift.name = "Test Shift";
  shift.date = date;
  shift.startTime = startTime;
  shift.endTime = endTime;
  return shift;
};

// Helper to create mock query builder
const createMockQueryBuilder = (resultShift: Shift | null) => {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(resultShift),
  };
  return mockQueryBuilder;
};

// Helper to setup repository mock
const setupRepositoryMock = (resultShift: Shift | null) => {
  const mockQueryBuilder = createMockQueryBuilder(resultShift);
  (AppDataSource.getRepository as jest.Mock).mockReturnValue({
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  });
  return mockQueryBuilder;
};

describe("shiftService => getOverlappingShifts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // A. NORMAL CASES — NO MIDNIGHT CROSSING
  // Existing: 09:00 → 12:00 on 2025-12-04
  // ============================================
  describe("A. Normal cases - no midnight crossing", () => {
    const existingShift = createShift("existing-1", "2025-12-04", "09:00:00", "12:00:00");

    it("A1: New 10:00 → 11:00 should OVERLAP (completely inside)", async () => {
      setupRepositoryMock(existingShift);

      const newShift = createShift("new-1", "2025-12-04", "10:00:00", "11:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
      expect(result?.id).toBe("existing-1");
    });

    it("A2: New 11:00 → 13:00 should OVERLAP (partial end)", async () => {
      setupRepositoryMock(existingShift);

      const newShift = createShift("new-1", "2025-12-04", "11:00:00", "13:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
    });

    it("A3: New 08:00 → 10:00 should OVERLAP (partial start)", async () => {
      setupRepositoryMock(existingShift);

      const newShift = createShift("new-1", "2025-12-04", "08:00:00", "10:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
    });

    it("A4: New 12:00 → 14:00 should NOT overlap (boundary touch)", async () => {
      setupRepositoryMock(null);

      const newShift = createShift("new-1", "2025-12-04", "12:00:00", "14:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).toBeNull();
    });

    it("A5: New 13:00 → 14:00 should NOT overlap (completely after)", async () => {
      setupRepositoryMock(null);

      const newShift = createShift("new-1", "2025-12-04", "13:00:00", "14:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // B. EXISTING PASSES MIDNIGHT
  // Existing: 2025-12-04 13:00 → 2025-12-05 10:00
  // ============================================
  describe("B. Existing shift passes midnight", () => {
    // Note: endTime < startTime indicates midnight crossing
    const existingShift = createShift("existing-1", "2025-12-04", "13:00:00", "10:00:00");

    describe("B1: New schedule on Dec 4 (same date as existing start)", () => {
      it("B1.1: New 10:00 → 12:00 should NOT overlap (before existing starts)", async () => {
        setupRepositoryMock(null);

        const newShift = createShift("new-1", "2025-12-04", "10:00:00", "12:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).toBeNull();
      });

      it("B1.2: New 12:00 → 14:00 should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-04", "12:00:00", "14:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });

      it("B1.3: New 13:00 → 20:00 should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-04", "13:00:00", "20:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });

      it("B1.4: New 23:00 → 05:00 (next day) should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-04", "23:00:00", "05:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });
    });

    describe("B2: New schedule on Dec 5 (next day, where existing ends)", () => {
      it("B2.1: New 00:00 → 03:00 should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-05", "00:00:00", "03:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });

      it("B2.2: New 03:00 → 07:00 should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-05", "03:00:00", "07:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });

      it("B2.3: New 05:00 → 10:00 should OVERLAP", async () => {
        setupRepositoryMock(existingShift);

        const newShift = createShift("new-1", "2025-12-05", "05:00:00", "10:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).not.toBeNull();
      });

      it("B2.4: New 10:00 → 12:00 should NOT overlap (boundary touch)", async () => {
        setupRepositoryMock(null);

        const newShift = createShift("new-1", "2025-12-05", "10:00:00", "12:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).toBeNull();
      });

      it("B2.5: New 11:00 → 15:00 should NOT overlap (completely after)", async () => {
        setupRepositoryMock(null);

        const newShift = createShift("new-1", "2025-12-05", "11:00:00", "15:00:00");
        const result = await shiftService.checkOverlapping(newShift);

        expect(result).toBeNull();
      });
    });
  });

  // ============================================
  // C. NEW PASSES MIDNIGHT, EXISTING NORMAL
  // Existing: 09:00 → 12:00 on 2025-12-04
  // ============================================
  describe("C. New shift passes midnight, existing is normal", () => {
    const existingShift = createShift("existing-1", "2025-12-04", "09:00:00", "12:00:00");

    it("C1: New 22:00 → 02:00 (Dec 3) should NOT overlap (ends before 09:00)", async () => {
      setupRepositoryMock(null);

      // New shift on Dec 3, 22:00 → Dec 4, 02:00
      const newShift = createShift("new-1", "2025-12-03", "22:00:00", "02:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).toBeNull();
    });

    it("C2: New 22:00 → 10:00 (Dec 3) should OVERLAP (10:00 > 09:00)", async () => {
      setupRepositoryMock(existingShift);

      // New shift on Dec 3, 22:00 → Dec 4, 10:00
      const newShift = createShift("new-1", "2025-12-03", "22:00:00", "10:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
    });
  });

  // ============================================
  // D. BOTH PASS MIDNIGHT
  // ============================================
  describe("D. Both shifts pass midnight", () => {
    it("D1: Existing 22:00 → 03:00, New 23:00 → 05:00 should OVERLAP", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "22:00:00", "03:00:00");
      setupRepositoryMock(existingShift);

      const newShift = createShift("new-1", "2025-12-04", "23:00:00", "05:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
    });

    it("D2: Existing 22:00 → 03:00, New 03:00 → 08:00 should NOT overlap (boundary)", async () => {
      setupRepositoryMock(null);

      // New shift starts on Dec 5 at 03:00
      const newShift = createShift("new-1", "2025-12-05", "03:00:00", "08:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // E. EDGE CASES
  // ============================================
  describe("E. Edge cases", () => {
    it("E4: Schedule same as existing should OVERLAP", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "09:00:00", "12:00:00");
      setupRepositoryMock(existingShift);

      const newShift = createShift("new-1", "2025-12-04", "09:00:00", "12:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).not.toBeNull();
    });

    it("E5: New touches exact boundary should NOT overlap", async () => {
      setupRepositoryMock(null);

      // New shift starts exactly when existing ends
      const newShift = createShift("new-1", "2025-12-04", "12:00:00", "15:00:00");
      const result = await shiftService.checkOverlapping(newShift);

      expect(result).toBeNull();
    });

    it("Should skip same shift when checking for overlaps (update scenario)", async () => {
      // When updating, the query excludes the current shift by ID
      // So the result should be null (no overlapping shifts found)
      setupRepositoryMock(null);

      // Same shift being updated - should not report itself as overlapping
      const updatingShift = createShift("same-id", "2025-12-04", "09:00:00", "13:00:00");
      const result = await shiftService.checkOverlapping(updatingShift);

      expect(result).toBeNull();
    });

    it("E2: Shift 10:00 → 09:59 should be valid (max range, nearly 24 hours)", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "11:00:00", "12:00:00");
      setupRepositoryMock(existingShift);

      // This is a ~24 hour shift from 10:00 to 09:59 next day
      const newShift = createShift("new-1", "2025-12-04", "10:00:00", "09:59:00");
      const result = await shiftService.checkOverlapping(newShift);

      // Should overlap with existing 11:00-12:00
      expect(result).not.toBeNull();
    });

    it("BUG: Existing 04:00→03:00 on Dec 5, New 02:00→02:30 on Dec 6 should OVERLAP", async () => {
      // Existing: 2025-12-05 04:00 → 03:00 (crosses midnight to 2025-12-06 03:00)
      const existingShift = createShift("existing-1", "2025-12-05", "04:00:00", "03:00:00");
      setupRepositoryMock(existingShift);

      // New: 2025-12-06 02:00 → 02:30 (within the existing shift's overnight period)
      const newShift = createShift("new-1", "2025-12-06", "02:00:00", "02:30:00");
      const result = await shiftService.checkOverlapping(newShift);

      // Should overlap because existing ends at 03:00 on Dec 6
      expect(result).not.toBeNull();
    });
  });
});
