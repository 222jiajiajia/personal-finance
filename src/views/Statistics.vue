<template>
  <div class="statistics-page">
    <div class="page-title">
      <el-icon><DataAnalysis /></el-icon>
      <span>数据统计</span>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-statistic title="总余额" :value="transactionStore.totalBalance" prefix="¥" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-statistic title="总收入" :value="transactionStore.totalIncome" prefix="¥" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-statistic title="总支出" :value="transactionStore.totalExpense" prefix="¥" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-statistic title="交易笔数" :value="transactionStore.transactions.length" />
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月度收支趋势</span>
            </div>
          </template>
          <div ref="monthlyChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>支出分类占比</span>
            </div>
          </template>
          <div ref="categoryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="data-table">
      <template #header>
        <div class="card-header">
          <span>月度详细数据</span>
          <el-button type="primary" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>

      <el-table :data="monthlyTableData" stripe>
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="income" label="收入" width="120" align="right">
          <template #default="scope">
            <span class="income-text">{{ formatCurrency(scope.row.income) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expense" label="支出" width="120" align="right">
          <template #default="scope">
            <span class="expense-text">{{ formatCurrency(scope.row.expense) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="结余" width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.balance >= 0 ? 'income-text' : 'expense-text'">
              {{ formatCurrency(scope.row.balance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="结余率" width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.rate >= 0 ? 'income-text' : 'expense-text'">
              {{ (scope.row.rate * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="趋势">
          <template #default="scope">
            <el-progress 
              :percentage="Math.min(100, Math.max(0, scope.row.rate * 100))" 
              :status="getProgressStatus(scope.row.rate)"
              :show-text="false"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { DataAnalysis, Download } from '@element-plus/icons-vue'
import { useTransactionStore } from '../store'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const transactionStore = useTransactionStore()

const monthlyChartRef = ref()
const categoryChartRef = ref()
let monthlyChart = null
let categoryChart = null

// 月度数据统计
const monthlyData = computed(() => {
  const data = {}
  
  transactionStore.transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!data[monthKey]) {
      data[monthKey] = { income: 0, expense: 0 }
    }
    
    if (transaction.type === 'income') {
      data[monthKey].income += transaction.amount
    } else {
      data[monthKey].expense += transaction.amount
    }
  })
  
  return data
})

// 表格数据
const monthlyTableData = computed(() => {
  const result = []
  
  Object.keys(monthlyData.value)
    .sort()
    .reverse()
    .forEach(monthKey => {
      const data = monthlyData.value[monthKey]
      const balance = data.income - data.expense
      const rate = data.income > 0 ? balance / data.income : 0
      
      result.push({
        month: monthKey,
        income: data.income,
        expense: data.expense,
        balance: balance,
        rate: rate
      })
    })
  
  return result
})

// 分类数据统计
const categoryData = computed(() => {
  const data = {}
  
  transactionStore.transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      if (!data[transaction.category]) {
        data[transaction.category] = 0
      }
      data[transaction.category] += transaction.amount
    })
  
  return data
})

const formatCurrency = (amount) => {
  return '¥' + amount.toFixed(2)
}

const getProgressStatus = (rate) => {
  if (rate >= 0.3) return 'success'
  if (rate >= 0.1) return 'warning'
  return 'exception'
}

const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  
  monthlyChart = echarts.init(monthlyChartRef.value)
  
  const months = Object.keys(monthlyData.value).sort()
  const incomeData = []
  const expenseData = []
  const balanceData = []
  
  months.forEach(month => {
    incomeData.push(monthlyData.value[month].income)
    expenseData.push(monthlyData.value[month].expense)
    balanceData.push(monthlyData.value[month].income - monthlyData.value[month].expense)
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['收入', '支出', '结余'],
      textStyle: {
        color: '#606266'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266',
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: incomeData,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '支出',
        type: 'bar',
        data: expenseData,
        itemStyle: {
          color: '#F56C6C'
        }
      },
      {
        name: '结余',
        type: 'line',
        data: balanceData,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  monthlyChart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  
  const labels = []
  const data = []
  const colors = []
  
  Object.entries(categoryData.value)
    .sort((a, b) => b[1] - a[1])
    .forEach(([categoryId, amount]) => {
      const category = transactionStore.categories.find(c => c.id === categoryId)
      if (category) {
        labels.push(category.name)
        data.push(amount)
        colors.push(category.color)
      }
    })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: labels.map((label, index) => ({
          value: data[index],
          name: label,
          itemStyle: { color: colors[index] }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  categoryChart.setOption(option)
}

const initCharts = () => {
  initMonthlyChart()
  initCategoryChart()
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
  link.download = `记账统计_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  ElMessage.success('数据导出成功')
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

watch(() => transactionStore.transactions, () => {
  nextTick(() => {
    initCharts()
  })
}, { deep: true })

// 响应窗口大小变化
window.addEventListener('resize', () => {
  if (monthlyChart) monthlyChart.resize()
  if (categoryChart) categoryChart.resize()
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.stats-overview {
  margin-bottom: 30px;
}

.charts-section {
  margin-bottom: 30px;
}

.data-table {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.income-text {
  color: #67c23a;
  font-weight: bold;
}

.expense-text {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: bold;
}
</style>