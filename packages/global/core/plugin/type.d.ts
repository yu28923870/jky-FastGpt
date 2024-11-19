import { StoreEdgeItemType } from 'core/workflow/type/edge';
import { ModuleTemplateTypeEnum } from '../workflow/constants';
import type { FlowModuleTemplateType, StoreNodeItemType } from '../workflow/type';
import { PluginSourceEnum, PluginTypeEnum } from './constants';
import { MethodType } from './controller';

export type PluginItemSchema = {
  _id: string;
  userId: string;
  teamId: string;
  tmbId: string;
  name: string;
  avatar: string;
  intro: string;
  updateTime: Date;
  modules: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  parentId: string;
  type: `${PluginTypeEnum}`;
  metadata?: {
    pluginUid?: string;
    apiSchemaStr?: string;
    customHeaders?: string;
  };
  version?: 'v1' | 'v2';
};

/* plugin template */
export type PluginTemplateType = PluginRuntimeType & {
  author?: string;
  id: string;
  source: `${PluginSourceEnum}`;
  templateType: FlowNodeTemplateType['templateType'];
  intro: string;
};

export type PluginRuntimeType = {
  teamId?: string;
  name: string;
  avatar: string;
  showStatus?: boolean;
  isTool?: boolean;
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
};
