<template>
  <div class="settings-page">
    <div class="page-title">
      <el-icon><Setting /></el-icon>
      <span>系统设置</span>
    </div>

    <el-row :gutter="20">
      <!-- 预算设置 -->
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预算设置</span>
            </div>
          </template>

          <el-form label-width="120px">
            <el-form-item label="月度预算">
              <el-input-number
                v-model="monthlyBudget"
                :min="0"
                :step="100"
                :precision="0"
                style="width: 200px;"
              />
              <span style="margin-left: 10px;">元</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveBudget">保存预算</el-button>
            </el-form-item>
          </el-form>

          <div class="budget-progress" v-if="monthlyBudget > 0">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>本月支出: {{ formatCurrency(currentMonthExpense) }}</span>
              <span>预算: {{ formatCurrency(monthlyBudget) }}</span>
            </div>
            <el-progress 
              :percentage="budgetUsagePercentage" 
              :status="budgetProgressStatus"
              :stroke-width="12"
            />
            <div style="text-align: center; margin-top: 10px; color: #909399; font-size: 14px;">
              使用进度: {{ budgetUsagePercentage.toFixed(1) }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 分类管理 -->
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>分类管理</span>
              <el-button type="primary" @click="showAddCategoryDialog = true">
                <el-icon><Plus /></el-icon>
                添加分类
              </el-button>
            </div>
          </template>

          <el-tabs v-model="activeCategoryTab">
            <el-tab-pane label="收入分类" name="income">
              <CategoryList 
                :categories="transactionStore.incomeCategories"
                @edit="editCategory"
                @delete="deleteCategory"
              />
            </el-tab-pane>
            <el-tab-pane label="支出分类" name="expense">
              <CategoryList 
                :categories="transactionStore.expenseCategories"
                @edit="editCategory"
                @delete="deleteCategory"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据管理 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>

      <div class="data-management">
        <el-space direction="vertical" style="width: 100%;">
          <el-button type="primary" @click="exportData" style="width: 200px;">
            <el-icon><Download /></el-icon>
            导出所有数据
          </el-button>

          <el-upload
            action=""
            :show-file-list="false"
            :before-upload="beforeUpload"
            accept=".json"
            style="width: 200px;"
          >
            <el-button type="success" style="width: 200px;">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
          </el-upload>

          <el-button type="danger" @click="clearData" style="width: 200px;">
            <el-icon><Delete /></el-icon>
            清空所有数据
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      :title="isEditingCategory ? '编辑分类' : '添加分类'" 
      v-model="showAddCategoryDialog"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类类型" required>
          <el-radio-group v-model="categoryForm.type">
            <el-radio label="income">收入</el-radio>
            <el-radio label="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分类颜色">
          <el-color-picker v-model="categoryForm.color" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddCategoryDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Setting, Plus, Download, Upload, Delete } from '@element-plus/icons-vue'
import { useTransactionStore } from '../store'
import CategoryList from '../components/CategoryList.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const transactionStore = useTransactionStore()

const monthlyBudget = ref(transactionStore.monthlyBudget)
const activeCategoryTab = ref('income')
const showAddCategoryDialog = ref(false)
const isEditingCategory = ref(false)
const editingCategoryId = ref(null)

const categoryForm = ref({
  name: '',
  type: 'expense',
  color: '#409EFF'
})

// 计算本月支出
const currentMonthExpense = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return transactionStore.transactions
    .filter(t => {
      if (t.type !== 'expense') return false
      
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })
    .reduce((total, transaction) => total + transaction.amount, 0)
})

// 预算使用百分比
const budgetUsagePercentage = computed(() => {
  if (monthlyBudget.value <= 0) return 0
  return Math.min(100, (currentMonthExpense.value / monthlyBudget.value) * 100)
})

// 预算进度状态
const budgetProgressStatus = computed(() => {
  if (budgetUsagePercentage.value < 70) return 'success'
  if (budgetUsagePercentage.value < 90) return 'warning'
  return 'exception'
})

const formatCurrency = (amount) => {
  return '¥' + amount.toFixed(2)
}

const saveBudget = () => {
  transactionStore.setBudget(monthlyBudget.value)
  ElMessage.success('预算设置成功')
}

const editCategory = (category) => {
  categoryForm.value = { ...category }
  editingCategoryId.value = category.id
  isEditingCategory.value = true
  showAddCategoryDialog.value = true
}

const deleteCategory = async (category) => {
  // 检查是否为默认分类
  const defaultCategories = [
    'salary', 'bonus', 'investment', 'other-income',
    'food', 'shopping', 'transport', 'entertainment', 'utilities', 'other-expense'
  ]
  
  if (defaultCategories.includes(category.id)) {
    ElMessage.warning('默认分类不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？使用此分类的交易将不会被删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    transactionStore.deleteCategory(category.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const saveCategory = () => {
  if (!categoryForm.value.name.trim()) {
    ElMessage.error('请输入分类名称')
    return
  }
  
  if (isEditingCategory.value) {
    // 更新分类
    const category = transactionStore.categories.find(c => c.id === editingCategoryId.value)
    if (category) {
      category.name = categoryForm.value.name
      category.color = categoryForm.value.color
      transactionStore.saveToLocalStorage()
      ElMessage.success('分类更新成功')
    }
  } else {
    // 添加新分类
    transactionStore.addCategory(categoryForm.value)
    ElMessage.success('分类添加成功')
  }
  
  showAddCategoryDialog.value = false
  resetCategoryForm()
}

const resetCategoryForm = () => {
  categoryForm.value = {
    name: '',
    type: 'expense',
    color: '#409EFF'
  }
  isEditingCategory.value = false
  editingCategoryId.value = null
}

const exportData = () => {
  const data = {
    transactions: transactionStore.transactions,
    categories: transactionStore.categories,
    monthlyBudget: transactionStore.monthlyBudget,
    exportDate: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `记账数据_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  ElMessage.success('数据导出成功')
}

const beforeUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      // 验证数据格式
      if (!data.transactions || !data.categories) {
        throw new Error('数据格式不正确')
      }
      
      ElMessageBox.confirm(
        '导入数据将覆盖当前数据，确定要继续吗？',
        '导入确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 导入数据
        transactionStore.transactions = data.transactions
        transactionStore.categories = data.categories
        if (data.monthlyBudget) {
          transactionStore.monthlyBudget = data.monthlyBudget
          monthlyBudget.value = data.monthlyBudget
        }
        transactionStore.saveToLocalStorage()
        ElMessage.success('数据导入成功')
      })
    } catch (error) {
      ElMessage.error('文件格式错误，请选择正确的数据文件')
    }
  }
  reader.readAsText(file)
  return false // 阻止默认上传行为
}

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除所有数据，包括交易记录和分类设置，确定要继续吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 清空数据
    transactionStore.transactions = []
    transactionStore.categories = [
      { id: 'salary', name: '工资', type: 'income', color: '#67C23A' },
      { id: 'bonus', name: '奖金', type: 'income', color: '#8BC34A' },
      { id: 'investment', name: '投资', type: 'income', color: '#4CAF50' },
      { id: 'other-income', name: '其他收入', type: 'income', color: '#2E7D32' },
      { id: 'food', name: '餐饮', type: 'expense', color: '#F56C6C' },
      { id: 'shopping', name: '购物', type: 'expense', color: '#E91E63' },
      { id: 'transport', name: '交通', type: 'expense', color: '#9C27B0' },
      { id: 'entertainment', name: '娱乐', type: 'expense', color: '#673AB7' },
      { id: 'utilities', name: '生活缴费', type: 'expense', color: '#3F51B5' },
      { id: 'other-expense', name: '其他支出', type: 'expense', color: '#2196F3' }
    ]
    transactionStore.monthlyBudget = 5000
    monthlyBudget.value = 5000
    transactionStore.saveToLocalStorage()
    
    ElMessage.success('数据清空成功')
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  transactionStore.loadFromLocalStorage()
})
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-progress {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.data-management {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>