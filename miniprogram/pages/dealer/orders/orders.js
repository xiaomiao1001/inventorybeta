Page({
  data: {
    // 订单数据
    orders: [],
    filteredOrders: [],
    
    // 筛选状态
    currentFilter: 'all',
    
    // 批量操作
    showBatchOperations: false,
    selectAll: false,
    selectedCount: 0,
    
    // 页面状态
    loading: true,
    refreshing: false,
    
    // 模态框
    showModal: false,
    modalTitle: '',
    modalMessage: '',
    modalAction: null,
    
    // 状态映射
    statusMap: {
      'pending': '待提交',
      'submitted': '已提交',
      'confirmed': '已调车',
      'shipped': '已发货',
      'completed': '已完成'
    }
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadOrders()
    setTimeout(() => {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    }, 1000)
  },

  loadOrders() {
    this.setData({ loading: true })
    
    try {
      const orders = wx.getStorageSync('dealerOrders') || []
      const ordersWithSelection = orders.map(order => ({
        ...order,
        selected: false
      }))
      
      this.setData({
        orders: ordersWithSelection,
        loading: false
      })
      
      this.filterOrders()
      this.updateBatchOperationVisibility()
    } catch (error) {
      console.error('加载订单失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  filterOrders() {
    const { orders, currentFilter } = this.data
    let filtered = orders
    if (currentFilter !== 'all') {
      filtered = orders.filter(order => order.status === currentFilter)
    }
    this.setData({ filteredOrders: filtered })
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.filterOrders()
  },

  updateBatchOperationVisibility() {
    const hasPendingOrders = this.data.orders.some(order => order.status === 'pending')
    this.setData({ showBatchOperations: hasPendingOrders })
  },

  onSelectAllChange(e) {
    const checked = e.detail.value
    const orders = this.data.orders.map(order => ({
      ...order,
      selected: order.status === 'pending' ? checked : false
    }))
    
    this.setData({ orders, selectAll: checked })
    this.filterOrders()
    this.updateSelectedCount()
  },

  onOrderSelect(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    const orders = this.data.orders.map(order => {
      if (order.orderNo === orderNo) {
        return { ...order, selected: !order.selected }
      }
      return order
    })
    
    this.setData({ orders })
    this.filterOrders()
    this.updateSelectedCount()
    this.checkSelectAllStatus()
  },

  updateSelectedCount() {
    const selectedCount = this.data.orders.filter(order => order.selected && order.status === 'pending').length
    this.setData({ selectedCount })
  },

  checkSelectAllStatus() {
    const pendingOrders = this.data.orders.filter(order => order.status === 'pending')
    const selectedPendingOrders = pendingOrders.filter(order => order.selected)
    const selectAll = pendingOrders.length > 0 && selectedPendingOrders.length === pendingOrders.length
    this.setData({ selectAll })
  },

  stopPropagation() {},

  viewOrderDetail(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    wx.navigateTo({
      url: `/pages/dealer/orders/detail/detail?orderNo=${orderNo}`
    })
  },

  editOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    wx.navigateTo({
      url: `/pages/dealer/order/order?orderNo=${orderNo}`
    })
  },

  submitSingleOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    this.showConfirmModal(
      '提交订单',
      '确认提交此订单？\n\n提交后将等待厂家确认调车。',
      () => this.submitOrders([orderNo])
    )
  },

  batchSubmit() {
    const selectedOrders = this.getSelectedOrderNos()
    if (selectedOrders.length === 0) {
      wx.showToast({ title: '请选择要提交的订单', icon: 'none' })
      return
    }
    
    this.showConfirmModal(
      '批量提交',
      `确认批量提交 ${selectedOrders.length} 个订单？\n\n提交后将等待厂家确认调车。`,
      () => this.submitOrders(selectedOrders)
    )
  },

  batchDelete() {
    const selectedOrders = this.getSelectedOrderNos()
    if (selectedOrders.length === 0) {
      wx.showToast({ title: '请选择要删除的订单', icon: 'none' })
      return
    }
    
    this.showConfirmModal(
      '批量删除',
      `确认删除 ${selectedOrders.length} 个订单？\n\n删除后无法恢复。`,
      () => this.deleteOrders(selectedOrders)
    )
  },

  getSelectedOrderNos() {
    return this.data.orders
      .filter(order => order.selected && order.status === 'pending')
      .map(order => order.orderNo)
  },

  submitOrders(orderNos) {
    try {
      let orders = wx.getStorageSync('dealerOrders') || []
      orders = orders.map(order => {
        if (orderNos.includes(order.orderNo)) {
          return { ...order, status: 'submitted', updatedAt: new Date().toISOString() }
        }
        return order
      })
      
      wx.setStorageSync('dealerOrders', orders)
      wx.showToast({ title: `成功提交 ${orderNos.length} 个订单`, icon: 'success' })
      this.loadOrders()
    } catch (error) {
      console.error('提交订单失败:', error)
      wx.showToast({ title: '提交失败', icon: 'error' })
    }
  },

  deleteOrders(orderNos) {
    try {
      let orders = wx.getStorageSync('dealerOrders') || []
      orders = orders.filter(order => !orderNos.includes(order.orderNo))
      
      wx.setStorageSync('dealerOrders', orders)
      wx.showToast({ title: `成功删除 ${orderNos.length} 个订单`, icon: 'success' })
      this.loadOrders()
    } catch (error) {
      console.error('删除订单失败:', error)
      wx.showToast({ title: '删除失败', icon: 'error' })
    }
  },

  showConfirmModal(title, message, action) {
    this.setData({
      showModal: true,
      modalTitle: title,
      modalMessage: message,
      modalAction: action
    })
  },

  hideModal() {
    this.setData({ showModal: false, modalAction: null })
  },

  confirmAction() {
    if (this.data.modalAction) {
      this.data.modalAction()
    }
    this.hideModal()
  },

  switchToOrder() {
    wx.navigateTo({
      url: '/pages/dealer/order/order'
    })
  },

  getStatusText(status) {
    return this.data.statusMap[status] || '未知状态'
  },

  formatTime(timeString) {
    const date = new Date(timeString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}) 