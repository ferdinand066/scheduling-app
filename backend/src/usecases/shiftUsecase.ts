import * as shiftRepository from "../database/default/repository/shiftRepository";

import { FindManyOptions, FindOneOptions } from "typeorm";
import Shift from "../database/default/entity/shift";
import { ICreateShift, IUpdateShift } from "../shared/interfaces";
import * as publishWeekService from "./service/publishWeekService";
import * as shiftService from "./service/shiftService";
import { HttpError } from "../shared/classes/HttpError";
import { ERROR_CODES } from "../shared/constants/errorCode";

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift | null> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift | null> => {
  await publishWeekService.checkPublishWeek(payload.date);
  const shift = new Shift();

  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;

  if (!payload.force) {
    const overlappingShifts = await shiftService.getOverlappingShifts(shift);
    if (overlappingShifts.length > 0) {
      throw new HttpError(422, "Shift Clash Warning", ERROR_CODES.SHIFT_CLASH, overlappingShifts);
    }
  }

  return shiftRepository.create(shift);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift | null> => {
  await publishWeekService.checkPublishWeek(payload.date ?? "");
  const shift = new Shift();

  shift.name = payload.name ?? "";
  shift.date = payload.date ?? "";
  shift.startTime = payload.startTime ?? "";
  shift.endTime = payload.endTime ?? "";

  if (!payload.force) {
    const overlappingShifts = await shiftService.getOverlappingShifts(shift);
    if (overlappingShifts.length > 0) {
      throw new HttpError(422, "Shift Clash Warning", ERROR_CODES.SHIFT_CLASH, overlappingShifts);
    }
  }

  return shiftRepository.updateById(id, shift);
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};
