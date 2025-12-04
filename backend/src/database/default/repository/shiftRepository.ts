import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
} from "typeorm";
import { HttpError } from "../../../shared/classes/HttpError";
import { ERROR_CODES } from "../../../shared/constants/errorCode";
import moduleLogger from "../../../shared/functions/logger";
import Shift from "../entity/shift";
import { getOverlappingShifts } from "./service/shiftService";
import { AppDataSource } from "../..";

const logger = moduleLogger("shiftRepository");

export const find = async (opts?: FindManyOptions<Shift>): Promise<Shift[]> => {
  logger.info("Find");
  const repository = AppDataSource.getRepository(Shift);
  const data = await repository.find(opts);
  return data;
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find by id");
  const repository = AppDataSource.getRepository(Shift);
  const data = await repository.findOne({
    where: { id },
    ...opts,
  });
  return data;
};

export const findOne = async (
  where?: FindOptionsWhere<Shift>,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find one");
  const repository = AppDataSource.getRepository(Shift);
  const data = await repository.findOne({
    where,
    ...opts,
  });
  return data;
};

export const create = async (payload: Shift, force: boolean = false): Promise<Shift> => {
  logger.info("Create");
  const repository = AppDataSource.getRepository(Shift);

  if (!force) {
    const overlappingShifts = await getOverlappingShifts(payload);

    if (overlappingShifts.length > 0) {
      throw new HttpError(422, "Shift Clash Warning", ERROR_CODES.SHIFT_CLASH, overlappingShifts);
    }
  }

  const newdata = await repository.save(payload);
  return newdata;
};

export const updateById = async (
  id: string,
  payload: Shift,
  force: boolean = false
): Promise<Shift> => {
  logger.info("Update by id");
  const repository = AppDataSource.getRepository(Shift);

  if (!force) {
    const overlappingShifts = (await getOverlappingShifts(payload)).filter((shift) => shift.id !== id);

    if (overlappingShifts.length > 0) {
      throw new HttpError(422, "Shift Clash Warning", ERROR_CODES.SHIFT_CLASH, overlappingShifts);
    }
  }
  
  await repository.update(id, payload);
  return findById(id);
};

export const deleteById = async (
  id: string | string[]
): Promise<DeleteResult> => {
  logger.info("Delete by id");
  const repository = AppDataSource.getRepository(Shift);
  return await repository.delete(id);
};
