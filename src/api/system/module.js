import request from '@/utils/request'

// 查询系统模块列表
export function listModule(query) {
  return request({
    url: '/system/module/list',
    method: 'get',
    params: query
  })
}

// 查询系统模块详细
export function getModule(id) {
  return request({
    url: '/system/module/' + id,
    method: 'get'
  })
}

// 新增系统模块
export function addModule(data) {
  return request({
    url: '/system/module',
    method: 'post',
    data: data
  })
}

// 修改系统模块
export function updateModule(data) {
  return request({
    url: '/system/module',
    method: 'put',
    data: data
  })
}

// 删除系统模块
export function delModule(id) {
  return request({
    url: '/system/module/' + id,
    method: 'delete'
  })
}
