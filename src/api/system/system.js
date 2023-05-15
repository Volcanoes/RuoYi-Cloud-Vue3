import request from '@/utils/request'

// 查询系统管理列表
export function listSystem(query) {
  return request({
    url: '/system/system/list',
    method: 'get',
    params: query
  })
}

// 查询系统管理详细
export function getSystem(id) {
  return request({
    url: '/system/system/' + id,
    method: 'get'
  })
}

// 新增系统管理
export function addSystem(data) {
  return request({
    url: '/system/system',
    method: 'post',
    data: data
  })
}

// 修改系统管理
export function updateSystem(data) {
  return request({
    url: '/system/system',
    method: 'put',
    data: data
  })
}

// 删除系统管理
export function delSystem(id) {
  return request({
    url: '/system/system/' + id,
    method: 'delete'
  })
}
//查询所有系统
export function listAllSystem() {
    return request({
      url: '/system/system/list-all',
      method: 'get'
    })
}

