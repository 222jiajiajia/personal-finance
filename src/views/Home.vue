<template>
  <div class="home">
    <div class="page-title">
      <el-icon><Odometer /></el-icon>
      <span>仪表盘</span>
    </div>
    
    <!-- 统计卡片 -->
    <div class="dashboard">
      <BudgetCard />
      <StatisticsChart />
    </div>
    
    <!-- 最近交易 -->
    <el-card class="recent-transactions">
      <template #header>
        <div class="card-header">
          <span>最近交易</span>
          <el-button type="primary" @click="$router.push('/transactions')">
            <el-icon><Plus /></el-icon>
            添加交易
          </el-button>
        </div>
      </template>
      
      <TransactionList 
        :transactions="recentTransactions"
        @edit="editTransaction"
        @delete="deleteTransaction"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Odometer, Plus } from '@element-plus/icons-vue'
import { useTransactionStore } from '../store'
import BudgetCard from '../components/BudgetCard.vue'
import StatisticsChart from '../components/StatisticsChart.vue'
import TransactionList from '../components/TransactionList.vue'

const router = useRouter()
const transactionStore = useTransactionStore()

const recentTransactions = computed(() => {
  return transactionStore.transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const editTransaction = (transaction) => {
  // 跳转到交易管理页面进行编辑
  router.push('/transactions')
  // 这里可以传递编辑参数，或者使用状态管理
}

const deleteTransaction = (id) => {
  transactionStore.deleteTransaction(id)
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 30px;
}

.recent-transactions {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>