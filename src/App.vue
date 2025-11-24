<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <el-container class="app-container">
      <!-- 头部导航 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="app-title">
            <el-icon><Wallet /></el-icon>
            <span>智能记账本</span>
          </div>
          
          <div class="header-actions">
            <el-button @click="toggleTheme" :icon="darkMode ? Sunny : Moon" circle />
            <el-button type="primary" @click="exportData" :icon="Download">
              导出数据
            </el-button>
          </div>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px">
          <el-menu
            :default-active="$route.path"
            router
            class="sidebar-menu"
            :background-color="darkMode ? '#1e1e1e' : '#fff'"
            :text-color="darkMode ? '#e4e7ed' : '#303133'"
            :active-text-color="darkMode ? '#fff' : '#6a11cb'"
          >
            <el-menu-item index="/">
              <el-icon><Odometer /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-menu-item index="/transactions">
              <el-icon><Document /></el-icon>
              <span>交易管理</span>
            </el-menu-item>
            <el-menu-item index="/statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Wallet, Download, Sunny, Moon, Odometer, Document, DataAnalysis, Setting } from '@element-plus/icons-vue'

const darkMode = ref(false)
const router = useRouter()

const toggleTheme = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', JSON.stringify(darkMode.value))
}

const exportData = () => {
  // 导出数据逻辑
  console.log('导出数据')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme) {
    darkMode.value = JSON.parse(savedTheme)
  }
})
</script>

<style>
:root {
  --primary-color: #6a11cb;
  --secondary-color: #2575fc;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --light-bg: #f5f7fa;
  --dark-bg: #121212;
  --light-text: #303133;
  --dark-text: #e4e7ed;
}

.dark-mode {
  --light-bg: #121212;
  --dark-bg: #1e1e1e;
  --light-text: #e4e7ed;
  --dark-text: #c0c4cc;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  background: var(--light-bg);
  color: var(--light-text);
}

.app-container {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.app-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}
</style>