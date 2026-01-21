<template>
  <el-dialog
    :model-value="modelValue"
    :title="editData?.id ? '编辑' : '新增'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
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

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { createItem, updateItem } from '@/api';

interface Props {
  modelValue: boolean;
  editData?: DataItem;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = reactive({
  name: '',
  type: undefined as number | undefined,
});

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

watch(
  () => props.editData,
  (data) => {
    if (data) {
      Object.assign(formData, data);
    } else {
      formRef.value?.resetFields();
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (props.editData?.id) {
      await updateItem(props.editData.id, formData);
      ElMessage.success('编辑成功');
    } else {
      await createItem(formData);
      ElMessage.success('新增成功');
    }
    emit('success');
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>
