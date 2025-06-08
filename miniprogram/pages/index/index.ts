// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

interface IIndexData {
  userInfo: any;
  statsData: {
    hongriInventory: number;
    yuhuYuqiang: number;
    lastMonthSales: number;
    currentMonthSales: number;
  };
  inventoryData: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  recentSales: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
}

Page({
  data: {
    userRole: '', // 用户角色：owner, admin, sales, dealer
    userName: '',
    inventoryOverview: {
      hongri: 32,
      secondhand: 15,
      others: 8
    },
    // 简化的所有者功能 - 只保留两个主要功能
    ownerFunctions: [
      { icon: 'view-list', text: '库存管理', route: '/pages/inventory/list/list' },
      { icon: 'minus-circle', text: '销售出库管理', route: '/pages/sale/list/list' }
    ],
    adminFunctions: [
      { icon: 'view-list', text: '库存管理', route: '/pages/inventory/list/list' },
      { icon: 'edit', text: '数据表编辑', route: '/pages/data-edit/list/list' },
      { icon: 'chart-bar', text: '统计报表查看', route: '/pages/statistics/list/list' }
    ],
    salesFunctions: [
      { icon: 'view-list', text: '查看库存信息', route: '/pages/inventory/list/list' },
      { icon: 'minus-circle', text: '零售出库操作', route: '/pages/sale/retail/retail' }
    ],
    dealerFunctions: [
      { icon: 'home', text: '经销商功能', route: '/pages/dealer/home/home' },
      { icon: 'info-circle', text: '待开发', route: '' }
    ]
  },

  onLoad() {
    this.loadUserInfo();
    this.loadInventoryOverview();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userRole: userInfo.role || 'sales',
        userName: userInfo.username || '用户'
      });
    } else {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 加载库存概览数据
  loadInventoryOverview() {
    // TODO: 从数据库获取实际数据
    // 这里暂时使用模拟数据
    this.setData({
      inventoryOverview: {
        hongri: 32,
        secondhand: 15,
        others: 8
      }
    });
  },

  // 获取当前用户角色的功能列表
  getCurrentFunctions() {
    const { userRole } = this.data;
    switch (userRole) {
      case 'owner':
        return this.data.ownerFunctions;
      case 'admin':
        return this.data.adminFunctions;
      case 'sales':
        return this.data.salesFunctions;
      case 'dealer':
        return this.data.dealerFunctions;
      default:
        return this.data.salesFunctions;
    }
  },

  // 新的页面跳转方法 - 处理所有者功能的直接跳转
  onNavigateToPage(e: any) {
    const { route } = e.currentTarget.dataset;
    
    if (route) {
      wx.navigateTo({
        url: route,
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 功能卡片点击事件 - 处理其他角色的功能
  onFunctionClick(e: any) {
    const { index } = e.currentTarget.dataset;
    const functions = this.getCurrentFunctions();
    const selectedFunction = functions[index];
    
    if (selectedFunction.route) {
      wx.navigateTo({
        url: selectedFunction.route,
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 库存类型点击事件
  onInventoryClick(e: any) {
    const { type } = e.currentTarget.dataset;
    let route = '';
    
    switch (type) {
      case 'hongri':
        route = '/pages/inventory/hongri/hongri';
        break;
      case 'secondhand':
        route = '/pages/inventory/secondhand/secondhand';
        break;
      case 'others':
        route = '/pages/inventory/other/other';
        break;
    }
    
    if (route) {
      wx.navigateTo({
        url: route,
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          });
        }
      });
    }
  },

  // 搜索相关方法
  onSearchChange(e: any) {
    console.log('搜索内容变化:', e.detail.value);
  },

  onSearchSubmit(e: any) {
    const keyword = e.detail.value;
    if (keyword.trim()) {
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`,
        fail: (err) => {
          console.error('搜索页面跳转失败:', err);
          wx.showToast({
            title: '搜索功能开发中',
            icon: 'none'
          });
        }
      });
    }
  },

  // 用户退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});
