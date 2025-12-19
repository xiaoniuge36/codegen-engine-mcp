<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="editData ? '编辑' : '新增'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型">
          <el-option label="类型1" :value="1" />
          <el-option label="类型2" :value="2" />
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createItem, updateItem } from '@/api';

export default {
  name: 'EditDialog',
  emits: ['update:visible', 'success'],
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
        type: undefined,
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
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
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;
      try {
        if (this.editData) {
          await updateItem(this.editData.id, this.formData);
          this.$message.success('编辑成功');
        } else {
          await createItem(this.formData);
          this.$message.success('新增成功');
        }
        this.$emit('success');
        this.handleClose();
      } catch (error) {
        this.$message.error('操作失败');
      } finally {
        this.loading = false;
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.$refs.form?.resetFields();
    },
  },
};
</script>
