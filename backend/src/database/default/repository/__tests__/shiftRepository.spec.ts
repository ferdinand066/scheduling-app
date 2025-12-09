import * as shiftRepository from "../shiftRepository";
import Shift from "../../entity/shift";
import { AppDataSource } from "../../..";

// Mock the database module
jest.mock("../../..", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("shiftRepository => find", () => {
  it("find => passed", async () => {
    const expectedData = new Shift();
    expectedData.name = "Test Shift";
    expectedData.date = "2020-11-15";
    expectedData.startTime = "00:00:00";
    expectedData.endTime = "04:00:00";

    const mockFind = jest.fn().mockResolvedValue([expectedData]);
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      find: mockFind,
    });

    const result = await shiftRepository.find();

    expect(result).toEqual([expectedData]);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(Shift);
    expect(mockFind).toHaveBeenCalledTimes(1);
  });
});

describe("shiftRepository => findById", () => {
  it("findById => passed", async () => {
    const id = "0000-0000-000-000";

    const expectedData = new Shift();
    expectedData.id = id;
    expectedData.name = "Test Shift";
    expectedData.date = "2020-11-15";
    expectedData.startTime = "00:00:00";
    expectedData.endTime = "04:00:00";

    const mockFindOne = jest.fn().mockResolvedValue(expectedData);
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      findOne: mockFindOne,
    });

    const result = await shiftRepository.findById(id);

    expect(result).toEqual(expectedData);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(Shift);
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id } });
  });
});

describe("shiftRepository => findOne", () => {
  it("findOne => passed", async () => {
    const id = "0000-0000-000-000";

    const expectedData = new Shift();
    expectedData.id = id;
    expectedData.name = "Test Shift";
    expectedData.date = "2020-11-15";
    expectedData.startTime = "00:00:00";
    expectedData.endTime = "04:00:00";

    const mockFindOne = jest.fn().mockResolvedValue(expectedData);
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      findOne: mockFindOne,
    });

    const result = await shiftRepository.findOne({
      id: id,
    });

    expect(result).toEqual(expectedData);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(Shift);
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id } });
  });
});

describe("shiftRepository => create", () => {
  it("create => passed", async () => {
    const payload = new Shift();
    payload.name = "Test Shift";
    payload.date = "2020-11-15";
    payload.startTime = "00:00:00";
    payload.endTime = "04:00:00";

    const expectedResult = {
      id: "0000-0000-0000-0000",
      name: "Test Shift",
      date: "2020-11-15",
      startTime: "00:00:00",
      endTime: "04:00:00",
    };

    const mockSave = jest.fn().mockResolvedValue(expectedResult);
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      find: jest.fn().mockResolvedValue([]),
      save: mockSave,
    });

    const result = await shiftRepository.create(payload);

    expect(result).toEqual(expectedResult);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(Shift);
    expect(mockSave).toHaveBeenCalledWith(payload);
  });
});
