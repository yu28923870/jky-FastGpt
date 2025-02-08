import { Box, Card, Flex, Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { exportAllChatLogs } from '@/web/core/app/api';
import DateRangePicker, { DateRangeType } from '@fastgpt/web/components/common/DateRangePicker';
import { addDays } from 'date-fns';
import type { GetAllChatLogsParams } from '@/global/core/api/appReq.d';
import { exportExcel } from '@/service/utils/log/exportExcel';
import { useUserStore } from '@/web/support/user/useUserStore';

const LogsManage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userInfo } = useUserStore();
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: addDays(new Date(), -7),
    to: new Date()
  });

  return (
    <Box py={[3, '28px']} px={['5vw', '64px']}>
      <Flex alignItems={'center'} fontSize={'xl'} h={'30px'}>
        <MyIcon mr={2} name={'support/usage/usageRecordLight'} w={'20px'} />
        {t('user.Logs Manager')}
      </Flex>

      <Card mt={6} px={[3, 10]} py={[3, 7]}>
        <Flex alignItems={'center'} w={['85%', '550px']}>
          <Box flex={'0 0 80px'}>{t('user.Logs Time')}:&nbsp;</Box>
          <Box flex={'0 0 200px'}>
            <DateRangePicker defaultDate={dateRange} position="bottom" onChange={setDateRange} />
          </Box>
          <Box flex={'0 0 30px'}></Box>
          <Button
            size={'sm'}
            variant={'whitePrimary'}
            onClick={async () => {
              const params: GetAllChatLogsParams = {
                teamId: String(userInfo?.team.teamId),
                dateStart: dateRange.from || new Date(),
                dateEnd: addDays(dateRange.to || new Date(), 1)
              };
              const datas = await exportAllChatLogs(params);
              // @ts-ignore
              if (datas.length == 0) {
                toast({
                  status: 'warning',
                  title: '无日志'
                });
              } else {
                // @ts-ignore
                exportExcel(datas, '全部应用日志');
              }
            }}
          >
            {t('user.Logs Export')}
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};

export default LogsManage;
