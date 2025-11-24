<template>
  <el-card class="budget-card">
    <template #header>
      <div class="card-header">
        <span>预算概览</span>
        <el-icon><TrendCharts /></el-icon>
      </div>
    </template>

    <div class="budget-content">
      <div class="budget-info">
        <div class="budget-item">
          <div class="budget-label">月度预算</div>
          <div class="budget-value">{{ formatCurrency(transactionStore.monthlyBudget) }}</div>
        </div>
        
        <div class="budget-item">
          <div class="budget-label">本月支出</div>
          <div class="budget-value expense">{{ formatCurrency(currentMonthExpense) }}</div>
        </div>
        
        <div class="budget-item">
          <div class="budget-label">剩余预算</div>
          <div class="budget-value" :class="remainingBudget >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(remainingBudget) }}
          </div>
        </div>
      </div>

      <div class="budget-progress">
        <div class="progress-header">
          <span>预算使用进度</span>
          <span>{{ budgetUsagePercentage.toFixed(1) }}%</span>
        </div>
        <el-progress 
          :percentage="budgetUsagePercentage" 
          :status="budgetProgressStatus"
          :stroke-width="12"
          :show-text="false"
        />
        <div class="progress-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div class="budget-tips" v-if="budgetUsagePercentage > 80">
        <el-alert
          title="预算提醒"
          :description="budgetAlertMessage"
          type="warning"
          show-icon
          :closable="false"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useTransactionStore } from '../store'
import { TrendCharts } from '@element-plus/icons-vue'

const transactionStore = useTransactionStore()

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

// 剩余预算
const remainingBudget = computed(() => {
  return transactionStore.monthlyBudget - currentMonthExpense.value
})

// 预算使用百分比
const budgetUsagePercentage = computed(() => {
  if (transactionStore.monthlyBudget <= 0) return 0
  return Math.min(100, (currentMonthExpense.value / transactionStore.monthlyBudget) * 100)
})

// 预算进度状态
const budgetProgressStatus = computed(() => {
  if (budgetUsagePercentage.value < 70) return 'success'
  if (budgetUsagePercentage.value < 90) return 'warning'
  return 'exception'
})

// 预算提醒消息
const budgetAlertMessage = computed(() => {
  if (budgetUsagePercentage.value >= 90) {
    return '您的预算使用已超过90%，请注意控制支出！'
  } else if (budgetUsagePercentage.value >= 80) {
    return '您的预算使用已超过80%，建议关注支出情况。'
  }
  return ''
})

const formatCurrency = (amount) => {
  return '¥' + amount.toFixed(2)
}
</script>

<style scoped>
.budget-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.budget-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-label {
  color: #606266;
  font-size: 14px;
}

.budget-value {
  font-size: 16px;
  font-weight: 600;
}

.budget-value.positive {
  color: #67c23a;
}

.budget-value.negative {
  color: #f56c6c;
}

.budget-value.expense {
  color: #f56c6c;
}

.budget-progress {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.budget-tips {
  margin-top: 10px;
}

:deep(.el-progress-bar__outer) {
  background-color: #f0f0f0;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.3s ease;
}
</style>