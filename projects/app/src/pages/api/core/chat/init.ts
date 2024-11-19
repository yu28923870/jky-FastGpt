import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authApp } from '@fastgpt/service/support/permission/auth/app';
import { getGuideModule, replaceAppChatConfig } from '@fastgpt/global/core/workflow/utils';
import { getChatModelNameListByModules } from '@/service/core/app/workflow';
import type { InitChatProps, InitChatResponse } from '@/global/core/chat/api.d';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { getChatItems } from '@fastgpt/service/core/chat/controller';
import { ChatErrEnum } from '@fastgpt/global/common/error/code/chat';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/workflow/runtime/constants';
import { getAppLatestVersion } from '@fastgpt/service/core/app/controller';
import { NextAPI } from '@/service/middle/entry';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<InitChatResponse | void> {
  let { appId, chatId, loadCustomFeedbacks } = req.query as InitChatProps;

  if (!appId) {
    return jsonRes(res, {
      code: 501,
      message: "You don't have an app yet"
    });
  }

  // auth app permission
  const [{ app, tmbId }, chat] = await Promise.all([
    authApp({
      req,
      authToken: true,
      appId,
      per: 'r'
    }),
    chatId ? MongoChat.findOne({ appId, chatId }) : undefined
  ]);

  // auth chat permission
  if (chat && !app.canWrite && String(tmbId) !== String(chat?.tmbId)) {
    throw new Error(ChatErrEnum.unAuthChat);
  }

  // get app and history
  const [{ history }, { nodes }] = await Promise.all([
    getChatItems({
      appId,
      chatId,
      limit: 30,
      field: `dataId obj value adminFeedback userBadFeedback userGoodFeedback ${
        DispatchNodeResponseKeyEnum.nodeResponse
      } ${loadCustomFeedbacks ? 'customFeedbacks' : ''}`
    }),
    getAppLatestVersion(app._id, app)
  ]);

  return {
    chatId,
    appId,
    title: chat?.title || '新对话',
    userAvatar: undefined,
    variables: chat?.variables || {},
    history,
    app: {
      userGuideModule: replaceAppChatConfig({
        node: getGuideModule(nodes),
        variableList: chat?.variableList,
        welcomeText: chat?.welcomeText
      }),
      chatModels: getChatModelNameListByModules(nodes),
      name: app.name,
      avatar: app.avatar,
      intro: app.intro
    }
  };
}

export default NextAPI(handler);

export const config = {
  api: {
    responseLimit: '10mb'
  }
};
