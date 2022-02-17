import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { Select, Option } from '@strapi/design-system/Select';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Divider } from '@strapi/design-system/Divider';
import { Typography } from '@strapi/design-system/Typography';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';
import ExclamationMarkCircle from '@strapi/icons/ExclamationMarkCircle';
import Duplicate from '@strapi/icons/Duplicate';
import { useCMEditViewDataManager, useNotification, useQueryParams } from '@strapi/helper-plugin';
import { axiosInstance } from '@strapi/plugin-i18n/admin/src/utils';
import { getTrad } from '../../utils'
import { cleanData, generateOptions } from '@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewCopyLocale/utils';
import useContentTypePermissions from '@strapi/plugin-i18n/admin/src/hooks/useContentTypePermissions'
import selectI18NLocales from '@strapi/plugin-i18n/admin/src/selectors/selectI18nLocales';

const StyledTypography = styled(Typography)`
  svg {
    margin-right: ${({ theme }) => theme.spaces[2]};
    fill: none;
    > g,
    path {
      fill: ${({ theme }) => theme.colors.primary600};
    }
  }
`;

const CenteredTypography = styled(Typography)`
  text-align: center;
`;

const CMEditViewTranslateLocale = () => {
  const [{ query }] = useQueryParams();
  const locales = useSelector(selectI18NLocales);
  const { layout, modifiedData, slug } = useCMEditViewDataManager();
  const { readPermissions } = useContentTypePermissions(slug);

  const defaultLocale = locales.find(loc => loc.isDefault);
  const currentLocale = get(query, 'plugins.i18n.locale', defaultLocale.code);
  const hasI18nEnabled = get(layout, ['pluginOptions', 'i18n', 'localized'], false);
  const localizations = get(modifiedData, 'localizations', []);

  if (!hasI18nEnabled || !localizations.length) {
    return null;
  }

  return <Content {...{appLocales: locales, currentLocale, localizations, readPermissions} } />;
};

const Content = ({ appLocales, currentLocale, localizations, readPermissions }) => {
  const { allLayoutData, initialData, slug } = useCMEditViewDataManager();


  const options = generateOptions(appLocales, currentLocale, localizations, readPermissions);


  const toggleNotification = useNotification();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(options[0]?.value || '');

  const handleConfirmCopyLocale = async () => {
    if (!value) {
      handleToggle();

      return;
    }

    const requestDataURL = `/content-manager/collection-types/${slug}/${value}`;
    const translateURL = `/deepl/translate`;

    setIsLoading(true);
    try {
      const { data: response } = await axiosInstance.get(requestDataURL);

      const cleanedData = cleanData(response, allLayoutData, localizations);
      // TODO: get non-localized fields
      // '/content-manager/actions/get-non-localized-fields'

      const {locale: sourceLocale} = localizations.find(({id}) => id == value)
      const {data: translatedData} = await axiosInstance.post(translateURL, {
        data: cleanedData,
        sourceLocale,
        targetLocale: currentLocale
      });

      ['createdBy', 'updatedBy', 'publishedAt', 'id', 'createdAt'].forEach(key => {
        if (!initialData[key]) return;
        translatedData[key] = initialData[key];
      });


      dispatch({ type: 'ContentManager/CrudReducer/GET_DATA_SUCCEEDED', data: translatedData });

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('CMEditViewTranslateLocale.translate-success'),
          defaultMessage: 'Copied and translated from other locale!',
        },
      });
    } catch (err) {
      console.error(err);

      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad('CMEditViewTranslateLocale.translate-failure'),
          defaultMessage: 'Failed to translate locale',
        },
      });
    } finally {
      setIsLoading(false);
      handleToggle();
    }
  };

  const handleChange = value => {
    setValue(value);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <Box paddingTop={6}>
      <Typography variant="sigma" textColor="neutral600">
        {formatMessage({ id: getTrad('plugin.name'), defaultMessage: 'DeepL' })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>
      <StyledTypography
        fontSize={2}
        textColor="primary600"
        as="button"
        type="button"
        onClick={handleToggle}
      >
        <Flex>
          <Duplicate width="12px" height="12px" />
          {formatMessage({
            id: getTrad('CMEditViewTranslateLocale.translate-text'),
            defaultMessage: 'Translate from another locale',
          })}
        </Flex>
      </StyledTypography>
      {isOpen && (
        <Dialog onClose={handleToggle} title="Confirmation" isOpen={isOpen}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack size={2}>
              <Flex justifyContent="center">
                <CenteredTypography id="confirm-description">
                  {formatMessage({
                    id: getTrad('CMEditViewTranslateLocale.ModalConfirm.content'),
                    defaultMessage:
                      'Your current content will be erased and filled by the translated content of the selected locale:',
                  })}
                </CenteredTypography>
              </Flex>
              <Box>
                <Select
                  label={formatMessage({
                    id: getTrad('Settings.locales.modal.locales.label'),
                  })}
                  onChange={handleChange}
                  value={value}
                >
                  {options.map(({ label, value }) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggle} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button variant="success" onClick={handleConfirmCopyLocale} loading={isLoading}>
                {formatMessage({
                  id: getTrad('CMEditViewTranslateLocale.submit-text'),
                  defaultMessage: 'Yes, fill in',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </Box>
  );
};

Content.propTypes = {
  appLocales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentLocale: PropTypes.string.isRequired,
  localizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
};

export default CMEditViewTranslateLocale;
