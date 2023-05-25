import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(id) {
  return request({
    url: '/system/role/' + id,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/system/role',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(id) {
  return request({
    url: '/system/role/' + id,
    method: 'delete'
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return request({
    url: '/system/role/authAccount/allocatedList',
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedAccountList(query) {
  return request({
    url: '/system/role/authAccount/unallocatedList',
    method: 'get',
    params: query
  })
}

// 取消用户授权角色
export function authAccountCancel(data) {
  return request({
    url: '/system/role/authAccount/cancel',
    method: 'put',
    data: data
  })
}

// 批量取消用户授权角色
export function authAccountCancelAll(data) {
  return request({
    url: '/system/role/authAccount/cancelAll',
    method: 'put',
    params: data
  })
}

// 授权用户选择
export function authAccountSelectAll(data) {
  return request({
    url: '/system/role/authAccount/selectAll',
    method: 'put',
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(id) {
  return request({
    url: '/system/role/deptTree/' + id,
    method: 'get'
  })
}
//获取所有角色
export function listAllRoles() {
  return request({
    url: '/system/role/list-all',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function getBindRoles(menuId) {
  return request({
    url: '/system/role/get-bind-roles/' + menuId,
    method: 'get'
  })
}

// 删除菜单关联的角色，只支持单个删除
export function delMenuRole(params) {
  return request({
    url: '/system/role/delete-menu-role',
    method: 'delete',
    params: params
  })
}

// 根据menuId和条件查询角色列表
export function menuUnallocatedList(query) {
  return request({
    url: '/system/role/auth-menu/unallocated-list',
    method: 'get',
    params: query
  })
}

// 菜单授权批量选择
export function menuBatchAuthRoles(data) {
  return request({
    url: '/system/role/auth-menu/bath-auth',
    method: 'put',
    params: data
  })
}