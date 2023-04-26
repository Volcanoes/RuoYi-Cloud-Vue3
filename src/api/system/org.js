import request from '@/utils/request'

// 查询企业管理列表
export function listOrg(query) {
  return request({
    url: '/system/org/list',
    method: 'get',
    params: query
  })
}

// 查询企业管理详细
export function getOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'get'
  })
}

// 新增企业管理
export function addOrg(data) {
  return request({
    url: '/system/org',
    method: 'post',
    data: data
  })
}

// 修改企业管理
export function updateOrg(data) {
  return request({
    url: '/system/org',
    method: 'put',
    data: data
  })
}

// 删除企业管理
export function delOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'delete'
  })
}
