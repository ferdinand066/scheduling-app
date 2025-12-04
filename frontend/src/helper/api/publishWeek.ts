import { getAxiosInstance } from ".";

export interface PublishWeek {
  id: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export const getPublishWeek = async (startDate: string, endDate: string): Promise<PublishWeek | null> => {
  const api = getAxiosInstance();
  const { data } = await api.get(`/publish-weeks?startDate=${startDate}&endDate=${endDate}`);
  return data.results;
};

export const createPublishWeek = async (startDate: string, endDate: string): Promise<PublishWeek> => {
  const api = getAxiosInstance();
  const { data } = await api.post("/publish-weeks", { startDate, endDate });
  return data.results;
};

