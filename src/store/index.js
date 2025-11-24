import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        darkMode: false,
        loading: false
    }),
    actions: {
        toggleTheme() {
            this.darkMode = !this.darkMode
            localStorage.setItem('darkMode', JSON.stringify(this.darkMode))
        },
        setLoading(loading) {
            this.loading = loading
        }
    }
})

export const useTransactionStore = defineStore('transactions', {
    state: () => ({
        transactions: [],
        categories: [
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
        ],
        monthlyBudget: 5000
    }),
    getters: {
        // 计算总余额
        totalBalance: (state) => {
            return state.transactions.reduce((total, transaction) => {
                return transaction.type === 'income'
                    ? total + transaction.amount
                    : total - transaction.amount
            }, 0)
        },
        // 计算总收入
        totalIncome: (state) => {
            return state.transactions
                .filter(t => t.type === 'income')
                .reduce((total, transaction) => total + transaction.amount, 0)
        },
        // 计算总支出
        totalExpense: (state) => {
            return state.transactions
                .filter(t => t.type === 'expense')
                .reduce((total, transaction) => total + transaction.amount, 0)
        },
        // 收入分类
        incomeCategories: (state) => {
            return state.categories.filter(c => c.type === 'income')
        },
        // 支出分类
        expenseCategories: (state) => {
            return state.categories.filter(c => c.type === 'expense')
        }
    },
    actions: {
        // 添加交易
        addTransaction(transaction) {
            this.transactions.push({
                id: Date.now(),
                ...transaction
            })
            this.saveToLocalStorage()
        },
        // 更新交易
        updateTransaction(updatedTransaction) {
            const index = this.transactions.findIndex(t => t.id === updatedTransaction.id)
            if (index !== -1) {
                this.transactions[index] = { ...updatedTransaction }
                this.saveToLocalStorage()
            }
        },
        // 删除交易
        deleteTransaction(id) {
            this.transactions = this.transactions.filter(t => t.id !== id)
            this.saveToLocalStorage()
        },
        // 添加分类
        addCategory(category) {
            this.categories.push({
                id: 'custom-' + Date.now(),
                ...category
            })
            this.saveToLocalStorage()
        },
        // 删除分类
        deleteCategory(id) {
            this.categories = this.categories.filter(c => c.id !== id)
            this.saveToLocalStorage()
        },
        // 设置预算
        setBudget(budget) {
            this.monthlyBudget = budget
            localStorage.setItem('monthlyBudget', this.monthlyBudget)
        },
        // 根据分类ID获取分类
        getCategoryById(id) {
            return this.categories.find(c => c.id === id)
        },
        // 保存到本地存储
        saveToLocalStorage() {
            localStorage.setItem('transactions', JSON.stringify(this.transactions))
            localStorage.setItem('categories', JSON.stringify(this.categories))
        },
        // 从本地存储加载
        loadFromLocalStorage() {
            const savedTransactions = localStorage.getItem('transactions')
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions)
            }

            const savedCategories = localStorage.getItem('categories')
            if (savedCategories) {
                // 合并默认分类和自定义分类
                const customCategories = JSON.parse(savedCategories)
                const defaultCategoryIds = this.categories.map(c => c.id)

                customCategories.forEach(category => {
                    if (!defaultCategoryIds.includes(category.id)) {
                        this.categories.push(category)
                    }
                })
            }

            const savedBudget = localStorage.getItem('monthlyBudget')
            if (savedBudget) {
                this.monthlyBudget = parseFloat(savedBudget)
            }
        }
    }
})