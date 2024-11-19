import { MongoPlugin } from './schema';
import { FlowNodeTemplateType } from '@fastgpt/global/core/workflow/type/index.d';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { pluginData2FlowNodeIO } from '@fastgpt/global/core/workflow/utils';
import { PluginSourceEnum } from '@fastgpt/global/core/plugin/constants';
import type { PluginRuntimeType, PluginTemplateType } from '@fastgpt/global/core/plugin/type.d';
import { FlowNodeTemplateTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { getHandleConfig } from '../../../global/core/workflow/template/utils';
import { getNanoid } from '@fastgpt/global/common/string/tools';

/* 
  plugin id rule:
  personal: id
  community: community-id
  commercial: commercial-id
*/

export async function splitCombinePluginId(id: string) {
  const splitRes = id.split('-');
  if (splitRes.length === 1) {
    return {
      source: PluginSourceEnum.personal,
      pluginId: id
    };
  }

  const [source, pluginId] = id.split('-') as [`${PluginSourceEnum}`, string];
  if (!source || !pluginId) return Promise.reject('pluginId not found');

  return { source, pluginId: id };
}

const getPluginTemplateById = async (id: string): Promise<PluginTemplateType> => {
  const { source, pluginId } = await splitCombinePluginId(id);
  if (source === PluginSourceEnum.community) {
    const item = global.communityPlugins?.find((plugin) => plugin.id === pluginId);
    if (!item) return Promise.reject('plugin not found');

    return item;
  }
  if (source === PluginSourceEnum.personal) {
    const item = await MongoPlugin.findById(id).lean();
    if (!item) return Promise.reject('plugin not found');
    return {
      id: String(item._id),
      teamId: String(item.teamId),
      name: item.name,
      avatar: item.avatar,
      intro: item.intro,
      showStatus: true,
      source: PluginSourceEnum.personal,
      nodes: item.modules,
      edges: item.edges,
      templateType: FlowNodeTemplateTypeEnum.personalPlugin,
      isTool: true
    };
  }
  return Promise.reject('plugin not found');
};

/* format plugin modules to plugin preview module */
export async function getPluginPreviewNode({ id }: { id: string }): Promise<FlowNodeTemplateType> {
  const plugin = await getPluginTemplateById(id);

  return {
    id: getNanoid(),
    pluginId: plugin.id,
    templateType: plugin.templateType,
    flowNodeType: FlowNodeTypeEnum.pluginModule,
    avatar: plugin.avatar,
    name: plugin.name,
    intro: plugin.intro,
    showStatus: plugin.showStatus,
    isTool: plugin.isTool,
    sourceHandle: getHandleConfig(true, true, true, true),
    targetHandle: getHandleConfig(true, true, true, true),
    ...pluginData2FlowNodeIO(plugin.nodes)
  };
}

/* run plugin time */
export async function getPluginRuntimeById(id: string): Promise<PluginRuntimeType> {
  const plugin = await getPluginTemplateById(id);

  return {
    teamId: plugin.teamId,
    name: plugin.name,
    avatar: plugin.avatar,
    showStatus: plugin.showStatus,
    nodes: plugin.nodes,
    edges: plugin.edges
  };
}
