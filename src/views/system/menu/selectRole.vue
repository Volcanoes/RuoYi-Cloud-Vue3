<template>
   <!-- 授权角色 -->
   <el-dialog title="选择角色" v-model="visible" width="900px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryRef" :inline="true" class="qry-parms">
        <el-form-item label="角色名称" prop="roleName">
          <el-input
              v-model="queryParams.roleName"
              placeholder="请输入角色名称"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input
              v-model="queryParams.roleCode"
              placeholder="请输入角色编码"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="所属系统" prop="systemId">
          <el-select
              v-model="queryParams.systemId"
              placeholder="请选择所属系统"
              clearable
              @change="dataSystemSelectChange"
          >
            <el-option
                v-for="sys in systemOptions"
                :key="sys.id"
                :label="sys.systemName"
                :value="sys.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="系统模块" prop="moduleId">
          <el-select
              v-model="queryParams.moduleId"
              placeholder="请选择系统模块"
              clearable
              :disabled="mouduleSelectDisabled"
          >
            <el-option
                v-for="mod in moduleOptions"
                :key="mod.id"
                :label="mod.moduleName"
                :value="mod.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
              v-model="queryParams.status"
              placeholder="角色状态"
              clearable
          >
            <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>
      <el-row>
         <el-table @row-click="clickRow" ref="refTable" :data="roleList" @selection-change="handleSelectionChange" height="260px">
           <el-table-column type="selection" width="55px"></el-table-column>
           <el-table-column label="角色ID" prop="id" width="80px"/>
           <el-table-column label="角色编码" prop="roleCode" :show-overflow-tooltip="true"  />
           <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true"  />
           <el-table-column label="所属系统" prop="systemName" :show-overflow-tooltip="true" />
           <el-table-column label="系统模块" prop="moduleName" :show-overflow-tooltip="true" />
           <el-table-column label="显示顺序" prop="roleSort" width="80px"/>
           <el-table-column label="状态" align="center" prop="status" width="80px">
             <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
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
            <el-button type="primary" @click="handleSelectRole">确 定</el-button>
            <el-button @click="cancelSelectRole">取 消</el-button>
         </div>
      </template>
   </el-dialog>
</template>

<script setup name="SelectRole">
import { menuUnallocatedList,menuBatchAuthRoles} from "@/api/system/role";
import { listAllSystem } from "@/api/system/system";
import { listAvailableModule } from "@/api/system/module";
const props = defineProps({
  menuId: {
    type: [Number, String]
  }
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const roleList = ref([]);
const visible = ref(false);
const total = ref(0);
const roleIds = ref([]);
const systemOptions = ref(undefined);
const moduleOptions = ref(undefined);
const mouduleSelectDisabled = ref(true);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    menuId: undefined,
    roleName: undefined,
    roleCode: undefined,
    systemId: undefined,
    moduleId: undefined,
    status: undefined
  }
});

const { queryParams } = toRefs(data);

/** 查询系统数据 */
function getSystemOptions() {
  listAllSystem().then(response => {
    systemOptions.value = response.data;
  });
};

/** 选择系统触发模块选择 */
function dataSystemSelectChange(value) {
  console.log(queryParams.value)
  queryParams.value.moduleId = undefined;
  moduleOptions.value = undefined;
  if(!value){
    mouduleSelectDisabled.value = true;
    return;
  }
  const qryParams = {
    systemId: value,
  }
  listAvailableModule(qryParams).then(response => {
    moduleOptions.value = response.data;
    if (response.data) {
      mouduleSelectDisabled.value = false;
    }
  });
}


// 显示弹框
function show() {
  queryParams.menuId = props.menuId;
  getList();
  visible.value = true;
}
/**选择行 */
function clickRow(row) {
  proxy.$refs["refTable"].toggleRowSelection(row);
}
// 多选框选中数据
function handleSelectionChange(selection) {
  roleIds.value = selection.map(item => item.id);
}
// 查询表数据
function getList() {
  menuUnallocatedList(queryParams).then(res => {
    roleList.value = res.rows;
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
/** 选择授权角色操作 */
function handleSelectRole() {
  const menuId = queryParams.menuId;
  const rIds = roleIds.value.join(",");
  if (rIds == "") {
    proxy.$modal.msgError("请选择要分配的角色");
    return;
  }
  menuBatchAuthRoles({ menuId: menuId, roleIds: rIds }).then(res => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit("ok");
    }
  });
}

function cancelSelectRole() {
  proxy.resetForm("queryRef");
  visible.value = false;
}
getSystemOptions();
defineExpose({
  show,
});
</script>
