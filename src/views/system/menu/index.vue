<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="qry-parms">
         <el-form-item label="菜单名称" prop="menuName">
            <el-input
               v-model="queryParams.menuName"
               placeholder="请输入菜单名称"
               clearable
               @keyup.enter="handleQuery"
            />
         </el-form-item>
        <el-form-item label="菜单类型">
          <el-select
              v-model="queryParams.menuTypes"
              multiple
              placeholder="请选择菜单类型"
              clearable
          >
            <el-option
                v-for="item in sys_menu_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
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
              placeholder="请先选择所属系统"
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
        </el-form-item><el-form-item label="终端类型" prop="systemId">
        <el-select
            v-model="queryParams.terminalTypeId"
            placeholder="请选择终端类型"
            clearable
        >
          <el-option
              v-for="item in terminalOptions"
              :key="item.id"
              :label="item.typeName"
              :value="item.id"
              :disabled="item.status == 1"
          />
        </el-select>
      </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="菜单状态" clearable >
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
        <el-form-item label="是否显示" prop="visible">
          <el-select v-model="queryParams.visible" placeholder="是否显示" clearable >
            <el-option
                v-for="dict in sys_show_hide"
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
             icon="Sort"
             @click="toggleExpandAll"
         >展开/折叠</el-button>
       </el-col>
       <el-col :span="1.5">
         <el-button
             type="danger"
             plain
             icon="Refresh"
             @click="handleRefreshPermsCache"
             v-hasPermi="['system:menu:edit']"
         >刷新缓存</el-button>
       </el-col>
       <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

     <el-row :gutter="20" class="menu_display_row" >
       <el-col :span="8" :xs="24" class="menu_data" >
         <el-table
             v-if="refreshTable"
             v-loading="loading"
             :data="menuList"
             row-key="id"
             :default-expand-all="isExpandAll"
             :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
             @row-click="queryDetail"
             max-height="800px"
         >
           <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" ></el-table-column>
           <el-table-column  align="right" class-name="small-padding fixed-width">
             <template #header>
               <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
             </template>
             <template #default="scope">
               <span class="operate-btn">
                 <el-tooltip content="修改" placement="top">
                   <el-button link type="primary" icon="Edit" @click.native.stop="handleUpdate(scope.row)"
                              v-hasPermi="['system:menu:edit']"></el-button>
                 </el-tooltip>
                 <el-tooltip content="新增" placement="top">
                   <el-button link type="primary" icon="Plus" @click.native.stop="handleAdd(scope.row)"
                              v-hasPermi="['system:menu:add']"></el-button>
                 </el-tooltip>
                 <el-tooltip content="删除" placement="top">
                   <el-button link type="primary" icon="Delete" @click.native.stop="handleDelete(scope.row)"
                              v-hasPermi="['system:menu:remove']"></el-button>
                 </el-tooltip>
               </span>
             </template>
           </el-table-column>
         </el-table>
       </el-col>
       <el-col :span="16" :xs="24">
         <div class="menu_edit">
           <span class="menu_detail">
             <el-icon class="detail_icon" ><Document /></el-icon>
             菜单详情
           </span>
           <div style="float: right;margin-right: 50px">
             <el-button type="primary" @click="isEdit = true" v-hasPermi="['system:menu:edit']" v-if="!isEdit">修 改</el-button>
             <el-button type="primary" @click="submitForm" v-hasPermi="['system:menu:edit']" v-if="isEdit">确 定</el-button>
             <el-button @click="cancel" v-hasPermi="['system:menu:edit']" v-if="isEdit">取 消</el-button>
           </div>
         </div>
         <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
           <el-form-item label="菜单名称" prop="menuName">
             <el-input v-model="form.menuName" placeholder="请输入菜单名称" :disabled="!isEdit"/>
           </el-form-item>
           <el-form-item label="所属系统" prop="systemId">
             <el-select v-model="form.systemId" @change="addSystemSelectChange" :disabled="!isEdit||form.parentId!==0">
               <el-option
                   v-for="item in systemOptions"
                   :key="item.id"
                   :label="item.systemName"
                   :value="item.id"
                   :disabled="item.status == 1"
               ></el-option>
             </el-select>
           </el-form-item>
           <el-form-item label="系统模块" prop="moduleId">
             <el-select v-model="form.moduleId" :disabled="(addMouduleSelectDisabled&&(!isEdit))||form.parentId!==0">
               <el-option
                   v-for="item in moduleForAddOptions"
                   :key="item.id"
                   :label="item.moduleName"
                   :value="item.id"
                   :disabled="item.status == 1"
               ></el-option>
             </el-select>
           </el-form-item>
           <el-form-item label="上级菜单">
             <el-cascader
                 v-model="form.parentId"
                 ref="cascader"
                 :options="menuOptions"
                 :props="{ value: 'id', label: 'menuName', children: 'children', expandTrigger: 'hover', checkStrictly: true}"
                 style="width: 100%"
                 filterable
                 :disabled="!isEdit"
                 @change="parentMenuSelectChange"
             />
           </el-form-item>
           <el-form-item label="菜单类型" prop="menuType">
             <el-radio-group v-model="form.menuType" :disabled="!isEdit">
               <el-radio
                   v-for="dict in sys_menu_type"
                   :key="dict.value"
                   :label="dict.value"
               >{{ dict.label }}
               </el-radio>
             </el-radio-group>
           </el-form-item>
           <el-form-item label="菜单图标" prop="icon" v-if="form.menuType != 'F'">
             <el-popover
                 placement="bottom-start"
                 :width="540"
                 v-model:visible="showChooseIcon"
                 trigger="click"
                 @show="showSelectIcon"
                 :disabled="!isEdit"
             >
               <template #reference>
                 <el-input v-model="form.icon" placeholder="点击选择图标" @blur="showSelectIcon"
                           v-click-outside="hideSelectIcon" readonly>
                   <template #prefix>
                     <svg-icon
                         v-if="form.icon"
                         :icon-class="form.icon"
                         class="el-input__icon"
                         style="height: 32px;width: 16px;"
                     />
                     <el-icon v-else style="height: 32px;width: 16px;">
                       <search/>
                     </el-icon>
                   </template>
                 </el-input>
               </template>
               <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon"/>
             </el-popover>
           </el-form-item>
           <el-form-item label="终端类型" prop="moduleId">
             <el-select v-model="form.terminalTypeId" :disabled="!isEdit">
               <el-option
                   v-for="item in terminalOptions"
                   :key="item.id"
                   :label="item.typeName"
                   :value="item.id"
                   :disabled="item.status == 1"
               ></el-option>
             </el-select>
           </el-form-item>
           <el-form-item prop="perms">
             <el-input v-model="form.perms" placeholder="请输入权限字符" maxlength="100" :disabled="!isEdit"/>
             <template #label>
                        <span>
                           <el-tooltip content="控制器中定义的权限字符，如：v-hasPermi'['system:role:edit']'" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           权限字符
                        </span>
             </template>
           </el-form-item>
           <el-form-item label="接口API" :key="index" prop="apis">
             <template v-for="(item,index) in form.apis" v-if="form.apis&&form.apis.length>0">
               <div style="margin-bottom: 10px;width: 100%">
                 <el-select v-model="item.systemPrefixPath" placeholder="网关路径" style="width: 20%;margin-right: 5px"
                            :disabled="!isEdit">
                   <el-option
                       v-for="dict in system_prefix_path"
                       :key="dict.value"
                       :label="dict.label"
                       :value="dict.value"
                   />
                 </el-select>
                 <el-select v-model="item.requestMethod" placeholder="请求类型" style="width: 15%;margin-right: 5px"
                            :disabled="!isEdit">
                   <el-option
                       v-for="dict in request_method_type"
                       :key="dict.value"
                       :label="dict.label"
                       :value="dict.value"
                   />
                 </el-select>

                 <el-input v-model="item.requestApi" maxlength="255" style="width: 50%" :disabled="!isEdit"></el-input>
                 <el-tooltip content="删除" placement="top" v-if="isEdit">
                   <el-button link type="primary" icon="Delete" @click="deleteApi(item,index)"
                              style="margin-left: 5px"></el-button>
                 </el-tooltip>
                 <el-tooltip content="添加" placement="top" v-if="index == (form.apis.length - 1)&isEdit">
                   <el-button link type="primary" icon="Plus" @click="addApi" style="margin-left: 5px"></el-button>
                 </el-tooltip>
               </div>
             </template>
             <template v-else-if="(!form.apis||form.apis.length==0)&isEdit">
               <el-tooltip content="添加" placement="top">
                 <el-button link type="primary" icon="Plus" @click="addApi" style="margin-left: 20px">添加</el-button>
               </el-tooltip>
             </template>
           </el-form-item>

           <el-form-item label="显示排序" prop="orderNum">
             <el-input-number v-model="form.orderNum" controls-position="right" :min="1"
                              :disabled="!isEdit"/>
           </el-form-item>
           <el-form-item prop="isFrame" v-if="form.menuType != 'F'">
             <template #label>
                        <span>
                           <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>是否外链
                        </span>
             </template>
             <el-radio-group v-model="form.isFrame" :disabled="!isEdit">
               <el-radio :label="0">是</el-radio>
               <el-radio :label="1">否</el-radio>
             </el-radio-group>
           </el-form-item>
           <el-form-item prop="path" v-if="form.menuType != 'F'">
             <template #label>
                        <span>
                           <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           路由地址
                        </span>
             </template>
             <el-input v-model="form.path" placeholder="请输入路由地址" :disabled="!isEdit"/>
           </el-form-item>
           <el-form-item prop="component" v-if="form.menuType == 'C'">
             <template #label>
                        <span>
                           <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           组件路径
                        </span>
             </template>
             <el-input v-model="form.component" placeholder="请输入组件路径" :disabled="!isEdit"/>
           </el-form-item>
           <el-form-item v-if="form.menuType == 'C'">
             <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" :disabled="!isEdit"/>
             <template #label>
                        <span>
                           <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           路由参数
                        </span>
             </template>
           </el-form-item>
           <el-form-item v-if="form.menuType == 'C'">
             <template #label>
                        <span>
                           <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           是否缓存
                        </span>
             </template>
             <el-radio-group v-model="form.isCache" :disabled="!isEdit">
               <el-radio :label="0">缓存</el-radio>
               <el-radio :label="1">不缓存</el-radio>
             </el-radio-group>
           </el-form-item>
           <el-form-item v-if="form.menuType != 'F'">
             <template #label>
                        <span>
                           <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           显示状态
                        </span>
             </template>
             <el-radio-group v-model="form.visible" :disabled="!isEdit">
               <el-radio
                   v-for="dict in sys_show_hide"
                   :key="parseInt(dict.value)"
                   :label="parseInt(dict.value)"
               >{{ dict.label }}
               </el-radio>
             </el-radio-group>
           </el-form-item>
           <el-form-item v-if="form.menuType != 'F'">
             <template #label>
                        <span>
                           <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           菜单状态
                        </span>
             </template>
             <el-radio-group v-model="form.status" :disabled="!isEdit">
               <el-radio
                   v-for="dict in sys_normal_disable"
                   :key="parseInt(dict.value)"
                   :label="parseInt(dict.value)"
               >{{ dict.label }}
               </el-radio>
             </el-radio-group>
           </el-form-item>
         </el-form>
         <div class="menu_edit">
           <span class="menu_detail">
             <el-icon class="detail_icon"><Connection /></el-icon>
             关联角色
           </span>
           <div style="float: right;margin-right: 50px">
             <el-button type="primary" @click="openSelectRole" v-hasPermi="['system:menu:edit']" >添 加</el-button>
           </div>
         </div>
         <el-table v-loading="roleLoading" :data="roleList" >
           <el-table-column label="角色ID" align="center" prop="id"/>
           <el-table-column label="角色编码" prop="roleCode" :show-overflow-tooltip="true" min-width="140" />
           <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" min-width="120" />
           <el-table-column label="显示顺序" align="center" prop="roleSort" width="100"/>
           <el-table-column label="状态" align="center" prop="status">
             <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
             </template>
           </el-table-column>
           <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150" fixed = "right">
             <template #default="scope">
               <el-tooltip content="删除" placement="top">
                 <el-button link type="primary" icon="Delete" @click="handleDeleteRole(form.id,scope.row)" v-hasPermi="['system:role:remove']"></el-button>
               </el-tooltip>
             </template>
           </el-table-column>
         </el-table>

       </el-col>
     </el-row>
     <select-role ref="selectRef" :menuId="form.id" @ok="handleQuery" />
   </div>
</template>

<script setup name="Menu">
import selectRole from "./selectRole";

import { addMenu, delMenu, getMenu, listMenu, updateMenu,refreshPermsCache} from "@/api/system/menu";
import { getBindRoles,delMenuRole} from "@/api/system/role";
import SvgIcon from "@/components/SvgIcon";
import IconSelect from "@/components/IconSelect";
import { ClickOutside as vClickOutside } from 'element-plus'

import { listAllSystem } from "@/api/system/system";
import { listAvailableModule } from "@/api/system/module";
import { listAllTerminal} from "@/api/system/terminaltype";

const { proxy } = getCurrentInstance();
const { sys_show_hide, sys_normal_disable,sys_menu_type,request_method_type,system_prefix_path } = proxy.useDict("sys_show_hide", "sys_normal_disable","sys_menu_type","request_method_type","system_prefix_path");

const systemOptions = ref(undefined);
const moduleOptions = ref(undefined);
const moduleForAddOptions = ref(undefined);
const terminalOptions = ref(undefined);
const menuList = ref([]);
const isEdit = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const menuOptions = ref([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);
const showChooseIcon = ref(false);
const iconSelectRef = ref(null);
const mouduleSelectDisabled = ref(true);
const addMouduleSelectDisabled = ref(true);
const roleLoading = ref(true);
const roleList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    menuTypes: [],
    systemId: undefined,
    moduleId: undefined,
    terminalTypeId: undefined,
    status: null,
    visible: undefined
  },
  rules: {
    menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
    systemId: [{ required: true, message: "所属系统不能为空", trigger: "blur" }],
    moduleId: [{ required: true, message: "系统模块不能为空", trigger: "blur" }],
    terminalTypeId: [{ required: true, message: "终端类型不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
    perms: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);
/** 查询系统数据 */
function getSystemOptions() {
  listAllSystem().then(response => {
    systemOptions.value = response.data;
  });
};

/** 选择系统触发模块选择 */
function dataSystemSelectChange(value) {
  queryParams.value.moduleId = undefined;
  moduleOptions.value = undefined;
  //清空所属系统
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
/** 查询终端类型数据 */
function getTerminalOptions() {
  listAllTerminal().then(response => {
    terminalOptions.value = response.data;
  });
};

/** 新增或修改选择系统触发模块选择 */
function addSystemSelectChange(value) {
  form.value.moduleId = undefined;
  moduleForAddOptions.value = undefined;
  if (!value) {
    addMouduleSelectDisabled.value = true;
    return;
  }
  let qryParams = {
    systemId: value,
  }
  listAvailableModule(qryParams).then(response => {
    moduleForAddOptions.value = response.data;
    if(response.data){
      addMouduleSelectDisabled.value = false;
      //默认第一个
      form.value.moduleId = moduleForAddOptions.value[0].id;
    }
  });
}

/** 新增或修改选择系统触发模块选择 */
function parentMenuSelectChange(value) {
  let nodesInfo = proxy.$refs['cascader'].getCheckedNodes()
  form.value.systemId = nodesInfo[0].data.systemId;
  form.value.moduleId = nodesInfo[0].data.moduleId;
  form.value.parentId = value[value.length-1];
}

/** 查询菜单列表 */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then(response => {
    menuList.value = response.data
    loading.value = false;
    //获取第一行数据并填空右部的详情展示
    if (response.data) {
      let firstRow = response.data[0];
      queryDetail(firstRow,false);
    }
  });
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  let qryParams = {
    menuTypes: ['M','C']
  }
  listMenu(qryParams).then(response => {
    const menu = { id: 0, menuName: "主类目", children: [] };
    menu.children = response.data;
    menuOptions.value.push(menu);
  });
}
/** 取消按钮 */
function cancel() {
  isEdit.value = false;
  addMouduleSelectDisabled.value = true;
  moduleForAddOptions.value = undefined;
}
/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: 0,
    apis:[],
    isFrame: 1,
    isCache: 0,
    visible: 0,
    status: 0
  };
  proxy.resetForm("menuRef");
}
/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
}
/** 选择图标 */
function selected(name) {
  form.value.icon = name;
  showChooseIcon.value = false;
}
/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon(event) {
  var elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget;
  var className = elem.className;
  if (className !== "el-input__inner") {
    showChooseIcon.value = false;
  }
}
/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd(row) {
  isEdit.value = true;
  reset();
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
    form.value.systemId = row.systemId;
    form.value.moduleId = row.moduleId;
  } else {
    form.value.parentId = 0;
  }
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 查询详情 */
async function queryDetail(row) {
  isEdit.value = false;
  reset();
  //查询列表
  const qryParams = {
    systemId: row.systemId,
  }
  listAvailableModule(qryParams).then(response => {
    moduleForAddOptions.value = response.data;
  });
   getTreeselect();
  getBindRoles(row.id).then(response => {
    roleList.value = response.data
    roleLoading.value = false;
  });
  await getMenu(row.id).then(response => {
    form.value = response.data;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  await queryDetail(row);
  isEdit.value = true;
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["menuRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          getList();
        });
      } else {
        addMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.menuName + '"的数据项?').then(function() {
    return delMenu(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 删除关联的角色操作 */
function handleDeleteRole(menuId,row) {
  console.log(row)
  proxy.$modal.confirm('是否确认删除关联的角色[' + row.roleName + ']?').then(function() {
    const parms = {
      menuId: menuId,
      roleId: row.id
    }
    console.log(parms)
    return delMenuRole(parms);
  }).then(() => {
    roleLoading.value = true;
    getBindRoles(menuId).then(response => {
      roleList.value = response.data
      roleLoading.value = false;
    });
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

function deleteApi(item, index) {
  form.value.apis.splice(index, 1);
}

function addApi() {
  form.value.apis.push(
      // 增加就push进数组一个新值
      {
        systemPrefixPath: '',
        requestApi: '',
        requestMethod: ''
      }
  )
}

/** 刷新缓存按钮操作 */
function handleRefreshPermsCache() {
  proxy.$modal.confirm('此操作会强制刷新所有API缓存，可能造成服务不可用，是否确认刷新缓存').then(function () {
    return refreshPermsCache();
  }).then(() => {
    proxy.$modal.msgSuccess("刷新成功");
  }).catch(() => {
  });
}

/** 打开授权用户表弹窗 */
function openSelectRole() {
  proxy.$refs["selectRef"].show();
}

getSystemOptions();
getTerminalOptions()
getList();
</script>

<style scoped lang="scss">
.el-table__row {
  .operate-btn {
    display: none;
  }
}

.el-table__row:hover {
  .operate-btn {
    display: block;
  }
}
.menu_display_row {
  border: 1px #dcdfe6 solid;
  padding: 5px;
}

.menu_display_row .menu_data {
  border-right: 1px #dcdfe6 solid;
}

.menu_display_row .menu_edit {
  height: 45px;
  line-height: 45px;
  margin-bottom: 10px
}

.menu_edit .menu_detail {
  font-weight: bold;
  font-size: 16px;
  margin-left: 5px;
}

.menu_detail .detail_icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 5px;
  position:relative;
  top:-2px;
  color: #599CF8;
}
</style>
