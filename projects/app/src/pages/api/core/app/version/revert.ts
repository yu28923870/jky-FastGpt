import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middle/entry';
import { authApp } from '@fastgpt/service/support/permission/auth/app';
import { MongoAppVersion } from '@fastgpt/service/core/app/versionSchema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { beforeUpdateAppFormat } from '@fastgpt/service/core/app/controller';
import { getGuideModule, splitGuideModule } from '@fastgpt/global/core/workflow/utils';
import { getNextTimeByCronStringAndTimezone } from '@fastgpt/global/common/string/time';
import { PostRevertAppProps } from '@/global/core/app/api';

type Response = {};

async function handler(req: NextApiRequest, res: NextApiResponse<any>): Promise<{}> {
  const { appId } = req.query as { appId: string };
  const { editNodes = [], editEdges = [], versionId } = req.body as PostRevertAppProps;

  await authApp({ appId, req, per: 'w', authToken: true });

  const version = await MongoAppVersion.findOne({
    _id: versionId,
    appId
  });

  if (!version) {
    throw new Error('version not found');
  }

  const { nodes: formatEditNodes } = beforeUpdateAppFormat({ nodes: editNodes });

  const { scheduledTriggerConfig } = splitGuideModule(getGuideModule(version.nodes));

  await mongoSessionRun(async (session) => {
    // 为编辑中的数据创建一个版本
    await MongoAppVersion.create(
      [
        {
          appId,
          nodes: formatEditNodes,
          edges: editEdges
        }
      ],
      { session }
    );

    // 为历史版本再创建一个版本
    await MongoAppVersion.create(
      [
        {
          appId,
          nodes: version.nodes,
          edges: version.edges
        }
      ],
      { session }
    );

    // update app
    await MongoApp.findByIdAndUpdate(appId, {
      modules: version.nodes,
      edges: version.edges,
      updateTime: new Date(),
      scheduledTriggerConfig,
      scheduledTriggerNextTime: scheduledTriggerConfig
        ? getNextTimeByCronStringAndTimezone(scheduledTriggerConfig)
        : null
    });
  });

  return {};
}

export default NextAPI(handler);
