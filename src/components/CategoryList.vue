<template>
  <div class="category-list">
    <div 
      v-for="category in categories" 
      :key="category.id" 
      class="category-item"
    >
      <div class="category-info">
        <div 
          class="color-indicator" 
          :style="{ backgroundColor: category.color }"
        ></div>
        <div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-type">{{ category.type === 'income' ? '收入' : '支出' }}</div>
        </div>
      </div>
      
      <div class="category-actions">
        <el-button 
          size="small" 
          @click="$emit('edit', category)"
          :disabled="isDefaultCategory(category.id)"
        >
          编辑
        </el-button>
        <el-button 
          size="small" 
          type="danger" 
          @click="$emit('delete', category)"
          :disabled="isDefaultCategory(category.id)"
        >
          删除
        </el-button>
      </div>
    </div>
    
    <div v-if="categories.length === 0" class="empty-state">
      <el-empty description="暂无分类" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete'])

const isDefaultCategory = (id) => {
  const defaultCategories = [
    'salary', 'bonus', 'investment', 'other-income',
    'food', 'shopping', 'transport', 'entertainment', 'utilities', 'other-expense'
  ]
  return defaultCategories.includes(id)
}
</script>

<style scoped>
.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.category-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e4e7ed;
}

.category-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.category-type {
  font-size: 12px;
  color: #909399;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style>