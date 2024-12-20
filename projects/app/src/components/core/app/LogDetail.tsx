import MyIcon from '@fastgpt/web/components/common/Icon';
import { Box, Flex, Switch, type SwitchProps } from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'next-i18next';

// log detail switch
const LDSwitch = (props: SwitchProps) => {
  const { t } = useTranslation();
  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/app/logsLight'} mr={2} w={'20px'} />
      <Box fontWeight={'medium'}>{t('core.app.Log Detail')}</Box>
      <Box flex={1} />
      <Switch {...props} />
    </Flex>
  );
};

export default LDSwitch;
