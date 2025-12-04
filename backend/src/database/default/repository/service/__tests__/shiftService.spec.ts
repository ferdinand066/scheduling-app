import * as typeorm from "typeorm";
import Shift from "../../../entity/shift";
import { getOverlappingShifts } from "../shiftService";

jest.mock("typeorm", () => {
  return {
    __esModule: true,
    ...(jest.requireActual("typeorm") as typeof typeorm),
  };
});

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
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "10:00:00", "11:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("existing-1");
    });

    it("A2: New 11:00 → 13:00 should OVERLAP (partial end)", async () => {
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "11:00:00", "13:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
    });

    it("A3: New 08:00 → 10:00 should OVERLAP (partial start)", async () => {
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "08:00:00", "10:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
    });

    it("A4: New 12:00 → 14:00 should NOT overlap (boundary touch)", async () => {
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "12:00:00", "14:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(0);
    });

    it("A5: New 13:00 → 14:00 should NOT overlap (completely after)", async () => {
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "13:00:00", "14:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(0);
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
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-04", "10:00:00", "12:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(0);
      });

      it("B1.2: New 12:00 → 14:00 should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-04", "12:00:00", "14:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });

      it("B1.3: New 13:00 → 20:00 should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-04", "13:00:00", "20:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });

      it("B1.4: New 23:00 → 05:00 (next day) should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-04", "23:00:00", "05:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });
    });

    describe("B2: New schedule on Dec 5 (next day, where existing ends)", () => {
      it("B2.1: New 00:00 → 03:00 should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-05", "00:00:00", "03:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });

      it("B2.2: New 03:00 → 07:00 should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-05", "03:00:00", "07:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });

      it("B2.3: New 05:00 → 10:00 should OVERLAP", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-05", "05:00:00", "10:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(1);
      });

      it("B2.4: New 10:00 → 12:00 should NOT overlap (boundary touch)", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-05", "10:00:00", "12:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(0);
      });

      it("B2.5: New 11:00 → 15:00 should NOT overlap (completely after)", async () => {
        jest.spyOn(typeorm, "getRepository").mockReturnValue({
          find: jest.fn().mockResolvedValue([existingShift]),
        } as any);

        const newShift = createShift("new-1", "2025-12-05", "11:00:00", "15:00:00");
        const result = await getOverlappingShifts(newShift);

        expect(result).toHaveLength(0);
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
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // New shift on Dec 3, 22:00 → Dec 4, 02:00
      const newShift = createShift("new-1", "2025-12-03", "22:00:00", "02:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(0);
    });

    it("C2: New 22:00 → 10:00 (Dec 3) should OVERLAP (10:00 > 09:00)", async () => {
      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // New shift on Dec 3, 22:00 → Dec 4, 10:00
      const newShift = createShift("new-1", "2025-12-03", "22:00:00", "10:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
    });
  });

  // ============================================
  // D. BOTH PASS MIDNIGHT
  // ============================================
  describe("D. Both shifts pass midnight", () => {
    it("D1: Existing 22:00 → 03:00, New 23:00 → 05:00 should OVERLAP", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "22:00:00", "03:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "23:00:00", "05:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
    });

    it("D2: Existing 22:00 → 03:00, New 03:00 → 08:00 should NOT overlap (boundary)", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "22:00:00", "03:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // New shift starts on Dec 5 at 03:00
      const newShift = createShift("new-1", "2025-12-05", "03:00:00", "08:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(0);
    });
  });

  // ============================================
  // E. EDGE CASES
  // ============================================
  describe("E. Edge cases", () => {
    it("E4: Schedule same as existing should OVERLAP", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "09:00:00", "12:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      const newShift = createShift("new-1", "2025-12-04", "09:00:00", "12:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(1);
    });

    it("E5: New touches exact boundary should NOT overlap", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "09:00:00", "12:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // New shift starts exactly when existing ends
      const newShift = createShift("new-1", "2025-12-04", "12:00:00", "15:00:00");
      const result = await getOverlappingShifts(newShift);

      expect(result).toHaveLength(0);
    });

    it("Should skip same shift when checking for overlaps (update scenario)", async () => {
      const existingShift = createShift("same-id", "2025-12-04", "09:00:00", "12:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // Same shift being updated - should not report itself as overlapping
      const updatingShift = createShift("same-id", "2025-12-04", "09:00:00", "13:00:00");
      const result = await getOverlappingShifts(updatingShift);

      expect(result).toHaveLength(0);
    });

    it("E2: Shift 10:00 → 09:59 should be valid (max range, nearly 24 hours)", async () => {
      const existingShift = createShift("existing-1", "2025-12-04", "11:00:00", "12:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // This is a ~24 hour shift from 10:00 to 09:59 next day
      const newShift = createShift("new-1", "2025-12-04", "10:00:00", "09:59:00");
      const result = await getOverlappingShifts(newShift);

      // Should overlap with existing 11:00-12:00
      expect(result).toHaveLength(1);
    });

    it("BUG: Existing 04:00→03:00 on Dec 5, New 02:00→02:30 on Dec 6 should OVERLAP", async () => {
      // Existing: 2025-12-05 04:00 → 03:00 (crosses midnight to 2025-12-06 03:00)
      const existingShift = createShift("existing-1", "2025-12-05", "04:00:00", "03:00:00");

      jest.spyOn(typeorm, "getRepository").mockReturnValue({
        find: jest.fn().mockResolvedValue([existingShift]),
      } as any);

      // New: 2025-12-06 02:00 → 02:30 (within the existing shift's overnight period)
      const newShift = createShift("new-1", "2025-12-06", "02:00:00", "02:30:00");
      const result = await getOverlappingShifts(newShift);

      // Should overlap because existing ends at 03:00 on Dec 6
      expect(result).toHaveLength(1);
    });
  });
});

