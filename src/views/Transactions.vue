<template>
  <div class="transactions-page">
    <div class="page-title">
      <el-icon><Document /></el-icon>
      <span>交易管理</span>
    </div>

    <div class="page-actions">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加交易
      </el-button>

      <div class="filters">
        <el-input
          v-model="searchQuery"
          placeholder="搜索交易..."
          clearable
          style="width: 200px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filterCategory" placeholder="所有分类" clearable>
          <el-option
            v-for="category in transactionStore.categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>

        <el-select v-model="filterType" placeholder="所有类型" clearable>
          <el-option label="收入" value="income" />
          <el-option label="支出" value="expense" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </div>
    </div>

    <!-- 交易列表 -->
    <TransactionList :transactions="filteredTransactions" />

    <!-- 添加/编辑交易对话框 -->
    <TransactionForm
      v-model="showAddDialog"
      :transaction="editingTransaction"
      :is-editing="isEditing"
      @saved="handleTransactionSaved"
      @closed="resetForm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Document, Plus, Search } from '@element-plus/icons-vue'
import { useTransactionStore } from '../store'
import TransactionList from '../components/TransactionList.vue'
import TransactionForm from '../components/TransactionForm.vue'

const transactionStore = useTransactionStore()

const searchQuery = ref('')
const filterCategory = ref('')
const filterType = ref('')
const dateRange = ref('')
const showAddDialog = ref(false)
const editingTransaction = ref(null)
const isEditing = ref(false)

// 筛选后的交易记录
const filteredTransactions = computed(() => {
  let result = transactionStore.transactions

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.description.toLowerCase().includes(query) || 
      (t.notes && t.notes.toLowerCase().includes(query))
    )
  }

  // 分类筛选
  if (filterCategory.value) {
    result = result.filter(t => t.category === filterCategory.value)
  }

  // 类型筛选
  if (filterType.value) {
    result = result.filter(t => t.type === filterType.value)
  }

  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(t => {
      const transactionDate = new Date(t.date).toISOString().split('T')[0]
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // 按日期倒序排列
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const handleTransactionSaved = () => {
  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingTransaction.value = null
  isEditing.value = false
}

// 编辑交易
const editTransaction = (transaction) => {
  editingTransaction.value = { ...transaction }
  isEditing.value = true
  showAddDialog.value = true
}

// 删除交易
const deleteTransaction = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条交易记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    transactionStore.deleteTransaction(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 提供方法给子组件
defineExpose({
  editTransaction,
  deleteTransaction
})

onMounted(() => {
  transactionStore.loadFromLocalStorage()
})
</script>

<style scoped>
.transactions-page {
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.page-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: space-between;
  }
}
</style>