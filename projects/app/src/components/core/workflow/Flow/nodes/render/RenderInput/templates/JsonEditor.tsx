import React, { useCallback, useMemo } from 'react';
import type { RenderInputProps } from '../type';
import JSONEditor from '@fastgpt/web/components/common/Textarea/JsonEditor';
import { formatEditorVariablePickerIcon } from '@fastgpt/global/core/workflow/utils';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '@/components/core/workflow/context';
import { getWorkflowGlobalVariables } from '@/web/core/workflow/utils';
import { useCreation } from 'ahooks';
import { useTranslation } from 'next-i18next';

const JsonEditor = ({ inputs = [], item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const nodeList = useContextSelector(WorkflowContext, (v) => v.nodeList);
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  // get variable
  const variables = useCreation(() => {
    const globalVariables = getWorkflowGlobalVariables(nodeList, t);

    const moduleVariables = formatEditorVariablePickerIcon(
      inputs
        .filter((input) => input.canEdit)
        .map((item) => ({
          key: item.key,
          label: item.label
        }))
    );

    return [...globalVariables, ...moduleVariables];
  }, [inputs, nodeList]);

  const update = useCallback(
    (value: string) => {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: item.key,
        value: {
          ...item,
          value
        }
      });
    },
    [item, nodeId, onChangeNode]
  );

  const value = useMemo(() => {
    if (typeof item.value === 'string') {
      return item.value;
    }
    return JSON.stringify(item.value, null, 2);
  }, [item.value]);

  const Render = useMemo(() => {
    return (
      <JSONEditor
        bg={'white'}
        borderRadius={'sm'}
        placeholder={item.placeholder}
        resize
        value={value}
        onChange={(e) => {
          update(e);
        }}
        variables={variables}
      />
    );
  }, [item.placeholder, update, value, variables]);

  return Render;
};

export default React.memo(JsonEditor);
