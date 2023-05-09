import request from '@/utils/request'

// 查询终端类型列表
export function listTerminaltype(query) {
  return request({
    url: '/system/terminaltype/list',
    method: 'get',
    params: query
  })
}

// 查询终端类型详细
export function getTerminaltype(id) {
  return request({
    url: '/system/terminaltype/' + id,
    method: 'get'
  })
}

// 新增终端类型
export function addTerminaltype(data) {
  return request({
    url: '/system/terminaltype',
    method: 'post',
    data: data
  })
}

// 修改终端类型
export function updateTerminaltype(data) {
  return request({
    url: '/system/terminaltype',
    method: 'put',
    data: data
  })
}

// 删除终端类型
export function delTerminaltype(id) {
  return request({
    url: '/system/terminaltype/' + id,
    method: 'delete'
  })
}
