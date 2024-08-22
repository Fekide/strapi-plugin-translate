// MIT License

// Copyright (c) 2022 minzig

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

module.exports = {
  async getSuperAdminRole() {
    try {
      await strapi.admin.services.role.createRolesIfNoneExist()
    } catch (e) {
      strapi.log.error(`Couldn't check for & create existing roles.`, e)
    }

    let superAdminRole = await strapi.db.query('admin::role').findOne({
      select: [],
      where: { code: 'strapi-super-admin' },
      orderBy: {},
      populate: {},
    })

    if (!superAdminRole) {
      superAdminRole = await strapi.db.query('admin::role').create({
        data: {
          name: 'Super Admin',
          code: 'strapi-super-admin',
          description:
            'Super Admins can access and manage all features and settings.',
        },
      })
    }

    return superAdminRole
  },
  initAdminData(env) {
    const useJsonData = (initAdminString) => {
      let adminData = {}
      try {
        adminData = JSON.parse(initAdminString)
      } catch (e) {
        strapi.log.error(`Couldn't parse adminData from INIT_ADMIN.`, e)
      }
      return adminData
    }
    return {
      username: env.INIT_ADMIN_USERNAME || 'admin',
      password: env.INIT_ADMIN_PASSWORD || 'admin',
      firstname: env.INIT_ADMIN_FIRSTNAME || 'Admin',
      lastname: env.INIT_ADMIN_LASTNAME || 'Admin',
      email: env.INIT_ADMIN_EMAIL || 'admin@init-strapi-admin.strapi.io',
      blocked: false,
      isActive: true,
      ...(typeof env.INIT_ADMIN === 'string' &&
        env.INIT_ADMIN.includes('{"') && {
          ...useJsonData(env.INIT_ADMIN),
        }),
    }
  },
}
