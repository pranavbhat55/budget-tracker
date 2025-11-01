// Application State
let transactions = [];
let editingId = null;
let expenseChart = null;

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionsList = document.getElementById('transactionsList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const currentBalanceEl = document.getElementById('currentBalance');
const categoryFilter = document.getElementById('categoryFilter');
const dateFromFilter = document.getElementById('dateFromFilter');
const dateToFilter = document.getElementById('dateToFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportCSVBtn = document.getElementById('exportCSV');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const transactionType = document.getElementById('transactionType');
const transactionAmount = document.getElementById('transactionAmount');
const transactionCategory = document.getElementById('transactionCategory');
const transactionDate = document.getElementById('transactionDate');
const transactionDescription = document.getElementById('transactionDescription');
const transactionId = document.getElementById('transactionId');

// Initialize App
function init() {
    loadTransactions();
    setupEventListeners();
    updateDashboard();
    updateChart();
    populateCategoryFilter();
    setDefaultDate();
}

// Load transactions from localStorage
function loadTransactions() {
    const stored = localStorage.getItem('budgetTrackerTransactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
    renderTransactions();
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('budgetTrackerTransactions', JSON.stringify(transactions));
    renderTransactions();
    updateDashboard();
    updateChart();
    populateCategoryFilter();
}

// Setup Event Listeners
function setupEventListeners() {
    transactionForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    categoryFilter.addEventListener('change', filterTransactions);
    dateFromFilter.addEventListener('change', filterTransactions);
    dateToFilter.addEventListener('change', filterTransactions);
    clearFiltersBtn.addEventListener('click', clearFilters);
    exportCSVBtn.addEventListener('click', exportToCSV);
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    transactionDate.value = today;
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();

    const transaction = {
        id: editingId || Date.now().toString(),
        type: transactionType.value,
        amount: parseFloat(transactionAmount.value),
        category: transactionCategory.value,
        date: transactionDate.value,
        description: transactionDescription.value || ''
    };

    if (editingId) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            transactions[index] = transaction;
        }
    } else {
        // Add new transaction
        transactions.push(transaction);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveTransactions();
    resetForm();
}

// Reset Form
function resetForm() {
    transactionForm.reset();
    editingId = null;
    transactionId.value = '';
    formTitle.textContent = 'Add New Transaction';
    submitBtn.textContent = 'Add Transaction';
    cancelBtn.style.display = 'none';
    setDefaultDate();
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    editingId = id;
    transactionId.value = id;
    transactionType.value = transaction.type;
    transactionAmount.value = transaction.amount;
    transactionCategory.value = transaction.category;
    transactionDate.value = transaction.date;
    transactionDescription.value = transaction.description;

    formTitle.textContent = 'Edit Transaction';
    submitBtn.textContent = 'Update Transaction';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    transactionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete Transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
    }
}

// Render Transactions
function renderTransactions(filteredTransactions = null) {
    const transactionsToRender = filteredTransactions || transactions;

    if (transactionsToRender.length === 0) {
        transactionsList.innerHTML = '<p class="empty-state">No transactions found. Add your first transaction above!</p>';
        return;
    }

    transactionsList.innerHTML = transactionsToRender.map(transaction => {
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-details">
                    <div class="transaction-category">${transaction.category}</div>
                    ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="btn btn-edit btn-small" onclick="editTransaction('${transaction.id}')" aria-label="Edit transaction">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTransaction('${transaction.id}')" aria-label="Delete transaction">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update Dashboard
function updateDashboard(filteredTransactions = null) {
    const transactionsToUse = filteredTransactions || transactions;

    const totalIncome = transactionsToUse
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactionsToUse
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    currentBalanceEl.textContent = `$${balance.toFixed(2)}`;
    
    // Update balance color based on positive/negative
    if (balance >= 0) {
        currentBalanceEl.style.color = '#4CAF50';
    } else {
        currentBalanceEl.style.color = '#F44336';
    }
}

// Update Chart
function updateChart(filteredTransactions = null) {
    const transactionsToUse = filteredTransactions || transactions;
    const expenses = transactionsToUse.filter(t => t.type === 'expense');

    const categoryTotals = {};
    expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    const ctx = document.getElementById('expenseChart').getContext('2d');

    // Destroy existing chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }

    // Pastel colors for chart
    const pastelColors = [
        'rgba(255, 182, 193, 0.8)',  // Light Pink
        'rgba(255, 218, 185, 0.8)',  // Peach
        'rgba(221, 160, 221, 0.8)',  // Plum
        'rgba(176, 224, 230, 0.8)',  // Powder Blue
        'rgba(152, 251, 152, 0.8)',  // Pale Green
        'rgba(255, 228, 196, 0.8)',  // Bisque
        'rgba(230, 230, 250, 0.8)',  // Lavender
        'rgba(240, 128, 128, 0.8)',  // Light Coral
    ];

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: pastelColors.slice(0, categories.length),
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Filter Transactions
function filterTransactions() {
    const category = categoryFilter.value;
    const dateFrom = dateFromFilter.value;
    const dateTo = dateToFilter.value;

    let filtered = [...transactions];

    // Filter by category
    if (category) {
        filtered = filtered.filter(t => t.category === category);
    }

    // Filter by date range
    if (dateFrom) {
        filtered = filtered.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(t => t.date <= dateTo);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderTransactions(filtered);
    updateDashboard(filtered);
    updateChart(filtered);
}

// Clear Filters
function clearFilters() {
    categoryFilter.value = '';
    dateFromFilter.value = '';
    dateToFilter.value = '';
    renderTransactions();
    updateDashboard();
    updateChart();
}

// Populate Category Filter
function populateCategoryFilter() {
    const categories = [...new Set(transactions.map(t => t.category))].sort();
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (currentValue) {
        categoryFilter.value = currentValue;
    }
}

// Export to CSV
function exportToCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export!');
        return;
    }

    const headers = ['Type', 'Amount', 'Category', 'Date', 'Description'];
    const rows = transactions.map(t => [
        t.type,
        t.amount,
        t.category,
        t.date,
        t.description || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Make functions available globally for onclick handlers
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

