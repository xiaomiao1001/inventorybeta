Page({
  data: {
    orderDetail: {},
    loading: true,
    orderNo: '',
    
    // 状态映射
    statusMap: {
      'pending': '待提交',
      'submitted': '已提交待确认调车',
      'confirmed': '已调车待发货',
      'shipped': '已发货结算',
      'completed': '已完成'
    },
    
    // 状态emoji映射
    statusEmojiMap: {
      'pending': '📝',
      'submitted': '🚗',
      'confirmed': '✅',
      'shipped': '🚚',
      'completed': '🎉'
    },
    
    // 提车方式映射
    deliveryMethodMap: {
      'logistics': '物流发运',
      'pickup': '自提',
      'delivery': '送车'
    },
    
    // 颜色代码映射
    colorCodeMap: {
      '红色': '#ff0000',
      '蓝色': '#0066cc',
      '白色': '#ffffff',
      '黑色': '#000000',
      '银色': '#c0c0c0',
      '灰色': '#808080'
    }
  },

  onLoad(options) {
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo })
      this.loadOrderDetail(options.orderNo)
    } else {
      wx.showToast({
        title: '订单号不能为空',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载订单详情
  loadOrderDetail(orderNo) {
    this.setData({ loading: true })
    
    try {
      const orders = wx.getStorageSync('dealerOrders') || []
      const orderDetail = orders.find(order => order.orderNo === orderNo)
      
      if (orderDetail) {
        this.setData({
          orderDetail,
          loading: false
        })
      } else {
        wx.showToast({
          title: '订单不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 编辑订单
  editOrder() {
    wx.navigateTo({
      url: `/pages/dealer/order/order?orderNo=${this.data.orderNo}`
    })
  },

  // 提交订单
  submitOrder() {
    wx.showModal({
      title: '提交订单',
      content: '确认提交此订单？\n\n提交后将等待厂家确认调车。',
      success: (res) => {
        if (res.confirm) {
          this.doSubmitOrder()
        }
      }
    })
  },

  // 执行提交订单
  doSubmitOrder() {
    try {
      let orders = wx.getStorageSync('dealerOrders') || []
      
      // 更新订单状态
      orders = orders.map(order => {
        if (order.orderNo === this.data.orderNo) {
          return {
            ...order,
            status: 'submitted',
            updatedAt: new Date().toISOString()
          }
        }
        return order
      })
      
      wx.setStorageSync('dealerOrders', orders)
      
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      
      // 重新加载订单详情
      this.loadOrderDetail(this.data.orderNo)
    } catch (error) {
      console.error('提交订单失败:', error)
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      })
    }
  },

  // 获取状态文本
  getStatusText(status) {
    return this.data.statusMap[status] || '未知状态'
  },

  // 获取状态emoji
  getStatusEmoji(status) {
    return this.data.statusEmojiMap[status] || '❓'
  },

  // 获取提车方式文本
  getDeliveryMethodText(method) {
    return this.data.deliveryMethodMap[method] || '未知方式'
  },

  // 获取颜色代码
  getColorCode(colorName) {
    return this.data.colorCodeMap[colorName] || '#ff0000'
  },

  // 获取时间线状态
  getTimelineStatus(targetStatus, currentStatus) {
    const statusOrder = ['pending', 'submitted', 'confirmed', 'shipped', 'completed']
    const targetIndex = statusOrder.indexOf(targetStatus)
    const currentIndex = statusOrder.indexOf(currentStatus)
    
    if (currentIndex > targetIndex) {
      return 'completed'
    } else if (currentIndex === targetIndex) {
      return 'current'
    } else {
      return 'pending'
    }
  },

  // 格式化时间
  formatTime(timeString) {
    if (!timeString) return ''
    
    const date = new Date(timeString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
}) 