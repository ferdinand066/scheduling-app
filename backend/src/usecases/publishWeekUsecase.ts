import * as publishWeekRepository from "../database/default/repository/publishWeekRepository";
import PublishWeek from "../database/default/entity/publishWeek";
import { ICreatePublishWeek } from "../shared/interfaces";

export const findByStartDate = async (
  startDate: string,
  endDate: string
): Promise<PublishWeek | null> => {
  return publishWeekRepository.findByStartDate(startDate, endDate);
};

export const create = async (payload: ICreatePublishWeek): Promise<PublishWeek> => {
  const publishWeek = new PublishWeek();
  publishWeek.startDate = payload.startDate;
  publishWeek.endDate = payload.endDate;

  return publishWeekRepository.create(publishWeek);
};

