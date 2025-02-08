import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middle/entry';
import { MongoChatItem } from '@fastgpt/service/core/chat/chatItemSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { ExportAppLogsListItemType } from '@/types/log';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { addDays } from 'date-fns';
import { GetAllChatLogsParams } from '@/global/core/api/appReq';
import { Types } from '@fastgpt/service/common/mongo';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ExportAppLogsListItemType[]> {
  const {
    teamId,
    dateStart = addDays(new Date(), -7),
    dateEnd = new Date()
  } = req.body as GetAllChatLogsParams;

  const datas: ExportAppLogsListItemType[] = [];

  const where = {
    teamId: new Types.ObjectId(teamId),
    time: {
      $gte: new Date(dateStart),
      $lte: new Date(dateEnd)
    }
  };

  const chatItems = await MongoChatItem.aggregate([{ $match: where }]).sort({
    appId: 'asc',
    chatId: 'asc',
    time: 'asc',
    obj: 'desc'
  });

  for (let i = 0; i < chatItems.length; i++) {
    const tmb = await MongoTeamMember.findById(chatItems[i].tmbId);

    const team = await MongoTeam.findById(tmb?.teamId);

    const user = await MongoUser.findById(tmb?.userId);

    const app = await MongoApp.findById(chatItems[i].appId);

    let arr = {
      appId: chatItems[i].appId,
      appName: app!.name,
      teamId: tmb!.teamId,
      teamName: team!.name,
      chatId: chatItems[i].chatId,
      userId: tmb!.userId,
      userName: user!.username,
      role: chatItems[i].obj,
      time: chatItems[i].time,
      content: chatItems[i].value[0]?.text.content || '',
      // @ts-ignore
      userGoodFeedback: chatItems[i].userGoodFeedback,
      // @ts-ignore
      userBadFeedback: chatItems[i].userBadFeedback
    };

    datas.push(arr);
  }
  return datas;
}

export default NextAPI(handler);
