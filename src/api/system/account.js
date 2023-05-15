import request from '@/utils/request'

// 查询账户管理列表
export function listAccount(query) {
  return request({
    url: '/system/account/list',
    method: 'get',
    params: query
  })
}

// 查询账户管理详细
export function getAccount(id) {
  return request({
    url: '/system/account/' + id,
    method: 'get'
  })
}

// 新增账户管理
export function addAccount(data) {
  return request({
    url: '/system/account',
    method: 'post',
    data: data
  })
}

// 修改账户管理
export function updateAccount(data) {
  return request({
    url: '/system/account',
    method: 'put',
    data: data
  })
}

// 删除账户管理
export function delAccount(id) {
  return request({
    url: '/system/account/' + id,
    method: 'delete'
  })
}

// 查询授权角色
export function getAuthRole(accountId) {
  return request({
    url: '/system/account/auth-role/' + accountId,
    method: 'get'
  })
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/system/account/auth-role',
    method: 'put',
    params: data
  })
}


// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    url: '/system/account/deptTree',
    method: 'get'
  })
}
