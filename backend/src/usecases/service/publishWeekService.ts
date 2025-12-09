import * as publishWeekRepository from "../../database/default/repository/publishWeekRepository";
import { HttpError } from "../../shared/classes/HttpError";
import { ERROR_CODES } from "../../shared/constants/errorCode";

export const checkPublishWeek = async (date: string): Promise<void> => {
  const closestPublishWeek = await publishWeekRepository.findClosestPublishWeek(date);
  if (closestPublishWeek) {
    throw new HttpError(422, "Publish Week Already Published", ERROR_CODES.PUBLISH_WEEK_ALREADY_PUBLISHED);
  }
};