<template>
   <!-- 授权用户 -->
   <el-dialog title="选择用户" v-model="visible" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="用户名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输入用户名称"
               clearable
               style="width: 200px"
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
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>
      <el-row>
         <el-table @row-click="clickRow" ref="refTable" :data="accountList" @selection-change="handleSelectionChange" height="260px">
           <el-table-column type="selection" width="55"></el-table-column>
           <el-table-column label="账户名称" prop="name" :show-overflow-tooltip="true" />
           <el-table-column label="所属公司" align="center" prop="company.companyName" width="150" :show-overflow-tooltip='true' />
           <el-table-column label="所属部门" align="center" prop="dept.deptName" width="120" />
           <el-table-column label="工号" prop="workNo" :show-overflow-tooltip="true" />
           <el-table-column label="工作邮箱" prop="workEmail" :show-overflow-tooltip="true" />
           <el-table-column label="手机号码" prop="phone" :show-overflow-tooltip="true" />
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
         </el-table>
         <pagination
            v-show="total > 0"
            :total="total"
            :autoScroll="false"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
         />
      </el-row>
      <template #footer>
         <div class="dialog-footer">
            <el-button type="primary" @click="handleSelectUser">确 定</el-button>
            <el-button @click="visible = false">取 消</el-button>
         </div>
      </template>
   </el-dialog>
</template>

<script setup name="SelectUser">
import { authAccountSelectAll, unallocatedAccountList } from "@/api/system/role";
import {listAllCompany} from "@/api/system/company";
const props = defineProps({
  roleId: {
    type: [Number, String]
  }
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const accountList = ref([]);
const visible = ref(false);
const total = ref(0);
const accountIds = ref([]);
const companyOptions = ref(undefined);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  name: undefined,
  companyId: null,
  phone: undefined
});

/** 查询有效公司 */
function getCompanyOptions() {
  listAllCompany().then(response => {
    companyOptions.value = response.data;
  });
}
// 显示弹框
function show() {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
}
/**选择行 */
function clickRow(row) {
  proxy.$refs["refTable"].toggleRowSelection(row);
}
// 多选框选中数据
function handleSelectionChange(selection) {
  accountIds.value = selection.map(item => item.id);
}
// 查询表数据
function getList() {
  unallocatedAccountList(queryParams).then(res => {
    accountList.value = res.rows;
    total.value = res.total;
  });
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
const emit = defineEmits(["ok"]);
/** 选择授权用户操作 */
function handleSelectUser() {
  const roleId = queryParams.roleId;
  const uIds = accountIds.value.join(",");
  if (uIds == "") {
    proxy.$modal.msgError("请选择要分配的用户");
    return;
  }
  authAccountSelectAll({ roleId: roleId, accountIds: uIds }).then(res => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit("ok");
    }
  });
}
getCompanyOptions();
defineExpose({
  show,
});
</script>
