import { Request, ResponseToolkit } from "@hapi/hapi";
import * as publishWeekUsecase from "../../../usecases/publishWeekUsecase";
import { errorHandler } from "../../../shared/functions/error";
import { ICreatePublishWeek, ISuccessResponse } from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";

const logger = moduleLogger("publishWeekController");

export const findByStartDate = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find publish week by start date");
  try {
    const query = req.query as { startDate: string; endDate: string };
    const data = await publishWeekUsecase.findByStartDate(query.startDate, query.endDate);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get publish week successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create publish week");
  try {
    const body = req.payload as ICreatePublishWeek;
    const data = await publishWeekUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create publish week successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

