import { Core } from '@strapi/strapi';
import service from '../untranslated';

describe('untranslated service', () => {
  describe('getUntranslatedEntity', () => {
    it('throws Error if Metadata is not found', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => null),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid: 'uid', sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type does not exist');
    });

    it('throws Error if content table is not localized', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => ({
              attributes: {
                localizations: {},
              },
            })),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid: 'uid', sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type not localized');
    });
  });

  describe('getUntranslatedEntityIDs', () => {
    it('throws Error if Metadata is not found', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => null),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid: 'uid', sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type does not exist');
    });

    it('throws Error if content table is not localized', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => ({
              attributes: {
                localizations: {},
              },
            })),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid: 'uid', sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type not localized');
    });
  });

  describe('isFullyTranslated', () => {
    it('throws Error if Metadata is not found', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => null),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () => untranslatedService.isFullyTranslated('uid', {})).rejects.toThrow(
        'Content Type does not exist'
      );
    });

    it('throws Error if content table is not localized', () => {
      const strapi = {
        db: {
          metadata: {
            get: jest.fn(() => ({
              attributes: {
                localizations: {},
              },
            })),
          },
        },
      } as any as Core.Strapi;

      const untranslatedService = service({ strapi });

      return expect(async () => untranslatedService.isFullyTranslated('uid', {})).rejects.toThrow(
        'Content Type not localized'
      );
    });
  });
});
