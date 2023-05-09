import request from '@/utils/request'

// 获取路由
export const getRouters = (sysParams) => {
  return request({
    url: '/system/menu/getRouters',
    method: 'get',
    params: sysParams
  })
}