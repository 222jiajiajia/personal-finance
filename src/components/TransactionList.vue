<template>
  <div class="transaction-list">
    <el-table :data="props.transactions" style="width: 100%">
      <el-table-column prop="date" label="日期" width="120">
        <template #default="scope">
          {{ formatDate(scope.row.date) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          <el-tag :color="getCategoryColor(scope.row.category)">
            {{ getCategoryName(scope.row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
            {{ scope.row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="120" align="right">
        <template #default="scope">
          <span :class="scope.row.type === 'income' ? 'income-amount' : 'expense-amount'">
            {{ scope.row.type === 'income' ? '+' : '-' }}{{ formatCurrency(scope.row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button size="small" @click="editTransaction(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteTransaction(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="props.transactions.length === 0" class="empty-state">
      <el-empty description="暂无交易记录" />
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

const transactionStore = useTransactionStore()

const formatCurrency = (amount) => {
  return '¥' + amount.toFixed(2)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getCategoryName = (categoryId) => {
  const category = transactionStore.categories.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

const getCategoryColor = (categoryId) => {
  const category = transactionStore.categories.find(c => c.id === categoryId)
  return category ? category.color : '#909399'
}

const editTransaction = (transaction) => {
  emit('edit', transaction)
}

const deleteTransaction = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条交易记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    emit('delete', id)
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.income-amount {
  color: #67c23a;
  font-weight: bold;
}

.expense-amount {
  color: #f56c6c;
  font-weight: bold;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style>