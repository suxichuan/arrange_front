import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },

  {
    path: '/arrange',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: '排班计划管理', icon: 'plan' },
    children: [
      {
        path: 'current_duty',
        name: 'CurrentDuty',
        component: () => import('@/views/plan/currenttable'),
        meta: { title: '今日值班人员信息', icon: 'week' }
      },
      {
        path: 'weektable',
        name: 'WeekTable',
        component: () => import('@/views/plan/week'),
        meta: { title: '按周排班', icon: 'week' }
      },
      {
        path: 'monthtable',
        name: 'MonthTable',
        component: () => import('@/views/plan/index'),
        meta: { title: '按月排班', icon: 'month' }
      }
      // ,
      // {
      //   path: 'settingtable',
      //   name: 'SettingTable',
      //   component: () => import('@/views/table/index'),
      //   meta: { title: '自定义排班', icon: 'setting' }
      // }
    ]
  },
  {
    path: '/employee',
    component: Layout,
    name: 'Employee',
    meta: { title: '员工管理', icon: 'employee' },
    children: [
      {
        path: 'list',
        name: 'employeeList',
        component: () => import('@/views/employee/index'),
        meta: { title: '员工列表', icon: 'employee' }
      },
      {
        path: 'add',
        name: 'addEmployee',
        component: () => import('@/views/employee/addEmploy'),
        meta: { title: '添加员工', icon: 'addemploy' }
      }
    ]
  },

  {
    path: '/dutyplace',
    component: Layout,
    children: [
      {
        path: 'placetable',
        name: 'DutyPlace',
        component: () => import('@/views/place/index'),
        meta: { title: '值班地点管理', icon: 'address' }
      }
    ]
  },
  {
    path: '/analyse',
    component: Layout,
    children: [{
      path: 'table',
      name: 'Analyse',
      component: () => import('@/views/analyse/analyse'),
      meta: { title: '统计与分析', icon: 'el-icon-pie-chart' }
    }]
  },

  {
    path: '/setting',
    component: Layout,
    name: 'Employee',
    meta: { title: '设置', icon: 'el-icon-setting' },
    children: [
      {
        path: 'minorityfamilyholidayssetting',
        name: 'MinorityFamilyHolidays',
        component: () => import('@/views/settings/minorityfamilyholidays'),
        meta: { title: '少数民族节假日设置', icon: '' }
      },
      {
        path: 'rolesetting',
        name: 'Role',
        component: () => import('@/views/settings/role'),
        meta: { title: '人员角色设置', icon: '' }
      },
      {
        path: 'statussetting',
        name: 'Status',
        component: () => import('@/views/settings/status'),
        meta: { title: '人员状态设置', icon: '' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
