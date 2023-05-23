
<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
         <el-form-item label="账户名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输入用户名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
        <el-form-item label="所属公司" prop="companyId">
          <el-select
              v-model="queryParams.companyId"
              placeholder="请选择所属公司"
              clearable
              style="width: 180px"
          >
            <el-option
                v-for="item in companyOptions"
                :key="item.id"
                :label="item.companyName"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
         <el-form-item label="手机号码" prop="phone">
            <el-input
               v-model="queryParams.phone"
               placeholder="请输入手机号码"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="openSelectUser"
               v-hasPermi="['system:role:add']"
            >添加用户</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="CircleClose"
               :disabled="multiple"
               @click="cancelAuthUserAll"
               v-hasPermi="['system:role:remove']"
            >批量取消授权</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button 
               type="warning" 
               plain 
               icon="Close"
               @click="handleClose"
            >关闭</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="账户名称" prop="name" :show-overflow-tooltip="true" />
         <el-table-column label="所属公司" align="center" prop="company.companyName" width="150" :show-overflow-tooltip='true' />
         <el-table-column label="所属部门" align="center" prop="dept.deptName" width="120" />
         <el-table-column label="工号" prop="workNo" :show-overflow-tooltip="true" />
         <el-table-column label="工作邮箱" prop="workEmail" width="150" :show-overflow-tooltip="true" />
         <el-table-column label="手机号码" prop="phone" width="120" :show-overflow-tooltip="true" />
         <el-table-column label="头像" align="center" prop="avatar" width="120">
           <template #default="scope">
             <image-preview :src="scope.row.avatar" :width="30" :height="30"/>
           </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="150">
            <template #default="scope">
               <el-button link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">取消授权</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
      <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
   </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser";
import {listAllCompany} from "@/api/system/company";
import { allocatedUserList, authAccountCancel, authAccountCancelAll } from "@/api/system/role";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const accountList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const accountIds = ref([]);
const companyOptions = ref(undefined);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  name: undefined,
  companyId: null,
  phone: undefined,
});

/** 查询有效公司 */
function getCompanyOptions() {
  listAllCompany().then(response => {
    companyOptions.value = response.data;
  });
}
/** 查询授权用户列表 */
function getList() {
  loading.value = true;
  allocatedUserList(queryParams).then(response => {
    accountList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 返回按钮
function handleClose() {
  const obj = { path: "/system/role" };
  proxy.$tab.closeOpenPage(obj);
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// 多选框选中数据
function handleSelectionChange(selection) {
  accountIds.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  proxy.$refs["selectRef"].show();
}
/** 取消授权按钮操作 */
function cancelAuthUser(row) {
  proxy.$modal.confirm('确认要取消该用户"' + row.name + '"角色吗？').then(function () {
    return authAccountCancel({ accountId: row.id, roleId: queryParams.roleId });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => {});
}
/** 批量取消授权按钮操作 */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId;
  const uIds = accountIds.value.join(",");
  proxy.$modal.confirm("是否取消选中用户授权数据项?").then(function () {
    return authAccountCancelAll({ roleId: roleId, accountIds: uIds });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => {});
}
getCompanyOptions();
getList();
</script>
