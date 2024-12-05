import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Button, useDisclosure, useTheme, Input } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { UserUpdateParams } from '@/types/user';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useUserStore } from '@/web/support/user/useUserStore';
import type { UserType } from '@fastgpt/global/support/user/type.d';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import { putUpdateMemberName } from '@/web/support/user/team/api';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';

const TeamMenu = dynamic(() => import('@/components/support/user/team/TeamMenu'));
const UpdatePswModal = dynamic(() => import('./UpdatePswModal'));

const Account = () => {
  const { isPc } = useSystemStore();

  const { initUserInfo } = useUserStore();

  useQuery(['init'], initUserInfo);

  return (
    <Box py={[3, '28px']} px={['5vw', '64px']}>
      {isPc ? (
        <Flex justifyContent={'center'}>
          <Box flex={'0 0 330px'}>
            <MyInfo />
          </Box>
        </Flex>
      ) : (
        <>
          <MyInfo />
        </>
      )}
    </Box>
  );
};

export default React.memo(Account);

const MyInfo = () => {
  const theme = useTheme();
  const { feConfigs } = useSystemStore();
  const { t } = useTranslation();
  const { userInfo, updateUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserType
  });
  const { isPc } = useSystemStore();

  const { toast } = useToast();

  const {
    isOpen: isOpenUpdatePsw,
    onClose: onCloseUpdatePsw,
    onOpen: onOpenUpdatePsw
  } = useDisclosure();
  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onclickSave = useCallback(
    async (data: UserType) => {
      await updateUserInfo({
        avatar: data.avatar,
        timezone: data.timezone,
        openaiAccount: data.openaiAccount
      });
      reset(data);
      toast({
        title: t('dataset.data.Update Success Tip'),
        status: 'success'
      });
    },
    [reset, t, toast, updateUserInfo]
  );

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file || !userInfo) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.userAvatar,
          file,
          maxW: 300,
          maxH: 300
        });

        onclickSave({
          ...userInfo,
          avatar: src
        });
      } catch (err: any) {
        toast({
          title: typeof err === 'string' ? err : t('common.error.Select avatar failed'),
          status: 'warning'
        });
      }
    },
    [onclickSave, t, toast, userInfo]
  );

  return (
    <Box>
      {/* user info */}
      {isPc && (
        <Flex alignItems={'center'} fontSize={'xl'} h={'30px'}>
          <MyIcon mr={2} name={'support/user/userLight'} w={'20px'} />
          {t('support.user.User self info')}
        </Flex>
      )}

      <Box mt={[0, 6]}>
        {isPc ? (
          <Flex alignItems={'center'} cursor={'pointer'}>
            <Box flex={'0 0 80px'}>{t('support.user.Avatar')}:&nbsp;</Box>

            <MyTooltip label={t('common.avatar.Select Avatar')}>
              <Box
                w={['44px', '56px']}
                h={['44px', '56px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                p={'2px'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                mb={2}
                onClick={onOpenSelectFile}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>
          </Flex>
        ) : (
          <Flex
            flexDirection={'column'}
            alignItems={'center'}
            cursor={'pointer'}
            onClick={onOpenSelectFile}
          >
            <MyTooltip label={t('common.avatar.Select Avatar')}>
              <Box
                w={['44px', '54px']}
                h={['44px', '54px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                p={'2px'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                mb={2}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>

            <Flex alignItems={'center'} fontSize={'sm'} color={'myGray.600'}>
              <MyIcon mr={1} name={'edit'} w={'14px'} />
              {t('user.Replace')}
            </Flex>
          </Flex>
        )}
        {feConfigs.isPlus && (
          <Flex mt={[0, 4]} alignItems={'center'}>
            <Box flex={'0 0 80px'}>{t('user.Member Name')}:&nbsp;</Box>
            <Input
              flex={'1 0 0'}
              defaultValue={userInfo?.team?.memberName || 'Member'}
              title={t('user.Edit name')}
              borderColor={'transparent'}
              transform={'translateX(-11px)'}
              maxLength={20}
              onBlur={(e) => {
                const val = e.target.value;
                if (val === userInfo?.team?.memberName) return;
                try {
                  putUpdateMemberName(val);
                } catch (error) {}
              }}
            />
          </Flex>
        )}
        <Flex alignItems={'center'} mt={6}>
          <Box flex={'0 0 80px'}>{t('user.Account')}:&nbsp;</Box>
          <Box flex={1}>{userInfo?.username}</Box>
        </Flex>
        {feConfigs.isPlus && (
          <Flex mt={6} alignItems={'center'}>
            <Box flex={'0 0 80px'}>{t('user.Password')}:&nbsp;</Box>
            <Box flex={1}>*****</Box>
            <Button size={'sm'} variant={'whitePrimary'} onClick={onOpenUpdatePsw}>
              {t('user.Change')}
            </Button>
          </Flex>
        )}
        <Flex mt={6} alignItems={'center'}>
          <Box flex={'0 0 80px'}>{t('user.Team')}:&nbsp;</Box>
          <Box flex={1}>
            <TeamMenu />
          </Box>
        </Flex>
      </Box>
      {isOpenUpdatePsw && <UpdatePswModal onClose={onCloseUpdatePsw} />}
      <File onSelect={onSelectFile} />
    </Box>
  );
};
