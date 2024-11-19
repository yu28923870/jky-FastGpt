import React, { useEffect, useMemo, useTransition } from 'react';
import { Box, Flex, Grid, BoxProps, useTheme, useDisclosure, Button } from '@chakra-ui/react';
import { AddIcon, QuestionOutlineIcon, SmallAddIcon } from '@chakra-ui/icons';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { AppSimpleEditFormType } from '@fastgpt/global/core/app/type.d';
import { welcomeTextTip } from '@fastgpt/global/core/workflow/template/tip';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { useAppStore } from '@/web/core/app/store/useAppStore';
import { form2AppWorkflow } from '@/web/core/app/utils';

import dynamic from 'next/dynamic';
import MyTooltip from '@/components/MyTooltip';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import VariableEdit from '@/components/core/app/VariableEdit';
import MyTextarea from '@/components/common/Textarea/MyTextarea/index';
import PromptEditor from '@fastgpt/web/components/common/Textarea/PromptEditor';
import { formatEditorVariablePickerIcon } from '@fastgpt/global/core/workflow/utils';
import SearchParamsTip from '@/components/core/dataset/SearchParamsTip';
import SettingLLMModel from '@/components/core/ai/SettingLLMModel';
import type { SettingAIDataType } from '@fastgpt/global/core/app/type.d';
import DeleteIcon, { hoverDeleteStyles } from '@fastgpt/web/components/common/Icon/delete';
import { TTSTypeEnum } from '@/constants/app';
import { getSystemVariables } from '@/web/core/app/utils';
import { useUpdate } from 'ahooks';
import { useI18n } from '@/web/context/I18n';

const DatasetSelectModal = dynamic(() => import('@/components/core/app/DatasetSelectModal'));
const DatasetParamsModal = dynamic(() => import('@/components/core/app/DatasetParamsModal'));
const ToolSelectModal = dynamic(() => import('./ToolSelectModal'));
const TTSSelect = dynamic(() => import('@/components/core/app/TTSSelect'));
const QGSwitch = dynamic(() => import('@/components/core/app/QGSwitch'));
const WhisperConfig = dynamic(() => import('@/components/core/app/WhisperConfig'));

const BoxStyles: BoxProps = {
  px: 5,
  py: '16px',
  borderBottomWidth: '1px',
  borderBottomColor: 'borderColor.low'
};
const LabelStyles: BoxProps = {
  w: ['60px', '100px'],
  flexShrink: 0,
  fontSize: ['sm', 'md']
};

const EditForm = ({
  editForm,
  divRef,
  isSticky
}: {
  editForm: UseFormReturn<AppSimpleEditFormType, any>;
  divRef: React.RefObject<HTMLDivElement>;
  isSticky: boolean;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { appT } = useI18n();

  const { publishApp, appDetail } = useAppStore();

  const { allDatasets } = useDatasetStore();
  const { llmModelList } = useSystemStore();
  const [, startTst] = useTransition();
  const refresh = useUpdate();

  const { setValue, getValues, handleSubmit, control, watch } = editForm;

  const { fields: datasets, replace: replaceKbList } = useFieldArray({
    control,
    name: 'dataset.datasets'
  });

  const {
    isOpen: isOpenDatasetSelect,
    onOpen: onOpenKbSelect,
    onClose: onCloseKbSelect
  } = useDisclosure();
  const {
    isOpen: isOpenDatasetParams,
    onOpen: onOpenDatasetParams,
    onClose: onCloseDatasetParams
  } = useDisclosure();
  const {
    isOpen: isOpenToolsSelect,
    onOpen: onOpenToolsSelect,
    onClose: onCloseToolsSelect
  } = useDisclosure();

  const { openConfirm: openConfirmSave, ConfirmModal: ConfirmSaveModal } = useConfirm({
    content: t('core.app.edit.Confirm Save App Tip')
  });

  const aiSystemPrompt = watch('aiSettings.systemPrompt');
  const selectLLMModel = watch('aiSettings.model');
  const datasetSearchSetting = watch('dataset');
  const variables = watch('userGuide.variables');

  const formatVariables = useMemo(
    () => formatEditorVariablePickerIcon([...getSystemVariables(t), ...variables]),
    [t, variables]
  );
  const searchMode = watch('dataset.searchMode');
  const tts = getValues('userGuide.tts');
  const whisperConfig = getValues('userGuide.whisper');
  const postQuestionGuide = getValues('userGuide.questionGuide');
  const selectedTools = watch('selectedTools');

  const selectDatasets = useMemo(
    () => allDatasets.filter((item) => datasets.find((dataset) => dataset.datasetId === item._id)),
    [allDatasets, datasets]
  );

  const tokenLimit = useMemo(() => {
    return llmModelList.find((item) => item.model === selectLLMModel)?.quoteMaxToken || 3000;
  }, [selectLLMModel, llmModelList]);

  /* on save app */
  const { mutate: onSubmitPublish, isLoading: isSaving } = useRequest({
    mutationFn: async (data: AppSimpleEditFormType) => {
      const { nodes, edges } = form2AppWorkflow(data);

      await publishApp(appDetail._id, {
        nodes,
        edges,
        type: AppTypeEnum.simple
      });
    },
    successToast: t('common.Save Success'),
    errorToast: t('common.Save Failed')
  });

  useEffect(() => {
    const wat = watch((data) => {
      refresh();
    });

    return () => {
      wat.unsubscribe();
    };
  }, []);

  return (
    <Box>
      {/* title */}
      <Flex
        ref={divRef}
        position={'sticky'}
        top={-4}
        bg={'myGray.25'}
        py={4}
        justifyContent={'space-between'}
        alignItems={'center'}
        zIndex={100}
        px={4}
        {...(isSticky && {
          borderBottom: theme.borders.base,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
        })}
      >
        <Flex alignItems={'center'}>
          <Box fontSize={['md', 'xl']} color={'myGray.800'}>
            {t('core.app.App params config')}
          </Box>
          <MyTooltip label={t('core.app.Simple Config Tip')} forceShow>
            <MyIcon name={'common/questionLight'} color={'myGray.500'} ml={2} />
          </MyTooltip>
        </Flex>
        <Button
          isLoading={isSaving}
          size={['sm', 'md']}
          leftIcon={
            appDetail.type === AppTypeEnum.simple ? (
              <MyIcon name={'common/publishFill'} w={['14px', '16px']} />
            ) : undefined
          }
          variant={appDetail.type === AppTypeEnum.simple ? 'primary' : 'whitePrimary'}
          onClick={() => {
            if (appDetail.type !== AppTypeEnum.simple) {
              openConfirmSave(handleSubmit((data) => onSubmitPublish(data)))();
            } else {
              handleSubmit((data) => onSubmitPublish(data))();
            }
          }}
        >
          {appDetail.type !== AppTypeEnum.simple
            ? t('core.app.Change to simple mode')
            : t('core.app.Publish')}
        </Button>
      </Flex>

      <Box px={4}>
        <Box bg={'white'} borderRadius={'md'} borderWidth={'1px'} borderColor={'borderColor.base'}>
          {/* ai */}
          <Box {...BoxStyles}>
            <Flex alignItems={'center'}>
              <MyIcon name={'core/app/simpleMode/ai'} w={'20px'} />
              <Box ml={2} flex={1}>
                {appT('AI Settings')}
              </Box>
            </Flex>
            <Flex alignItems={'center'} mt={5}>
              <Box {...LabelStyles}>{t('core.ai.Model')}</Box>
              <Box flex={'1 0 0'}>
                <SettingLLMModel
                  llmModelType={'all'}
                  defaultData={{
                    model: getValues('aiSettings.model'),
                    temperature: getValues('aiSettings.temperature'),
                    maxToken: getValues('aiSettings.maxToken'),
                    maxHistories: getValues('aiSettings.maxHistories')
                  }}
                  onChange={({ model, temperature, maxToken, maxHistories }: SettingAIDataType) => {
                    setValue('aiSettings.model', model);
                    setValue('aiSettings.maxToken', maxToken);
                    setValue('aiSettings.temperature', temperature);
                    setValue('aiSettings.maxHistories', maxHistories ?? 6);
                  }}
                />
              </Box>
            </Flex>

            <Box mt={3}>
              <Box {...LabelStyles}>
                {t('core.ai.Prompt')}
                <MyTooltip label={t('core.app.tip.chatNodeSystemPromptTip')} forceShow>
                  <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
                </MyTooltip>
              </Box>
              <Box mt={1}>
                <PromptEditor
                  value={aiSystemPrompt}
                  onChange={(text) => {
                    startTst(() => {
                      setValue('aiSettings.systemPrompt', text);
                    });
                  }}
                  variables={formatVariables}
                  placeholder={t('core.app.tip.chatNodeSystemPromptTip')}
                  title={t('core.ai.Prompt')}
                />
              </Box>
            </Box>
          </Box>

          {/* dataset */}
          <Box {...BoxStyles}>
            <Flex alignItems={'center'}>
              <Flex alignItems={'center'} flex={1}>
                <MyIcon name={'core/app/simpleMode/dataset'} w={'20px'} />
                <Box ml={2}>{t('core.dataset.Choose Dataset')}</Box>
              </Flex>
              <Button
                variant={'transparentBase'}
                leftIcon={<AddIcon fontSize={'xs'} />}
                iconSpacing={1}
                size={'sm'}
                fontSize={'md'}
                onClick={onOpenKbSelect}
              >
                {t('common.Choose')}
              </Button>
              <Button
                variant={'transparentBase'}
                leftIcon={<MyIcon name={'edit'} w={'14px'} />}
                iconSpacing={1}
                size={'sm'}
                fontSize={'md'}
                onClick={onOpenDatasetParams}
              >
                {t('common.Params')}
              </Button>
            </Flex>
            {datasetSearchSetting.datasets?.length > 0 && (
              <Box my={3}>
                <SearchParamsTip
                  searchMode={searchMode}
                  similarity={getValues('dataset.similarity')}
                  limit={getValues('dataset.limit')}
                  usingReRank={getValues('dataset.usingReRank')}
                  usingQueryExtension={getValues('dataset.datasetSearchUsingExtensionQuery')}
                />
              </Box>
            )}
            <Grid
              gridTemplateColumns={['repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))']}
              gridGap={[2, 4]}
            >
              {selectDatasets.map((item) => (
                <MyTooltip key={item._id} label={t('core.dataset.Read Dataset')}>
                  <Flex
                    overflow={'hidden'}
                    alignItems={'center'}
                    p={2}
                    bg={'white'}
                    boxShadow={'0 4px 8px -2px rgba(16,24,40,.1),0 2px 4px -2px rgba(16,24,40,.06)'}
                    borderRadius={'md'}
                    border={theme.borders.base}
                    cursor={'pointer'}
                    onClick={() =>
                      router.push({
                        pathname: '/dataset/detail',
                        query: {
                          datasetId: item._id
                        }
                      })
                    }
                  >
                    <Avatar src={item.avatar} w={'18px'} mr={1} />
                    <Box flex={'1 0 0'} w={0} className={'textEllipsis'} fontSize={'sm'}>
                      {item.name}
                    </Box>
                  </Flex>
                </MyTooltip>
              ))}
            </Grid>
          </Box>

          {/* tool choice */}
          <Box {...BoxStyles}>
            <Flex alignItems={'center'}>
              <Flex alignItems={'center'} flex={1}>
                <MyIcon name={'core/app/toolCall'} w={'20px'} />
                <Box ml={2}>{t('core.app.Tool call')}(实验功能)</Box>
                <MyTooltip label={t('core.app.Tool call tip')}>
                  <QuestionOutlineIcon ml={1} />
                </MyTooltip>
              </Flex>
              <Button
                variant={'transparentBase'}
                leftIcon={<SmallAddIcon />}
                iconSpacing={1}
                mr={'-5px'}
                size={'sm'}
                fontSize={'md'}
                onClick={onOpenToolsSelect}
              >
                {t('common.Choose')}
              </Button>
            </Flex>
            <Grid
              mt={selectedTools.length > 0 ? 2 : 0}
              gridTemplateColumns={'repeat(2, minmax(0, 1fr))'}
              gridGap={[2, 4]}
            >
              {selectedTools.map((item) => (
                <Flex
                  key={item.id}
                  overflow={'hidden'}
                  alignItems={'center'}
                  p={2}
                  bg={'white'}
                  boxShadow={'0 4px 8px -2px rgba(16,24,40,.1),0 2px 4px -2px rgba(16,24,40,.06)'}
                  borderRadius={'md'}
                  border={theme.borders.base}
                  _hover={{
                    ...hoverDeleteStyles,
                    borderColor: 'primary.300'
                  }}
                >
                  <Avatar src={item.avatar} w={'18px'} mr={1} />
                  <Box flex={'1 0 0'} w={0} className={'textEllipsis'} fontSize={'sm'}>
                    {item.name}
                  </Box>
                  <DeleteIcon
                    onClick={() => {
                      setValue(
                        'selectedTools',
                        selectedTools.filter((tool) => tool.id !== item.id)
                      );
                    }}
                  />
                </Flex>
              ))}
            </Grid>
          </Box>

          {/* variable */}
          <Box {...BoxStyles}>
            <VariableEdit
              variables={variables}
              onChange={(e) => {
                setValue('userGuide.variables', e);
              }}
            />
          </Box>

          {/* welcome */}
          <Box {...BoxStyles}>
            <Flex alignItems={'center'}>
              <MyIcon name={'core/app/simpleMode/chat'} w={'20px'} />
              <Box mx={2}>{t('core.app.Welcome Text')}</Box>
              <MyTooltip label={t(welcomeTextTip)} forceShow>
                <QuestionOutlineIcon />
              </MyTooltip>
            </Flex>
            <MyTextarea
              mt={2}
              bg={'myWhite.400'}
              rows={5}
              placeholder={t(welcomeTextTip)}
              defaultValue={getValues('userGuide.welcomeText')}
              onBlur={(e) => {
                setValue('userGuide.welcomeText', e.target.value || '');
              }}
            />
          </Box>

          {/* tts */}
          <Box {...BoxStyles}>
            <TTSSelect
              value={tts}
              onChange={(e) => {
                setValue('userGuide.tts', e);
              }}
            />
          </Box>

          {/* whisper */}
          <Box {...BoxStyles}>
            <WhisperConfig
              isOpenAudio={tts.type !== TTSTypeEnum.none}
              value={whisperConfig}
              onChange={(e) => {
                setValue('userGuide.whisper', e);
              }}
            />
          </Box>

          {/* question guide */}
          <Box {...BoxStyles} borderBottom={'none'}>
            <QGSwitch
              isChecked={postQuestionGuide}
              size={'lg'}
              onChange={(e) => {
                setValue('userGuide.questionGuide', e.target.checked);
              }}
            />
          </Box>
        </Box>
      </Box>

      <ConfirmSaveModal bg={appDetail.type === AppTypeEnum.simple ? '' : 'red.600'} countDown={5} />
      {isOpenDatasetSelect && (
        <DatasetSelectModal
          isOpen={isOpenDatasetSelect}
          defaultSelectedDatasets={selectDatasets.map((item) => ({
            datasetId: item._id,
            vectorModel: item.vectorModel
          }))}
          onClose={onCloseKbSelect}
          onChange={replaceKbList}
        />
      )}
      {isOpenDatasetParams && (
        <DatasetParamsModal
          {...datasetSearchSetting}
          maxTokens={tokenLimit}
          onClose={onCloseDatasetParams}
          onSuccess={(e) => {
            setValue('dataset', {
              ...getValues('dataset'),
              ...e
            });
          }}
        />
      )}
      {isOpenToolsSelect && (
        <ToolSelectModal
          selectedTools={selectedTools}
          onAddTool={(e) => {
            setValue('selectedTools', [...selectedTools, e]);
          }}
          onRemoveTool={(e) => {
            setValue(
              'selectedTools',
              selectedTools.filter((item) => item.pluginId !== e.pluginId)
            );
          }}
          onClose={onCloseToolsSelect}
        />
      )}
    </Box>
  );
};

export default React.memo(EditForm);
