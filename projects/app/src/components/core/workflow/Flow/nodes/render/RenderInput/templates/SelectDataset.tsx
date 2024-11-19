import React, { useEffect, useMemo, useState } from 'react';
import type { RenderInputProps } from '../type';
import { Box, Button, Flex, Grid, useDisclosure, useTheme } from '@chakra-ui/react';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { SelectedDatasetType } from '@fastgpt/global/core/workflow/api';
import Avatar from '@/components/Avatar';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { DatasetSearchModeEnum } from '@fastgpt/global/core/dataset/constants';

import dynamic from 'next/dynamic';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '@/components/core/workflow/context';

const DatasetSelectModal = dynamic(() => import('@/components/core/app/DatasetSelectModal'));

const SelectDatasetRender = ({ inputs = [], item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  const [data, setData] = useState({
    searchMode: DatasetSearchModeEnum.embedding,
    limit: 5,
    similarity: 0.5,
    usingReRank: false
  });

  const { allDatasets, loadAllDatasets } = useDatasetStore();
  const {
    isOpen: isOpenDatasetSelect,
    onOpen: onOpenDatasetSelect,
    onClose: onCloseDatasetSelect
  } = useDisclosure();

  const selectedDatasets = useMemo(() => {
    const value = item.value as SelectedDatasetType;
    return allDatasets.filter((dataset) => value?.find((item) => item.datasetId === dataset._id));
  }, [allDatasets, item.value]);

  useQuery(['loadAllDatasets'], loadAllDatasets);

  useEffect(() => {
    inputs.forEach((input) => {
      // @ts-ignore
      if (data[input.key] !== undefined) {
        setData((state) => ({
          ...state,
          [input.key]: input.value
        }));
      }
    });
  }, [inputs]);

  const Render = useMemo(() => {
    return (
      <>
        <Grid
          gridTemplateColumns={'repeat(2, minmax(0, 1fr))'}
          gridGap={4}
          minW={'350px'}
          w={'100%'}
        >
          <Button
            h={'36px'}
            leftIcon={<MyIcon name={'common/selectLight'} w={'14px'} />}
            onClick={onOpenDatasetSelect}
          >
            {t('common.Choose')}
          </Button>
          {selectedDatasets.map((item) => (
            <Flex
              key={item._id}
              alignItems={'center'}
              h={'36px'}
              border={theme.borders.base}
              px={2}
              borderRadius={'md'}
            >
              <Avatar src={item.avatar} w={'24px'}></Avatar>
              <Box
                ml={3}
                flex={'1 0 0'}
                w={0}
                className="textEllipsis"
                fontWeight={'bold'}
                fontSize={['md', 'lg', 'xl']}
              >
                {item.name}
              </Box>
            </Flex>
          ))}
        </Grid>
        {isOpenDatasetSelect && (
          <DatasetSelectModal
            isOpen={isOpenDatasetSelect}
            defaultSelectedDatasets={item.value}
            onChange={(e) => {
              onChangeNode({
                nodeId,
                key: item.key,
                type: 'updateInput',
                value: {
                  ...item,
                  value: e
                }
              });
            }}
            onClose={onCloseDatasetSelect}
          />
        )}
      </>
    );
  }, [
    isOpenDatasetSelect,
    item,
    nodeId,
    onChangeNode,
    onCloseDatasetSelect,
    onOpenDatasetSelect,
    selectedDatasets,
    t,
    theme.borders.base
  ]);

  return Render;
};

export default React.memo(SelectDatasetRender);
