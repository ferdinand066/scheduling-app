import { Equal, getRepository, LessThan, MoreThan } from "typeorm";
import Shift from "../../entity/shift";

export const getOverlappingShifts = async (data: Shift): Promise<Shift[]> => {
  const repository = getRepository(Shift);
  
  const overlappingShifts = await repository.find({
    where: {
      date: Equal(data.date),
      startTime: LessThan(data.endTime),
      endTime: MoreThan(data.startTime),
    },
  });
  return overlappingShifts;
};