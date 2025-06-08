Page({
  data: {
    userRole: '',
    quickStats: {
      monthSales: 12,
      totalInventory: 55,
      pendingDebt: 3,
      monthRevenue: 35.2
    }
  },

  onLoad: function() {
    this.loadUserInfo();
    this.loadQuickStats();
  },

  onShow: function() {
    this.loadQuickStats();
  },

  // 加载用户信息
  loadUserInfo: function() {
    var userInfo = wx.getStorageSync('userInfo');
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

  // 加载快速统计数据
  loadQuickStats: function() {
    // TODO: 从数据库获取实际数据
    // 这里暂时使用模拟数据
    this.setData({
      quickStats: {
        monthSales: 12,
        totalInventory: 55,
        pendingDebt: 3,
        monthRevenue: 35.2
      }
    });
  },

  // 导航到销售统计
  navigateToSalesStats: function() {
    wx.showToast({
      title: '销售统计功能开发中',
      icon: 'none'
    });
    // TODO: 跳转到销售统计页面
    // wx.navigateTo({
    //   url: '/pages/statistics/sales/sales'
    // });
  },

  // 导航到库存统计
  navigateToInventoryStats: function() {
    wx.showToast({
      title: '库存统计功能开发中',
      icon: 'none'
    });
    // TODO: 跳转到库存统计页面
    // wx.navigateTo({
    //   url: '/pages/statistics/inventory/inventory'
    // });
  },

  // 导航到数据导出
  navigateToExports: function() {
    wx.showToast({
      title: '数据导出功能开发中',
      icon: 'none'
    });
    // TODO: 跳转到数据导出页面
    // wx.navigateTo({
    //   url: '/pages/statistics/exports/exports'
    // });
  }
}); 