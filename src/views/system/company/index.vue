<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="公司名称" prop="companyName">
        <el-input
            v-model="queryParams.companyName"
            placeholder="请输入公司名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="营业执照号" prop="businessLicenseNo">
        <el-input
            v-model="queryParams.businessLicenseNo"
            placeholder="请输入营业执照号"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法人ID" prop="legalPersonId">
        <el-input
            v-model="queryParams.legalPersonId"
            placeholder="请输入法人ID"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法人姓名" prop="legalPersonName">
        <el-input
            v-model="queryParams.legalPersonName"
            placeholder="请输入法人姓名"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法人联系电话" prop="legalPersonPhone">
        <el-input
            v-model="queryParams.legalPersonPhone"
            placeholder="请输入法人联系电话"
            clearable
            style="width: 240px"
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
            v-hasPermi="['system:company:add']"
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
            v-hasPermi="['system:company:edit']"
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
            v-hasPermi="['system:company:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:company:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="companyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键" align="center" prop="id" v-if="columns[0].visible"/>
      <el-table-column label="公司名称" align="center" prop="companyName" width="180" v-if="columns[1].visible"/>
      <el-table-column label="营业执照号" align="center" prop="businessLicenseNo" width="120" v-if="columns[2].visible"/>
      <el-table-column label="营业执照图片" align="center" prop="businessLicenseImg" width="120" v-if="columns[3].visible">
        <template #default="scope">
          <image-preview :src="scope.row.businessLicenseImg" :width="30" :height="30"/>
        </template>
      </el-table-column>
      <el-table-column label="公司展示图标" align="center" prop="icon" width="120" v-if="columns[4].visible">
        <template #default="scope">
          <image-preview :src="scope.row.icon" :width="30" :height="30"/>
        </template>
      </el-table-column>
      <el-table-column label="法人ID" align="center" prop="legalPersonId" width="120" v-if="columns[5].visible"/>
      <el-table-column label="法人姓名" align="center" prop="legalPersonName" width="120" v-if="columns[6].visible"/>
      <el-table-column label="法人联系电话" align="center" prop="legalPersonPhone" width="120" v-if="columns[7].visible"/>
      <el-table-column label="状态" align="center" prop="status" v-if="columns[8].visible">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" v-if="columns[9].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" v-if="columns[10].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" width="120" v-if="columns[11].visible"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="150">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                       v-hasPermi="['system:company:edit']">
            </el-button>
          </el-tooltip>
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['system:company:remove']">
            </el-button>
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

    <!-- 添加或修改公司管理对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="companyRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="form.companyName" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照号" prop="businessLicenseNo">
              <el-input v-model="form.businessLicenseNo" placeholder="请输入营业执照号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="营业执照图片" prop="businessLicenseImg">
              <image-upload v-model="form.businessLicenseImg"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="公司展示图标" prop="icon">
              <image-upload v-model="form.icon"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="法人ID" prop="legalPersonId">
              <el-input v-model="form.legalPersonId" placeholder="请输入法人ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人姓名" prop="legalPersonName">
              <el-input v-model="form.legalPersonName" placeholder="请输入法人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="法人联系电话" prop="legalPersonPhone">
              <el-input v-model="form.legalPersonPhone" placeholder="请输入法人联系电话" />
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

<script setup name="Company">
import {listCompany, addCompany, delCompany, getCompany, updateCompany} from "@/api/system/company";

const {proxy} = getCurrentInstance();
const {sys_normal_disable} = proxy.useDict('sys_normal_disable');

const companyList = ref([]);
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
  {key: 1, label: `公司名称`, visible: true},
  {key: 2, label: `营业执照号`, visible: true},
  {key: 3, label: `营业执照图片`, visible: true},
  {key: 4, label: `公司展示图标`, visible: true},
  {key: 5, label: `法人ID`, visible: true},
  {key: 6, label: `法人姓名`, visible: true},
  {key: 7, label: `法人联系电话`, visible: true},
  {key: 8, label: `状态`, visible: true},
  {key: 9, label: `创建时间`, visible: true},
  {key: 10, label: `更新时间`, visible: true},
  {key: 11, label: `备注`, visible: true},
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyName: null,
    businessLicenseNo: null,
    legalPersonId: null,
    legalPersonName: null,
    legalPersonPhone: null,
    status: null,
  },
  rules: {
    companyName: [
      {required: true, message: "公司名称不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询公司管理列表 */
function getList() {
  loading.value = true;
  listCompany(queryParams.value).then(response => {
    companyList.value = response.rows;
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
    companyName: null,
    businessLicenseNo: null,
    businessLicenseImg: null,
    icon: null,
    legalPersonId: null,
    legalPersonName: null,
    legalPersonPhone: null,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("companyRef");
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
  title.value = "添加公司管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCompany(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改公司管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["companyRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCompany(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCompany(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除公司管理编号为"' + _ids + '"的数据项？').then(function () {
    return delCompany(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/company/export', {
    ...queryParams.value
  }, `company_${new Date().getTime()}.xlsx`)
}

getList();
</script>
