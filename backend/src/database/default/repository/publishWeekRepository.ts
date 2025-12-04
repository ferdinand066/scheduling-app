import { getRepository } from "typeorm";
import moduleLogger from "../../../shared/functions/logger";
import PublishWeek from "../entity/publishWeek";

const logger = moduleLogger("publishWeekRepository");

export const findByStartDate = async (
  startDate: string,
  endDate: string
): Promise<PublishWeek | null> => {
  logger.info("Find by start date");
  const repository = getRepository(PublishWeek);
  const data = await repository.findOne({
    where: { startDate, endDate },
  });
  return data || null;
};

export const create = async (payload: PublishWeek): Promise<PublishWeek> => {
  logger.info("Create");
  const repository = getRepository(PublishWeek);
  const newData = await repository.save(payload);
  return newData;
};

