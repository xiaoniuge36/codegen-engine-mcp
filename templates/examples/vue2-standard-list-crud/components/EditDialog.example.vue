<template>
  <!--
    编辑弹窗组件（独立封装版本）
    - 适用于需要从父组件控制显隐的场景（如列表页编辑按钮触发）
    - 如果是独立新增按钮，推荐使用 getwayDialog 组件
  -->
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑' : '新增'"
    :close-on-click-modal="false"
    width="600px"
    append-to-body
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择类型" clearable style="width: 100%">
              <el-option label="全职" :value="1" />
              <el-option label="兼职" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" clearable style="width: 100%">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'EditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      formData: {
        name: '',
        phone: '',
        type: undefined,
        status: 1,
        remark: '',
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
        ],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
    isEdit() {
      return !!this.editData?.id;
    },
    apiConfig() {
      return this.isEdit
        ? { url: '/employee/update', method: 'post' }
        : { url: '/employee/create', method: 'post' };
    },
  },
  watch: {
    editData: {
      handler(data) {
        if (data) {
          this.formData = { ...data };
        } else {
          this.resetForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;

        this.loading = true;
        const { url, method } = this.apiConfig;
        const requestData = { ...this.formData };
        if (this.isEdit) {
          requestData.id = this.editData.id;
        }

        request({
          url: `/api${url}`,
          method,
          data: requestData,
        })
          .then(() => {
            this.$message.success(this.isEdit ? '编辑成功' : '新增成功');
            this.$emit('success');
            this.handleClose();
          })
          .catch(() => {
            this.$message.error('操作失败');
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.$nextTick(() => {
        this.$refs.formRef?.resetFields();
        this.formData = {
          name: '',
          phone: '',
          type: undefined,
          status: 1,
          remark: '',
        };
      });
    },
  },
};
</script>

<style lang="less" scoped>
.dialog-footer {
  text-align: right;
}
</style>
