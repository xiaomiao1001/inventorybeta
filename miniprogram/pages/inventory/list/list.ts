Page({
  data: {
    userRole: '',
    canEdit: false,
    canAdd: false,
    inventoryCount: {
      hongri: 32,
      secondhand: 15,
      other: 8
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadInventoryCount();
  },

  onShow() {
    this.loadInventoryCount();
  },

  // 加载用户信息并设置权限
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const { role } = userInfo;
      this.setData({
        userRole: role,
        canEdit: role === 'owner' || role === 'admin',
        canAdd: role === 'owner' || role === 'admin'
      });
    } else {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 加载库存数量
  loadInventoryCount() {
    // TODO: 从数据库获取实际数据
    // 这里暂时使用模拟数据
    this.setData({
      inventoryCount: {
        hongri: 32,
        secondhand: 15,
        other: 8
      }
    });
  },

  // 导航到鸿日车库存
  navigateToHongri() {
    wx.navigateTo({
      url: '/pages/inventory/hongri/hongri'
    });
  },

  // 导航到二手车库存
  navigateToSecondhand() {
    wx.navigateTo({
      url: '/pages/inventory/secondhand/secondhand'
    });
  },

  // 导航到其他品牌车库存
  navigateToOther() {
    wx.navigateTo({
      url: '/pages/inventory/other/other'
    });
  }
}); 