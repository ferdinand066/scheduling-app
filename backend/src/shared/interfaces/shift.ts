export interface ICreateShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  force?: boolean;
}

export interface IUpdateShift {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  weekId? : string;
}