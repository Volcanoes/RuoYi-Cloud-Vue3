<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="qry-parms">
      <el-form-item label="系统编码" prop="systemCode">
        <el-input
            v-model="queryParams.systemCode"
            placeholder="请输入系统编码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统名称" prop="systemName">
        <el-input
            v-model="queryParams.systemName"
            placeholder="请输入系统名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
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
            v-hasPermi="['system:system:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:system:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:system:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:system:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="systemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="columns[0].visible"/>
      <el-table-column label="系统编码" align="center" prop="systemCode" width="120" v-if="columns[1].visible"/>
      <el-table-column label="系统名称" align="center" prop="systemName" width="120" v-if="columns[2].visible"/>
      <el-table-column label="状态" align="center" prop="status" v-if="columns[3].visible">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="展示顺序" align="center" prop="sort" v-if="columns[4].visible"/>
      <el-table-column label="备注" align="center" prop="remark" width="120" v-if="columns[5].visible"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed = "right" width="150">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" >
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:system:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" >
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:system:remove']"></el-button>
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

    <!-- 添加或修改系统管理对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="systemRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="系统编码" prop="systemCode">
              <el-input v-model="form.systemCode" placeholder="请输入系统编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="form.systemName" placeholder="请输入系统名称" />
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
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="展示顺序" prop="sort">
              <el-input v-model="form.sort" placeholder="请输入展示顺序" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="System">
import {listSystem, addSystem, delSystem, getSystem, updateSystem } from "@/api/system/system";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const systemList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 列显隐信息
const columns = ref([
  {key: 0, label: `主键`, visible: true},
  {key: 1, label: `系统编码`, visible: true},
  {key: 2, label: `系统名称`, visible: true},
  {key: 3, label: `状态`, visible: true},
  {key: 4, label: `展示顺序`, visible: true},
  {key: 5, label: `备注`, visible: true},
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    systemCode: null,
    systemName: null,
    status: null,
  },
  rules: {
    systemCode: [
      { required: true, message: "系统编码不能为空", trigger: "blur" }
    ],
    systemName: [
      { required: true, message: "系统名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统管理列表 */
function getList() {
  loading.value = true;
  listSystem(queryParams.value).then(response => {
    systemList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  }).catch(() => {
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
    systemCode: null,
    systemName: null,
    status: 0,
    sort: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("systemRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
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
  title.value = "添加系统管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSystem(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改系统管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["systemRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSystem(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSystem(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除系统管理编号为"' + _ids + '"的数据项？').then(function() {
    return delSystem(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/system/export', {
    ...queryParams.value
  }, `system_${new Date().getTime()}.xlsx`)
}

getList();
</script>
