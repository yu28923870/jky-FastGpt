import { RequestPaging } from '@/types';

export type GetAppChatLogsParams = RequestPaging & {
  appId: string;
  dateStart: Date;
  dateEnd: Date;
};

export type GetChatLogsParams = {
  appId: string;
  dateStart: Date;
  dateEnd: Date;
};

export type GetAllChatLogsParams = {
  teamId: string;
  dateStart: Date;
  dateEnd: Date;
};
