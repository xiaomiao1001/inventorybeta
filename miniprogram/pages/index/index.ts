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
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息
    testResult: null as any,
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
    ],
    logs: [] as string[]
  },

  onLoad() {
    this.loadUserInfo();
    this.loadInventoryOverview();
    if (typeof wx.getUserProfile === 'function') {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => {
        return new Date(log).toString()
      })
    })
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
      // 检查是否为tabbar页面
      const tabbarPages = [
        '/pages/index/index',
        '/pages/inventory/list/list',
        '/pages/sale/list/list',
        '/pages/statistics/list/list'
      ];
      
      if (tabbarPages.includes(route)) {
        // 使用switchTab跳转tabbar页面
        wx.switchTab({
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
        // 使用navigateTo跳转普通页面
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
      // 检查是否为tabbar页面
      const tabbarPages = [
        '/pages/index/index',
        '/pages/inventory/list/list',
        '/pages/sale/list/list',
        '/pages/statistics/list/list'
      ];
      
      if (tabbarPages.includes(selectedFunction.route)) {
        // 使用switchTab跳转tabbar页面
        wx.switchTab({
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
        // 使用navigateTo跳转普通页面
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
      }
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
  },

  // 扫码搜索功能
  onScanCode() {
    wx.scanCode({
      success: (res) => {
        const scannedCode = res.result;
        console.log('扫码结果:', scannedCode);
        
        // 自动在搜索框中填入扫码结果并执行搜索
        wx.navigateTo({
          url: `/pages/search/search?keyword=${encodeURIComponent(scannedCode)}&scanMode=true`,
          fail: (err) => {
            console.error('搜索页面跳转失败:', err);
            wx.showToast({
              title: `扫到: ${scannedCode}`,
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        if (err.errMsg && err.errMsg.includes('cancel')) {
          // 用户取消扫码，不显示错误信息
          return;
        }
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  getUserProfile(e: any) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
});
