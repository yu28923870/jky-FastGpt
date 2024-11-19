import type { ChatItemType } from '@fastgpt/global/core/chat/type.d';
import {
  WorkflowIOValueTypeEnum,
  NodeOutputKeyEnum
} from '@fastgpt/global/core/workflow/constants';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import {
  RuntimeEdgeItemType,
  RuntimeNodeItemType
} from '@fastgpt/global/core/workflow/runtime/type';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';

export const filterToolNodeIdByEdges = ({
  nodeId,
  edges
}: {
  nodeId: string;
  edges: RuntimeEdgeItemType[];
}) => {
  return edges
    .filter(
      (edge) => edge.source === nodeId && edge.targetHandle === NodeOutputKeyEnum.selectedTools
    )
    .map((edge) => edge.target);
};

// export const checkTheModuleConnectedByTool = (
//   modules: StoreNodeItemType[],
//   node: StoreNodeItemType
// ) => {
//   let sign = false;
//   const toolModules = modules.filter((item) => item.flowNodeType === FlowNodeTypeEnum.tools);

//   toolModules.forEach((item) => {
//     const toolOutput = item.outputs.find(
//       (output) => output.key === NodeOutputKeyEnum.selectedTools
//     );
//     toolOutput?.targets.forEach((target) => {
//       if (target.moduleId === node.moduleId) {
//         sign = true;
//       }
//     });
//   });

//   return sign;
// };

export const getHistories = (history?: ChatItemType[] | number, histories: ChatItemType[] = []) => {
  if (!history) return [];
  if (typeof history === 'number') return histories.slice(-(history * 2));
  if (Array.isArray(history)) return history;

  return [];
};

/* value type format */
export const valueTypeFormat = (value: any, type?: WorkflowIOValueTypeEnum) => {
  if (value === undefined) return;

  if (type === 'string') {
    if (typeof value !== 'object') return String(value);
    return JSON.stringify(value);
  }
  if (type === 'number') return Number(value);
  if (type === 'boolean') return Boolean(value);
  try {
    if (type === WorkflowIOValueTypeEnum.datasetQuote && !Array.isArray(value)) {
      return JSON.parse(value);
    }
    if (type === WorkflowIOValueTypeEnum.selectDataset && !Array.isArray(value)) {
      return JSON.parse(value);
    }
  } catch (error) {
    return value;
  }

  return value;
};
