import type { FlowNodeTemplateType, StoreNodeItemType } from '../workflow/type';

import { AppTypeEnum } from './constants';
import { PermissionTypeEnum } from '../../support/permission/constant';
import { VariableInputEnum } from '../workflow/constants';
import { SelectedDatasetType } from '../workflow/api';
import { DatasetSearchModeEnum } from '../dataset/constants';
import { TeamTagSchema as TeamTagsSchemaType } from '@fastgpt/global/support/user/team/type.d';
import { StoreEdgeItemType } from '../workflow/type/edge';

export interface AppSchema {
  _id: string;
  teamId: string;
  tmbId: string;
  name: string;
  type: `${AppTypeEnum}`;
  version?: 'v1' | 'v2';
  avatar: string;
  intro: string;
  updateTime: number;

  modules: StoreNodeItemType[];
  edges: StoreEdgeItemType[];

  // App system config
  scheduledTriggerConfig?: AppScheduledTriggerConfigType | null;
  scheduledTriggerNextTime?: Date;

  permission: `${PermissionTypeEnum}`;
  inited?: boolean;
  teamTags: string[];
}

export type AppListItemType = {
  _id: string;
  name: string;
  avatar: string;
  intro: string;
  isOwner: boolean;
  permission: `${PermissionTypeEnum}`;
};

export type AppDetailType = AppSchema & {
  isOwner: boolean;
  canWrite: boolean;
};

export type AppSimpleEditFormType = {
  // templateId: string;
  aiSettings: {
    model: string;
    systemPrompt?: string | undefined;
    temperature: number;
    maxToken: number;
    isResponseAnswerText: boolean;
    maxHistories: number;
  };
  dataset: {
    datasets: SelectedDatasetType;
    searchMode: `${DatasetSearchModeEnum}`;
    similarity?: number;
    limit?: number;
    usingReRank?: boolean;
    datasetSearchUsingExtensionQuery?: boolean;
    datasetSearchExtensionModel?: string;
    datasetSearchExtensionBg?: string;
  };
  selectedTools: FlowNodeTemplateType[];
  userGuide: {
    welcomeText: string;
    variables: {
      id: string;
      key: string;
      label: string;
      type: `${VariableInputEnum}`;
      required: boolean;
      maxLen: number;
      enums: {
        value: string;
      }[];
    }[];
    questionGuide: boolean;
    tts: {
      type: 'none' | 'web' | 'model';
      model?: string | undefined;
      voice?: string | undefined;
      speed?: number | undefined;
    };
    whisper: AppWhisperConfigType;
    scheduleTrigger: AppScheduledTriggerConfigType | null;
  };
};

/* app function config */
export type SettingAIDataType = {
  model: string;
  temperature: number;
  maxToken: number;
  isResponseAnswerText?: boolean;
  maxHistories?: number;
};

// variable
export type VariableItemType = {
  id: string;
  key: string;
  label: string;
  type: `${VariableInputEnum}`;
  required: boolean;
  maxLen: number;
  enums: { value: string }[];
};
// tts
export type AppTTSConfigType = {
  type: 'none' | 'web' | 'model';
  model?: string;
  voice?: string;
  speed?: number;
};
// whisper
export type AppWhisperConfigType = {
  open: boolean;
  autoSend: boolean;
  autoTTSResponse: boolean;
};
// interval timer
export type AppScheduledTriggerConfigType = {
  cronString: string;
  timezone: string;
  defaultPrompt: string;
};
