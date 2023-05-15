<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
              v-model="deptName"
              placeholder="请输入部门名称"
              clearable
              prefix-icon="Search"
              style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
              :data="deptOptions"
              :props="{ label: 'label', children: 'children' }"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              ref="deptTreeRef"
              node-key="id"
              highlight-current
              default-expand-all
              @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item label="账户名称" prop="name">
            <el-input
                v-model="queryParams.name"
                placeholder="请输入账户名称"
                clearable
                style="width: 180px"
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
                style="width: 180px"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="工号" prop="workNo">
            <el-input
                v-model="queryParams.workNo"
                placeholder="请输入工号"
                clearable
                style="width: 180px"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="工作邮箱" prop="workEmail">
            <el-input
                v-model="queryParams.workEmail"
                placeholder="请输入工作邮箱"
                clearable
                style="width: 180px"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 180px" >
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
                type="primary"
                plain
                icon="Plus"
                @click="handleAdd"
                v-hasPermi="['system:account:add']"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="success"
                plain
                icon="Edit"
                :disabled="single"
                @click="handleUpdate"
                v-hasPermi="['system:account:edit']"
            >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="danger"
                plain
                icon="Delete"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['system:account:remove']"
            >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['system:account:export']"
            >导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column label="主键" align="center" prop="id" v-if="columns[0].visible"/>
          <el-table-column label="账户名称" align="center" prop="name" v-if="columns[1].visible"/>
          <el-table-column label="所属公司" align="center" prop="company.companyName" width="150" :show-overflow-tooltip='true' v-if="columns[2].visible"/>
          <el-table-column label="用户ID" align="center" prop="userId" width="120" v-if="columns[3].visible"/>
          <el-table-column label="所属部门" align="center" prop="dept.deptName" width="120" v-if="columns[4].visible"/>
          <el-table-column label="手机号码" align="center" prop="phone" width="150" v-if="columns[5].visible"/>
          <el-table-column label="工号" align="center" prop="workNo" width="120" v-if="columns[6].visible"/>
          <el-table-column label="工作邮箱" align="center" prop="workEmail" width="120" v-if="columns[7].visible"/>
          <el-table-column label="头像" align="center" prop="avatar" width="120" v-if="columns[8].visible">
            <template #default="scope">
              <image-preview :src="scope.row.avatar" :width="30" :height="30"/>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" v-if="columns[9].visible">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160" v-if="columns[10].visible" />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160" v-if="columns[11].visible" />
          <el-table-column label="备注" align="center" prop="remark" width="120" v-if="columns[12].visible"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="150">
            <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                           v-hasPermi="['system:account:edit']">
                </el-button>
              </el-tooltip>
              <el-tooltip content="修改" placement="top">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                           v-hasPermi="['system:account:remove']">
                </el-button>
              </el-tooltip>
              <el-tooltip content="分配角色" placement="top" >
                <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)"
                           v-hasPermi="['system:account:edit']"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <pagination
            v-show="total>0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
        />
      </el-col>
    </el-row>
    <!-- 添加或修改账户管理对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="accountRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="账户名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入账户名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属公司ID" prop="companyId">
              <el-input v-model="form.companyId" placeholder="请输入所属公司ID"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                  v-model="form.deptId"
                  :data="deptOptions"
                  :props="{ value: 'id', label: 'label', children: 'children' }"
                  value-key="id"
                  placeholder="请选择归属部门"
                  check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                    v-for="item in postOptions"
                    :key="item.id"
                    :label="item.postName"
                    :value="item.id"
                    :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                    v-for="item in roleOptions"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
                    :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号码"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="工号" prop="workNo">
              <el-input v-model="form.workNo" placeholder="请输入工号"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作邮箱" prop="workEmail">
              <el-input v-model="form.workEmail" placeholder="请输入工作邮箱"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="头像" prop="avatar">
              <image-upload v-model="form.avatar"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Account">
import {listAccount, addAccount, delAccount, getAccount, updateAccount,deptTreeSelect} from "@/api/system/account";
import {optionSelect} from "@/api/system/post";
import {listAllRoles} from "@/api/system/role";
import {listAllCompany} from "@/api/system/company";

const router = useRouter();
const {proxy} = getCurrentInstance();
const {sys_normal_disable} = proxy.useDict('sys_normal_disable');

const accountList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const deptName = ref("");
const deptOptions = ref(undefined);
const companyOptions = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);

// 列显隐信息
const columns = ref([
  {key: 0, label: `主键`, visible: true},
  {key: 1, label: `账户名称`, visible: true},
  {key: 2, label: `所属公司ID`, visible: true},
  {key: 3, label: `用户ID`, visible: true},
  {key: 4, label: `部门ID`, visible: true},
  {key: 5, label: `手机号码`, visible: true},
  {key: 6, label: `工号`, visible: true},
  {key: 7, label: `工作邮箱`, visible: true},
  {key: 8, label: `头像`, visible: true},
  {key: 9, label: `状态`, visible: true},
  {key: 10, label: `创建时间`, visible: true},
  {key: 11, label: `更新时间`, visible: true},
  {key: 12, label: `备注`, visible: true},
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    companyId: null,
    deptId: null,
    phone: null,
    workNo: null,
    workEmail: null,
    status: null,
  },
  rules: {
    companyId: [
      {required: true, message: "所属公司不能为空", trigger: "blur"}
    ],
    deptId: [
      {required: true, message: "部门不能为空", trigger: "blur"}
    ],
    phone: [
      {required: true, message: "手机号码不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
}

/** 查询有效公司 */
function getCompanyOptions() {
  listAllCompany().then(response => {
    companyOptions.value = response.data;
  });
}

/**
 * 获取所有职位
 */
function getPostOption() {
  optionSelect().then(response => {
    postOptions.value = response.data;
  });
}
/**
 * 获取所有角色
 */
function getRoleOption() {
  listAllRoles().then(response => {
    roleOptions.value = response.data;
  });
}
/** 查询账户管理列表 */
function getList() {
  loading.value = true;
  listAccount(queryParams.value).then(response => {
    accountList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    companyId: null,
    userId: null,
    deptId: null,
    phone: null,
    workNo: null,
    workEmail: null,
    avatar: null,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    postIds: [],
    roleIds: []
  };
  proxy.resetForm("accountRef");
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  //重置部门选中
  queryParams.value.deptId = null;
  proxy.$refs["deptTreeRef"].setCurrentKey(null);
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加账户管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getAccount(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改账户管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accountRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除账户管理编号为"' + _ids + '"的数据项？').then(function () {
    return delAccount(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/account/export', {
    ...queryParams.value
  }, `account_${new Date().getTime()}.xlsx`)
}

/** 跳转角色分配 */
function handleAuthRole(row) {
  const id = row.id;
  router.push("/system/account-auth/role/" + id);
};

getList();
getDeptTree();
getCompanyOptions();
getPostOption();
getRoleOption();
</script>
