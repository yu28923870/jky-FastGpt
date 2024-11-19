import { Box, Button, Flex, ModalBody, useDisclosure, Switch, Textarea } from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { AppScheduledTriggerConfigType } from '@fastgpt/global/core/app/type';
import MyModal from '@fastgpt/web/components/common/MyModal';
import dynamic from 'next/dynamic';
import type { MultipleSelectProps } from '@fastgpt/web/components/common/MySelect/type.d';
import { useForm } from 'react-hook-form';
import { cronParser2Fields } from '@fastgpt/global/common/string/time';
import TimezoneSelect from '@fastgpt/web/components/common/MySelect/TimezoneSelect';

const MultipleRowSelect = dynamic(
  () => import('@fastgpt/web/components/common/MySelect/MultipleRowSelect')
);

// options type:
enum CronJobTypeEnum {
  month = 'month',
  week = 'week',
  day = 'day',
  interval = 'interval'
}
type CronType = 'month' | 'week' | 'day' | 'interval';

const get24HoursOptions = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${i < 10 ? '0' : ''}${i}:00`,
    value: i
  }));
};
const getWeekOptions = () => {
  return Array.from({ length: 7 }, (_, i) => {
    if (i === 0) {
      return {
        label: '星期日',
        value: i,
        children: get24HoursOptions()
      };
    }
    return {
      label: `星期${i}`,
      value: i,
      children: get24HoursOptions()
    };
  });
};
const getMonthOptions = () => {
  return Array.from({ length: 28 }, (_, i) => ({
    label: `${i + 1}号`,
    value: i,
    children: get24HoursOptions()
  }));
};
const getInterValOptions = () => {
  // 每n小时
  return [
    {
      label: `每小时`,
      value: 1
    },
    {
      label: `每2小时`,
      value: 2
    },
    {
      label: `每3小时`,
      value: 3
    },
    {
      label: `每4小时`,
      value: 4
    },
    {
      label: `每6小时`,
      value: 6
    },
    {
      label: `每12小时`,
      value: 12
    }
  ];
};
const defaultValue = ['day', 0, 0];
const defaultCronString = '0 0 * * *';

type CronFieldType = [CronType, number, number];

const ScheduledTriggerConfig = ({
  value,
  onChange
}: {
  value: AppScheduledTriggerConfigType | null;
  onChange: (e: AppScheduledTriggerConfigType | null) => void;
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, setValue, watch } = useForm<AppScheduledTriggerConfigType>({
    defaultValues: {
      cronString: value?.cronString || '',
      timezone: value?.timezone,
      defaultPrompt: value?.defaultPrompt || ''
    }
  });
  const timezone = watch('timezone');
  const cronString = watch('cronString');

  const cronSelectList = useRef<MultipleSelectProps['list']>([
    {
      label: '每天执行',
      value: CronJobTypeEnum.day,
      children: get24HoursOptions()
    },
    {
      label: '每周执行',
      value: CronJobTypeEnum.week,
      children: getWeekOptions()
    },
    {
      label: '每月执行',
      value: CronJobTypeEnum.month,
      children: getMonthOptions()
    },
    {
      label: '间隔执行',
      value: CronJobTypeEnum.interval,
      children: getInterValOptions()
    }
  ]);

  /* cron string to config field */
  const cronConfig = useMemo(() => {
    if (!cronString) {
      return null;
    }
    const cronField = cronParser2Fields(cronString);

    if (!cronField) {
      return null;
    }

    if (cronField.dayOfMonth.length !== 31) {
      return {
        isOpen: true,
        cronField: [CronJobTypeEnum.month, cronField.dayOfMonth[0], cronField.hour[0]]
      };
    }
    if (cronField.dayOfWeek.length !== 8) {
      return {
        isOpen: true,
        cronField: [CronJobTypeEnum.week, cronField.dayOfWeek[0], cronField.hour[0]]
      };
    }
    if (cronField.hour.length === 1) {
      return {
        isOpen: true,
        cronField: [CronJobTypeEnum.day, cronField.hour[0], 0]
      };
    }
    return {
      isOpen: true,
      cronField: [CronJobTypeEnum.interval, 24 / cronField.hour.length, 0]
    };
  }, [cronString]);
  const isOpenSchedule = cronConfig?.isOpen;
  const cronField = (cronConfig?.cronField || defaultValue) as CronFieldType;

  const cronConfig2cronString = useCallback(
    (e: CronFieldType) => {
      if (e[0] === CronJobTypeEnum.month) {
        setValue('cronString', `0 ${e[2]} ${e[1]} * *`);
      } else if (e[0] === CronJobTypeEnum.week) {
        setValue('cronString', `0 ${e[2]} * * ${e[1]}`);
      } else if (e[0] === CronJobTypeEnum.day) {
        setValue('cronString', `0 ${e[1]} * * *`);
      } else if (e[0] === CronJobTypeEnum.interval) {
        setValue('cronString', `0 */${e[1]} * * *`);
      } else {
        setValue('cronString', '');
      }
    },
    [setValue]
  );

  // cron config to show label
  const formatLabel = useMemo(() => {
    if (!isOpenSchedule) {
      return t('common.Not open');
    }

    if (cronField[0] === 'month') {
      return t('core.app.schedule.Every month', {
        day: cronField[1],
        hour: cronField[2]
      });
    }
    if (cronField[0] === 'week') {
      return t('core.app.schedule.Every week', {
        day: cronField[1] === 0 ? '日' : cronField[1],
        hour: cronField[2]
      });
    }
    if (cronField[0] === 'day') {
      return t('core.app.schedule.Every day', {
        hour: cronField[1]
      });
    }
    if (cronField[0] === 'interval') {
      return t('core.app.schedule.Interval', {
        interval: cronField[1]
      });
    }

    return t('common.Not open');
  }, [cronField, isOpenSchedule, t]);

  // update value
  watch((data) => {
    if (!data.cronString) {
      onChange(null);
      return;
    }
    onChange({
      cronString: data.cronString,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      defaultPrompt: data.defaultPrompt || ''
    });
  });

  useEffect(() => {
    if (!value?.timezone) {
      setValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const Render = useMemo(() => {
    return (
      <>
        <Flex alignItems={'center'}>
          <MyIcon name={'core/app/schedulePlan'} w={'20px'} />
          <Flex alignItems={'center'} ml={2} flex={1}>
            {t('core.app.Interval timer run')}
            <QuestionTip ml={1} label={t('core.app.Interval timer tip')} />
          </Flex>
          <MyTooltip label={t('core.app.Config schedule plan')}>
            <Button
              variant={'transparentBase'}
              iconSpacing={1}
              size={'sm'}
              mr={'-5px'}
              onClick={onOpen}
            >
              {formatLabel}
            </Button>
          </MyTooltip>
        </Flex>

        <MyModal
          isOpen={isOpen}
          onClose={onClose}
          iconSrc={'core/app/schedulePlan'}
          title={t('core.app.Interval timer config')}
          overflow={'unset'}
        >
          <ModalBody>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Box flex={'0 0 80px'}> {t('core.app.schedule.Open schedule')}</Box>
              <Switch
                size={'lg'}
                isChecked={isOpenSchedule}
                onChange={(e) => {
                  if (e.target.checked) {
                    setValue('cronString', defaultCronString);
                  } else {
                    setValue('cronString', '');
                  }
                }}
              />
            </Flex>
            {isOpenSchedule && (
              <>
                <Flex alignItems={'center'} mt={5}>
                  <Box flex={'0 0 80px'}>执行时机</Box>
                  <Box flex={'1 0 0'}>
                    <MultipleRowSelect
                      label={formatLabel}
                      value={cronField}
                      list={cronSelectList.current}
                      onSelect={(e) => {
                        cronConfig2cronString(e as CronFieldType);
                      }}
                    />
                  </Box>
                </Flex>
                <Flex alignItems={'center'} mt={5}>
                  <Box flex={'0 0 80px'}>时区</Box>
                  <Box flex={'1 0 0'}>
                    <TimezoneSelect
                      value={timezone}
                      onChange={(e) => {
                        setValue('timezone', e);
                      }}
                    />
                  </Box>
                </Flex>
                <Box mt={5}>
                  <Box>{t('core.app.schedule.Default prompt')}</Box>
                  <Textarea
                    {...register('defaultPrompt')}
                    rows={8}
                    bg={'myGray.50'}
                    placeholder={t('core.app.schedule.Default prompt placeholder')}
                  />
                </Box>
              </>
            )}
          </ModalBody>
        </MyModal>
      </>
    );
  }, [
    cronConfig2cronString,
    cronField,
    formatLabel,
    isOpen,
    isOpenSchedule,
    onClose,
    onOpen,
    register,
    setValue,
    t,
    timezone
  ]);

  return Render;
};

export default React.memo(ScheduledTriggerConfig);
