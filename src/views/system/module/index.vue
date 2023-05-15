<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="模块编码" prop="moduleCode">
        <el-input
            v-model="queryParams.moduleCode"
            placeholder="请输入模块编码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模块名称" prop="moduleName">
        <el-input
            v-model="queryParams.moduleName"
            placeholder="请输入模块名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统ID" prop="systemId">
        <el-input
            v-model="queryParams.systemId"
            placeholder="请输入系统ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否显示" prop="isShow">
        <el-select v-model="queryParams.isShow" placeholder="请选择是否显示" clearable>
          <el-option
              v-for="dict in sys_show_hide"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
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
      <el-form-item label="路由地址" prop="routeUrl">
        <el-input
            v-model="queryParams.routeUrl"
            placeholder="请输入路由地址"
            clearable
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
            @click="handleAdd"
            v-hasPermi="['system:module:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:module:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:module:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:module:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="moduleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="columns[0].visible"/>
      <el-table-column label="模块编码" align="center" prop="moduleCode" width="180" v-if="columns[1].visible"/>
      <el-table-column label="模块名称" align="center" prop="moduleName" width="120" v-if="columns[2].visible"/>
      <el-table-column label="系统ID" align="center" prop="systemId" width="120" v-if="columns[3].visible"/>
      <el-table-column label="是否显示" align="center" prop="isShow" v-if="columns[4].visible">
        <template #default="scope">
          <dict-tag :options="sys_show_hide" :value="scope.row.isShow"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" v-if="columns[5].visible">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="路由地址" align="center" prop="routeUrl" width="120" v-if="columns[6].visible"/>
      <el-table-column label="展示顺序" align="center" prop="sort" width="120" v-if="columns[7].visible"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" v-if="columns[8].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" v-if="columns[9].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" width="120" v-if="columns[10].visible"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed = "right" width="150">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" >
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:module:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" >
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:module:remove']"></el-button>
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

    <!-- 添加或修改系统模块对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="moduleRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模块编码" prop="moduleCode">
              <el-input v-model="form.moduleCode" placeholder="请输入模块编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称" prop="moduleName">
              <el-input v-model="form.moduleName" placeholder="请输入模块名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="系统ID" prop="systemId">
              <el-input v-model="form.systemId" placeholder="请输入系统ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否显示" prop="isShow">
              <el-radio-group v-model="form.isShow">
                <el-radio
                    v-for="dict in sys_show_hide"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                >{{dict.label}}</el-radio>
              </el-radio-group>
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
            <el-form-item label="路由地址" prop="routeUrl">
              <el-input v-model="form.routeUrl" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
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

<script setup name="Module">
import {listModule, addModule, delModule, getModule, updateModule } from "@/api/system/module";

const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_show_hide } = proxy.useDict('sys_normal_disable', 'sys_show_hide');

const moduleList = ref([]);
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
  {key: 1, label: `模块编码`, visible: true},
  {key: 2, label: `模块名称`, visible: true},
  {key: 3, label: `系统ID`, visible: true},
  {key: 4, label: `是否显示`, visible: true},
  {key: 5, label: `状态`, visible: true},
  {key: 6, label: `路由地址`, visible: true},
  {key: 7, label: `展示顺序`, visible: true},
  {key: 8, label: `创建时间`, visible: true},
  {key: 9, label: `更新时间`, visible: true},
  {key: 10, label: `备注`, visible: true},
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    moduleCode: null,
    moduleName: null,
    systemId: null,
    isShow: null,
    status: null,
    routeUrl: null,
  },
  rules: {
    moduleCode: [
      { required: true, message: "模块编码不能为空", trigger: "blur" }
    ],
    moduleName: [
      { required: true, message: "模块名称不能为空", trigger: "blur" }
    ],
    systemId: [
      { required: true, message: "系统ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统模块列表 */
function getList() {
  loading.value = true;
  listModule(queryParams.value).then(response => {
    moduleList.value = response.rows;
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
    moduleCode: null,
    moduleName: null,
    systemId: null,
    isShow: null,
    status: null,
    routeUrl: null,
    sort: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("moduleRef");
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
  title.value = "添加系统模块";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getModule(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改系统模块";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["moduleRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateModule(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addModule(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除系统模块编号为"' + _ids + '"的数据项？').then(function() {
    return delModule(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/module/export', {
    ...queryParams.value
  }, `module_${new Date().getTime()}.xlsx`)
}

getList();
</script>
