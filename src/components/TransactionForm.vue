<template>
  <el-dialog 
    :title="isEditing ? '编辑交易' : '添加交易'" 
    v-model="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" placeholder="请输入交易描述" />
      </el-form-item>

      <el-form-item label="金额" prop="amount">
        <el-input-number 
          v-model="form.amount" 
          :min="0.01" 
          :step="0.01" 
          :precision="2"
          style="width: 100%;"
          placeholder="请输入金额"
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%;">
          <el-option-group label="收入">
            <el-option
              v-for="category in transactionStore.incomeCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-option-group>
          <el-option-group label="支出">
            <el-option
              v-for="category in transactionStore.expenseCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%;"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="income">收入</el-radio>
          <el-radio label="expense">支出</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useTransactionStore } from '../store'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'saved', 'closed'])

const transactionStore = useTransactionStore()
const formRef = ref()
const dialogVisible = ref(props.modelValue)

const form = ref({
  id: null,
  description: '',
  amount: 0,
  category: '',
  date: new Date().toISOString().split('T')[0],
  type: 'expense',
  notes: ''
})

const rules = {
  description: [
    { required: true, message: '请输入交易描述', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.isEditing && props.transaction) {
    form.value = { ...props.transaction }
  } else if (val && !props.isEditing) {
    resetForm()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('closed')
  }
})

const resetForm = () => {
  form.value = {
    id: null,
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    notes: ''
  }
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleClose = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (props.isEditing) {
      transactionStore.updateTransaction(form.value)
      ElMessage.success('交易更新成功')
    } else {
      transactionStore.addTransaction(form.value)
      ElMessage.success('交易添加成功')
    }
    
    dialogVisible.value = false
    emit('saved')
  } catch (error) {
    // 验证失败
    console.log('表单验证失败:', error)
  }
}
</script>