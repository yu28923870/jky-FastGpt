import { storeNodes2RuntimeNodes } from '@fastgpt/global/core/workflow/runtime/utils';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type';
import { RuntimeEdgeItemType, StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { useCallback, useState } from 'react';
import { checkWorkflowNodeAndConnection } from '@/web/core/workflow/utils';
import { useTranslation } from 'next-i18next';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { flowNode2StoreNodes } from '../../utils';
import { RuntimeNodeItemType } from '@fastgpt/global/core/workflow/runtime/type';

import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  Flex,
  Textarea,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Switch
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { checkInputIsReference } from '@fastgpt/global/core/workflow/utils';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext, getWorkflowStore } from '../../context';

const MyRightDrawer = dynamic(
  () => import('@fastgpt/web/components/common/MyDrawer/MyRightDrawer')
);
const JsonEditor = dynamic(() => import('@fastgpt/web/components/common/Textarea/JsonEditor'));

export const useDebug = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const setNodes = useContextSelector(WorkflowContext, (v) => v.setNodes);
  const onUpdateNodeError = useContextSelector(WorkflowContext, (v) => v.onUpdateNodeError);
  const edges = useContextSelector(WorkflowContext, (v) => v.edges);
  const onStartNodeDebug = useContextSelector(WorkflowContext, (v) => v.onStartNodeDebug);

  const [runtimeNodeId, setRuntimeNodeId] = useState<string>();
  const [runtimeNodes, setRuntimeNodes] = useState<RuntimeNodeItemType[]>();
  const [runtimeEdges, setRuntimeEdges] = useState<RuntimeEdgeItemType[]>();

  const flowData2StoreDataAndCheck = useCallback(async () => {
    const { nodes } = await getWorkflowStore();

    const checkResults = checkWorkflowNodeAndConnection({ nodes, edges });
    if (!checkResults) {
      const storeNodes = flowNode2StoreNodes({ nodes, edges });

      return JSON.stringify(storeNodes);
    } else {
      checkResults.forEach((nodeId) => onUpdateNodeError(nodeId, true));

      toast({
        status: 'warning',
        title: t('core.workflow.Check Failed')
      });
      return Promise.reject();
    }
  }, [edges, onUpdateNodeError, t, toast]);

  const openDebugNode = useCallback(
    async ({ entryNodeId }: { entryNodeId: string }) => {
      setNodes((state) =>
        state.map((node) => ({
          ...node,
          data: {
            ...node.data,
            debugResult: undefined
          }
        }))
      );
      const {
        nodes,
        edges
      }: {
        nodes: StoreNodeItemType[];
        edges: StoreEdgeItemType[];
      } = JSON.parse(await flowData2StoreDataAndCheck());

      const runtimeNodes = storeNodes2RuntimeNodes(nodes, [entryNodeId]);
      const runtimeEdges: RuntimeEdgeItemType[] = edges.map((edge) =>
        edge.target === entryNodeId
          ? {
              ...edge,
              status: 'active'
            }
          : {
              ...edge,
              status: 'waiting'
            }
      );

      setRuntimeNodeId(entryNodeId);
      setRuntimeNodes(runtimeNodes);
      setRuntimeEdges(runtimeEdges);
    },
    [flowData2StoreDataAndCheck, setNodes]
  );

  const DebugInputModal = useCallback(() => {
    if (!runtimeNodes || !runtimeEdges) return <></>;

    const runtimeNode = runtimeNodes.find((node) => node.nodeId === runtimeNodeId);

    if (!runtimeNode) return <></>;
    const referenceInputs = runtimeNode.inputs.filter((input) => {
      if (checkInputIsReference(input)) return true;
      if (input.required && !input.value) return true;
    });

    const { register, getValues, setValue, handleSubmit } = useForm<Record<string, any>>({
      defaultValues: referenceInputs.reduce((acc, input) => {
        //@ts-ignore
        acc[input.key] = undefined;
        return acc;
      }, {})
    });

    const onClose = () => {
      setRuntimeNodeId(undefined);
      setRuntimeNodes(undefined);
      setRuntimeEdges(undefined);
    };

    const onclickRun = (data: Record<string, any>) => {
      onStartNodeDebug({
        entryNodeId: runtimeNode.nodeId,
        runtimeNodes: runtimeNodes.map((node) =>
          node.nodeId === runtimeNode.nodeId
            ? {
                ...runtimeNode,
                inputs: runtimeNode.inputs.map((input) => ({
                  ...input,
                  value: data[input.key] ?? input.value
                }))
              }
            : node
        ),
        runtimeEdges: runtimeEdges
      });
      onClose();
    };

    return (
      <MyRightDrawer
        onClose={onClose}
        iconSrc="core/workflow/debugBlue"
        title={t('core.workflow.Debug Node')}
        maxW={['90vw', '35vw']}
      >
        <Flex flexDirection={'column'} h={'100%'}>
          <Box flex={'1 0 0'} overflow={'auto'}>
            {referenceInputs.map((input) => {
              const required = input.required || false;
              return (
                <Box key={input.key} _notLast={{ mb: 4 }} px={1}>
                  <Box display={'inline-block'} position={'relative'} mb={1}>
                    {required && (
                      <Box position={'absolute'} right={-2} top={-1} color={'red.600'}>
                        *
                      </Box>
                    )}
                    {t(input.debugLabel || input.label)}
                  </Box>
                  {(() => {
                    if (input.valueType === WorkflowIOValueTypeEnum.string) {
                      return (
                        <Textarea
                          {...register(input.key, {
                            required
                          })}
                          placeholder={t(input.placeholder || '')}
                          bg={'myGray.50'}
                        />
                      );
                    }
                    if (input.valueType === WorkflowIOValueTypeEnum.number) {
                      return (
                        <NumberInput
                          step={input.step}
                          min={input.min}
                          max={input.max}
                          bg={'myGray.50'}
                        >
                          <NumberInputField
                            {...register(input.key, {
                              required: input.required,
                              min: input.min,
                              max: input.max,
                              valueAsNumber: true
                            })}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      );
                    }
                    if (input.valueType === WorkflowIOValueTypeEnum.boolean) {
                      return <Switch size={'lg'} {...register(input.key)} />;
                    }
                    return (
                      <JsonEditor
                        bg={'myGray.50'}
                        placeholder={t(input.placeholder || '')}
                        resize
                        value={getValues(input.key)}
                        onChange={(e) => {
                          setValue(input.key, e);
                        }}
                      />
                    );
                  })()}
                </Box>
              );
            })}
          </Box>
          <Flex py={2} justifyContent={'flex-end'}>
            <Button onClick={handleSubmit(onclickRun)}>运行</Button>
          </Flex>
        </Flex>
      </MyRightDrawer>
    );
  }, [onStartNodeDebug, runtimeEdges, runtimeNodeId, runtimeNodes, t]);

  return {
    DebugInputModal,
    openDebugNode
  };
};
