export type ExportAppLogsListItemType = {
  appId: string;
  appName: string;
  teamId: string;
  teamName: string;
  chatId: string;
  userId: string;
  userName: string;
  role: string;
  time: Date;
  content: string;
  userGoodFeedback?: string;
  userBadFeedback?: string;
};
