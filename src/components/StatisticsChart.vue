<template>
  <el-card class="statistics-chart">
    <template #header>
      <div class="card-header">
        <span>支出分类统计</span>
      </div>
    </template>
    
    <div ref="chartRef" style="height: 300px;"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useTransactionStore } from '../store'
import * as echarts from 'echarts'

const chartRef = ref()
const chart = ref(null)
const transactionStore = useTransactionStore()

const initChart = () => {
  if (!chartRef.value) return
  
  chart.value = echarts.init(chartRef.value)
  
  // 按分类统计支出
  const categoryExpenses = {}
  transactionStore.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryExpenses[t.category]) {
        categoryExpenses[t.category] = 0
      }
      categoryExpenses[t.category] += t.amount
    })
  
  const labels = []
  const data = []
  const colors = []
  
  Object.entries(categoryExpenses)
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
      top: 'center'
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: labels.map((label, index) => ({
          value: data[index],
          name: label,
          itemStyle: { color: colors[index] }
        }))
      }
    ]
  }
  
  chart.value.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

watch(() => transactionStore.transactions, () => {
  nextTick(() => {
    if (chart.value) {
      initChart()
    }
  })
}, { deep: true })

// 响应窗口大小变化
window.addEventListener('resize', () => {
  if (chart.value) {
    chart.value.resize()
  }
})
</script>