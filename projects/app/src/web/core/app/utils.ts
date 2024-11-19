import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import {
  FlowNodeInputTypeEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { NodeInputKeyEnum, WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';

import { getNanoid } from '@fastgpt/global/common/string/tools';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { EditorVariablePickerType } from '@fastgpt/web/components/common/Textarea/PromptEditor/type';
import { TFunction } from 'next-i18next';

type WorkflowType = {
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
};
export function form2AppWorkflow(data: AppSimpleEditFormType): WorkflowType {
  const workflowStartNodeId = 'workflowStartNodeId';
  function systemConfigTemplate(formData: AppSimpleEditFormType): StoreNodeItemType {
    return {
      nodeId: 'userGuide',
      name: '系统配置',
      intro: '可以配置应用的系统参数',
      flowNodeType: FlowNodeTypeEnum.systemConfig,
      position: {
        x: 531.2422736065552,
        y: -486.7611729549753
      },
      inputs: [
        {
          key: NodeInputKeyEnum.welcomeText,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: 'core.app.Welcome Text',
          value: formData.userGuide.welcomeText
        },
        {
          key: NodeInputKeyEnum.variables,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: 'core.app.Chat Variable',
          value: formData.userGuide.variables
        },
        {
          key: NodeInputKeyEnum.questionGuide,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: 'core.app.Question Guide',
          value: formData.userGuide.questionGuide
        },
        {
          key: NodeInputKeyEnum.tts,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: '',
          value: formData.userGuide.tts
        },
        {
          key: NodeInputKeyEnum.whisper,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: '',
          value: formData.userGuide.whisper
        },
        {
          key: NodeInputKeyEnum.scheduleTrigger,
          renderTypeList: [FlowNodeInputTypeEnum.hidden],
          label: '',
          value: formData.userGuide.scheduleTrigger
        }
      ],
      outputs: []
    };
  }
  function workflowStartTemplate(): StoreNodeItemType {
    return {
      nodeId: workflowStartNodeId,
      name: '流程开始',
      intro: '',
      avatar: '/imgs/workflow/userChatInput.svg',
      flowNodeType: 'workflowStart',
      position: {
        x: 558.4082376415505,
        y: 123.72387429194112
      },
      inputs: [
        {
          key: 'userChatInput',
          renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
          valueType: WorkflowIOValueTypeEnum.string,
          label: '用户问题',
          required: true,
          toolDescription: '用户问题'
        }
      ],
      outputs: [
        {
          id: 'userChatInput',
          key: 'userChatInput',
          label: 'core.module.input.label.user question',
          valueType: WorkflowIOValueTypeEnum.string,
          type: 'static'
        }
      ]
    };
  }

  function simpleChatTemplate(formData: AppSimpleEditFormType): WorkflowType {
    return {
      nodes: [
        {
          nodeId: '7BdojPlukIQw',
          name: 'AI 对话',
          intro: 'AI 大模型对话',
          avatar: '/imgs/workflow/AI.png',
          flowNodeType: 'chatNode',
          showStatus: true,
          position: {
            x: 1106.3238387960757,
            y: -350.6030674683474
          },
          inputs: [
            {
              key: 'model',
              renderTypeList: [
                FlowNodeInputTypeEnum.settingLLMModel,
                FlowNodeInputTypeEnum.reference
              ],
              label: 'core.module.input.label.aiModel',
              valueType: WorkflowIOValueTypeEnum.string,
              value: formData.aiSettings.model
            },
            {
              key: 'temperature',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.temperature,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 0,
              max: 10,
              step: 1
            },
            {
              key: 'maxToken',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.maxToken,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 100,
              max: 4000,
              step: 50
            },
            {
              key: 'isResponseAnswerText',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: true,
              valueType: WorkflowIOValueTypeEnum.boolean
            },
            {
              key: 'quoteTemplate',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string
            },
            {
              key: 'quotePrompt',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string
            },
            {
              key: 'systemPrompt',
              renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
              max: 3000,
              valueType: WorkflowIOValueTypeEnum.string,
              label: 'core.ai.Prompt',
              description: 'core.app.tip.chatNodeSystemPromptTip',
              placeholder: 'core.app.tip.chatNodeSystemPromptTip',
              value: formData.aiSettings.systemPrompt
            },
            {
              key: 'history',
              renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
              valueType: WorkflowIOValueTypeEnum.chatHistory,
              label: 'core.module.input.label.chat history',
              required: true,
              min: 0,
              max: 30,
              value: formData.aiSettings.maxHistories
            },
            {
              key: 'userChatInput',
              renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
              valueType: WorkflowIOValueTypeEnum.string,
              label: '用户问题',
              required: true,
              toolDescription: '用户问题',
              value: [workflowStartNodeId, 'userChatInput']
            },
            {
              key: 'quoteQA',
              renderTypeList: [FlowNodeInputTypeEnum.settingDatasetQuotePrompt],
              label: '',
              debugLabel: '知识库引用',
              description: '',
              valueType: WorkflowIOValueTypeEnum.datasetQuote
            }
          ],
          outputs: [
            {
              id: 'history',
              key: 'history',
              label: 'core.module.output.label.New context',
              description: 'core.module.output.description.New context',
              valueType: WorkflowIOValueTypeEnum.chatHistory,
              type: 'static'
            },
            {
              id: 'answerText',
              key: 'answerText',
              label: 'core.module.output.label.Ai response content',
              description: 'core.module.output.description.Ai response content',
              valueType: WorkflowIOValueTypeEnum.string,
              type: 'static'
            }
          ]
        }
      ],
      edges: [
        {
          source: workflowStartNodeId,
          target: '7BdojPlukIQw',
          sourceHandle: `${workflowStartNodeId}-source-right`,
          targetHandle: '7BdojPlukIQw-target-left'
        }
      ]
    };
  }
  function datasetTemplate(formData: AppSimpleEditFormType): WorkflowType {
    return {
      nodes: [
        {
          nodeId: '7BdojPlukIQw',
          name: 'AI 对话',
          intro: 'AI 大模型对话',
          avatar: '/imgs/workflow/AI.png',
          flowNodeType: 'chatNode',
          showStatus: true,
          position: {
            x: 1638.509551404687,
            y: -341.0428450861567
          },
          inputs: [
            {
              key: 'model',
              renderTypeList: [
                FlowNodeInputTypeEnum.settingLLMModel,
                FlowNodeInputTypeEnum.reference
              ],
              label: 'core.module.input.label.aiModel',
              valueType: WorkflowIOValueTypeEnum.string,
              value: formData.aiSettings.model
            },
            {
              key: 'temperature',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.temperature,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 0,
              max: 10,
              step: 1
            },
            {
              key: 'maxToken',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.maxToken,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 100,
              max: 4000,
              step: 50
            },
            {
              key: 'isResponseAnswerText',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: true,
              valueType: WorkflowIOValueTypeEnum.boolean
            },
            {
              key: 'quoteTemplate',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string
            },
            {
              key: 'quotePrompt',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string
            },
            {
              key: 'systemPrompt',
              renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
              max: 3000,
              valueType: WorkflowIOValueTypeEnum.string,
              label: 'core.ai.Prompt',
              description: 'core.app.tip.chatNodeSystemPromptTip',
              placeholder: 'core.app.tip.chatNodeSystemPromptTip',
              value: formData.aiSettings.systemPrompt
            },
            {
              key: 'history',
              renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
              valueType: WorkflowIOValueTypeEnum.chatHistory,
              label: 'core.module.input.label.chat history',
              required: true,
              min: 0,
              max: 30,
              value: formData.aiSettings.maxHistories
            },
            {
              key: 'userChatInput',
              renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
              valueType: WorkflowIOValueTypeEnum.string,
              label: '用户问题',
              required: true,
              toolDescription: '用户问题',
              value: [workflowStartNodeId, 'userChatInput']
            },
            {
              key: 'quoteQA',
              renderTypeList: [FlowNodeInputTypeEnum.settingDatasetQuotePrompt],
              label: '',
              debugLabel: '知识库引用',
              description: '',
              valueType: WorkflowIOValueTypeEnum.datasetQuote,
              value: ['iKBoX2vIzETU', 'quoteQA']
            }
          ],
          outputs: [
            {
              id: 'history',
              key: 'history',
              label: 'core.module.output.label.New context',
              description: 'core.module.output.description.New context',
              valueType: WorkflowIOValueTypeEnum.chatHistory,
              type: 'static'
            },
            {
              id: 'answerText',
              key: 'answerText',
              label: 'core.module.output.label.Ai response content',
              description: 'core.module.output.description.Ai response content',
              valueType: WorkflowIOValueTypeEnum.string,
              type: 'static'
            }
          ]
        },
        {
          nodeId: 'iKBoX2vIzETU',
          name: '知识库搜索',
          intro: '调用“语义检索”和“全文检索”能力，从“知识库”中查找可能与问题相关的参考内容',
          avatar: '/imgs/workflow/db.png',
          flowNodeType: 'datasetSearchNode',
          showStatus: true,
          position: {
            x: 918.5901682164496,
            y: -227.11542247619582
          },
          inputs: [
            {
              key: 'datasets',
              renderTypeList: [
                FlowNodeInputTypeEnum.selectDataset,
                FlowNodeInputTypeEnum.reference
              ],
              label: 'core.module.input.label.Select dataset',
              value: formData.dataset.datasets,
              valueType: WorkflowIOValueTypeEnum.selectDataset,
              list: [],
              required: true
            },
            {
              key: 'similarity',
              renderTypeList: [FlowNodeInputTypeEnum.selectDatasetParamsModal],
              label: '',
              value: formData.dataset.similarity,
              valueType: WorkflowIOValueTypeEnum.number
            },
            {
              key: 'limit',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.dataset.limit,
              valueType: WorkflowIOValueTypeEnum.number
            },
            {
              key: 'searchMode',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string,
              value: formData.dataset.searchMode
            },
            {
              key: 'usingReRank',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.boolean,
              value: formData.dataset.usingReRank
            },
            {
              key: 'datasetSearchUsingExtensionQuery',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.boolean,
              value: formData.dataset.datasetSearchUsingExtensionQuery
            },
            {
              key: 'datasetSearchExtensionModel',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string,
              value: formData.dataset.datasetSearchExtensionModel
            },
            {
              key: 'datasetSearchExtensionBg',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              valueType: WorkflowIOValueTypeEnum.string,
              value: formData.dataset.datasetSearchExtensionBg
            },
            {
              key: 'userChatInput',
              renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
              valueType: WorkflowIOValueTypeEnum.string,
              label: '用户问题',
              required: true,
              toolDescription: '需要检索的内容',
              value: [workflowStartNodeId, 'userChatInput']
            }
          ],
          outputs: [
            {
              id: 'quoteQA',
              key: 'quoteQA',
              label: 'core.module.Dataset quote.label',
              type: 'static',
              valueType: WorkflowIOValueTypeEnum.datasetQuote
            }
          ]
        }
      ],
      edges: [
        {
          source: workflowStartNodeId,
          target: 'iKBoX2vIzETU',
          sourceHandle: `${workflowStartNodeId}-source-right`,
          targetHandle: 'iKBoX2vIzETU-target-left'
        },
        {
          source: 'iKBoX2vIzETU',
          target: '7BdojPlukIQw',
          sourceHandle: 'iKBoX2vIzETU-source-right',
          targetHandle: '7BdojPlukIQw-target-left'
        }
      ]
    };
  }
  function toolTemplates(formData: AppSimpleEditFormType): WorkflowType {
    const toolNodeId = getNanoid(6);
    const datasetNodeId = getNanoid(6);

    const datasetTool: WorkflowType | null =
      formData.dataset.datasets.length > 0
        ? {
            nodes: [
              {
                nodeId: datasetNodeId,
                name: '知识库搜索',
                intro: '调用“语义检索”和“全文检索”能力，从“知识库”中查找可能与问题相关的参考内容',
                avatar: '/imgs/workflow/db.png',
                flowNodeType: 'datasetSearchNode',
                showStatus: true,
                position: {
                  x: 500,
                  y: 545
                },
                inputs: [
                  {
                    key: 'datasets',
                    renderTypeList: [
                      FlowNodeInputTypeEnum.selectDataset,
                      FlowNodeInputTypeEnum.reference
                    ],
                    label: 'core.module.input.label.Select dataset',
                    value: formData.dataset.datasets,
                    valueType: WorkflowIOValueTypeEnum.selectDataset,
                    list: [],
                    required: true
                  },
                  {
                    key: 'similarity',
                    renderTypeList: [FlowNodeInputTypeEnum.selectDatasetParamsModal],
                    label: '',
                    value: formData.dataset.similarity,
                    valueType: WorkflowIOValueTypeEnum.number
                  },
                  {
                    key: 'limit',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    value: formData.dataset.limit,
                    valueType: WorkflowIOValueTypeEnum.number
                  },
                  {
                    key: 'searchMode',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    valueType: WorkflowIOValueTypeEnum.string,
                    value: formData.dataset.searchMode
                  },
                  {
                    key: 'usingReRank',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    valueType: WorkflowIOValueTypeEnum.boolean,
                    value: formData.dataset.usingReRank
                  },
                  {
                    key: 'datasetSearchUsingExtensionQuery',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    valueType: WorkflowIOValueTypeEnum.boolean,
                    value: formData.dataset.datasetSearchUsingExtensionQuery
                  },
                  {
                    key: 'datasetSearchExtensionModel',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    valueType: WorkflowIOValueTypeEnum.string,
                    value: formData.dataset.datasetSearchExtensionModel
                  },
                  {
                    key: 'datasetSearchExtensionBg',
                    renderTypeList: [FlowNodeInputTypeEnum.hidden],
                    label: '',
                    valueType: WorkflowIOValueTypeEnum.string,
                    value: formData.dataset.datasetSearchExtensionBg
                  },
                  {
                    key: 'userChatInput',
                    renderTypeList: [
                      FlowNodeInputTypeEnum.reference,
                      FlowNodeInputTypeEnum.textarea
                    ],
                    valueType: WorkflowIOValueTypeEnum.string,
                    label: '用户问题',
                    required: true,
                    toolDescription: '需要检索的内容'
                  }
                ],
                outputs: [
                  {
                    id: 'quoteQA',
                    key: 'quoteQA',
                    label: 'core.module.Dataset quote.label',
                    type: 'static',
                    valueType: WorkflowIOValueTypeEnum.datasetQuote
                  }
                ]
              }
            ],
            edges: [
              {
                source: toolNodeId,
                target: datasetNodeId,
                sourceHandle: 'selectedTools',
                targetHandle: 'selectedTools'
              }
            ]
          }
        : null;

    const pluginTool: WorkflowType[] = formData.selectedTools.map((tool, i) => {
      const nodeId = getNanoid(6);
      return {
        nodes: [
          {
            nodeId,
            id: tool.id,
            pluginId: tool.pluginId,
            name: tool.name,
            intro: tool.intro,
            avatar: tool.avatar,
            flowNodeType: tool.flowNodeType,
            showStatus: tool.showStatus,
            position: {
              x: 500 + 500 * (i + 1),
              y: 545
            },
            inputs: tool.inputs,
            outputs: tool.outputs
          }
        ],
        edges: [
          {
            source: toolNodeId,
            target: nodeId,
            sourceHandle: 'selectedTools',
            targetHandle: 'selectedTools'
          }
        ]
      };
    });

    const config: WorkflowType = {
      nodes: [
        {
          nodeId: toolNodeId,
          name: '工具调用（实验）',
          intro: '通过AI模型自动选择一个或多个功能块进行调用，也可以对插件进行调用。',
          avatar: '/imgs/workflow/tool.svg',
          flowNodeType: 'tools',
          showStatus: true,
          position: {
            x: 1062.1738942532802,
            y: -223.65033022650476
          },
          inputs: [
            {
              key: 'model',
              renderTypeList: [
                FlowNodeInputTypeEnum.settingLLMModel,
                FlowNodeInputTypeEnum.reference
              ],
              label: 'core.module.input.label.aiModel',
              valueType: WorkflowIOValueTypeEnum.string,
              llmModelType: 'all',
              value: formData.aiSettings.model
            },
            {
              key: 'temperature',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.temperature,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 0,
              max: 10,
              step: 1
            },
            {
              key: 'maxToken',
              renderTypeList: [FlowNodeInputTypeEnum.hidden],
              label: '',
              value: formData.aiSettings.maxToken,
              valueType: WorkflowIOValueTypeEnum.number,
              min: 100,
              max: 4000,
              step: 50
            },
            {
              key: 'systemPrompt',
              renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
              max: 3000,
              valueType: WorkflowIOValueTypeEnum.string,
              label: 'core.ai.Prompt',
              description: 'core.app.tip.chatNodeSystemPromptTip',
              placeholder: 'core.app.tip.chatNodeSystemPromptTip',
              value: formData.aiSettings.systemPrompt
            },
            {
              key: 'history',
              renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
              valueType: WorkflowIOValueTypeEnum.chatHistory,
              label: 'core.module.input.label.chat history',
              required: true,
              min: 0,
              max: 30,
              value: formData.aiSettings.maxHistories
            },
            {
              key: 'userChatInput',
              renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
              valueType: WorkflowIOValueTypeEnum.string,
              label: '用户问题',
              required: true,
              value: [workflowStartNodeId, 'userChatInput']
            }
          ],
          outputs: []
        },
        // tool nodes
        ...(datasetTool ? datasetTool.nodes : []),
        ...pluginTool.map((tool) => tool.nodes).flat()
      ],
      edges: [
        {
          source: workflowStartNodeId,
          target: toolNodeId,
          sourceHandle: `${workflowStartNodeId}-source-right`,
          targetHandle: `${toolNodeId}-target-left`
        },
        // tool edges
        ...(datasetTool ? datasetTool.edges : []),
        ...pluginTool.map((tool) => tool.edges).flat()
      ]
    };

    return config;
  }

  const workflow = (() => {
    if (data.selectedTools.length > 0) return toolTemplates(data);
    if (data.dataset.datasets.length > 0) return datasetTemplate(data);
    return simpleChatTemplate(data);
  })();

  return {
    nodes: [systemConfigTemplate(data), workflowStartTemplate(), ...workflow.nodes],
    edges: workflow.edges
  };
}

export const getSystemVariables = (t: TFunction): EditorVariablePickerType[] => {
  return [
    {
      key: 'appId',
      label: t('core.module.http.AppId'),
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      key: 'chatId',
      label: t('core.module.http.ChatId'),
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      key: 'responseChatItemId',
      label: t('core.module.http.ResponseChatItemId'),
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      key: 'histories',
      label: t('core.module.http.Histories'),
      valueType: WorkflowIOValueTypeEnum.chatHistory
    },
    {
      key: 'cTime',
      label: t('core.module.http.Current time'),
      valueType: WorkflowIOValueTypeEnum.string
    }
  ];
};
