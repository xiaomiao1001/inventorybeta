Page({
  data: {
    userRole: '',
    recentSales: [
      {
        id: '1',
        vehicleInfo: '鸿日S1Pro 白色',
        customerName: '张三',
        saleDate: '2025-01-12',
        amount: '12,800',
        saleType: 'retail'
      },
      {
        id: '2',
        vehicleInfo: '鸿日X9 红色',
        customerName: '李四经销商',
        saleDate: '2025-01-11',
        amount: '28,500',
        saleType: 'wholesale'
      },
      {
        id: '3',
        vehicleInfo: '鸿日VeLi 蓝色',
        customerName: '王五',
        saleDate: '2025-01-10',
        amount: '15,600',
        saleType: 'retail'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo();
    this.loadRecentSales();
  },

  onShow() {
    this.loadRecentSales();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userRole: userInfo.role
      });
    } else {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 加载最近出库记录
  loadRecentSales() {
    // TODO: 从数据库获取实际数据
    // 这里暂时使用模拟数据
  },

  // 导航到零售出库
  navigateToRetail() {
    const { userRole } = this.data;
    
    // 检查权限
    if (userRole === 'owner' || userRole === 'admin' || userRole === 'sales') {
      wx.navigateTo({
        url: '/pages/sale/retail/retail'
      });
    } else {
      wx.showToast({
        title: '您没有零售出库权限',
        icon: 'none'
      });
    }
  },

  // 导航到批发出库
  navigateToWholesale() {
    const { userRole } = this.data;
    
    // 检查权限 - 只有所有者和管理员可以进行批发出库
    if (userRole === 'owner' || userRole === 'admin') {
      wx.navigateTo({
        url: '/pages/sale/wholesale/wholesale'
      });
    } else {
      wx.showToast({
        title: '您没有批发出库权限',
        icon: 'none'
      });
    }
  },

  // 查看出库详情
  viewSaleDetail(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: `查看出库记录 ${id}`,
      icon: 'none'
    });
    // TODO: 跳转到出库详情页面
    // wx.navigateTo({
    //   url: `/pages/sale/detail/detail?id=${id}`
    // });
  }
}); 