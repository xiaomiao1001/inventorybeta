//index.js
Page({
  data: {
    userName: '管理员',
    userRole: 'owner', // 'owner', 'admin', 'sales', 'dealer'
    inventoryOverview: {
      hongri: 32,
      secondhand: 15,
      others: 8
    },
    testResult: null,
    // 管理员功能列表
    adminFunctions: [
      { icon: 'view-list', text: '库存管理' },
      { icon: 'minus-circle', text: '销售出库' },
      { icon: 'chart', text: '统计报表' },
      { icon: 'user', text: '客户管理' }
    ],
    // 销售人员功能列表
    salesFunctions: [
      { icon: 'view-list', text: '查看库存' },
      { icon: 'minus-circle', text: '零售出库' },
      { icon: 'user', text: '客户信息' }
    ],
    // 经销商功能列表
    dealerFunctions: [
      { icon: 'view-list', text: '查看车辆' },
      { icon: 'shop', text: '进货申请' }
    ]
  },

  onLoad: function() {
    console.log('首页加载');
  },

  // 导航到页面
  onNavigateToPage: function(e) {
    const route = e.currentTarget.dataset.route;
    if (route) {
      wx.navigateTo({
        url: route
      });
    }
  },

  // 功能点击事件
  onFunctionClick: function(e) {
    const index = e.currentTarget.dataset.index;
    const userRole = this.data.userRole;
    
    if (userRole === 'admin') {
      const functionItem = this.data.adminFunctions[index];
      wx.showToast({
        title: `${functionItem.text}功能开发中...`,
        icon: 'none'
      });
    } else if (userRole === 'sales') {
      const functionItem = this.data.salesFunctions[index];
      wx.showToast({
        title: `${functionItem.text}功能开发中...`,
        icon: 'none'
      });
    } else if (userRole === 'dealer') {
      const functionItem = this.data.dealerFunctions[index];
      wx.showToast({
        title: `${functionItem.text}功能开发中...`,
        icon: 'none'
      });
    }
  },

  // 点击库存项目
  onInventoryClick: function(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击库存类型：', type);
    
    let message = '';
    switch(type) {
      case 'hongri':
        message = '鸿日车库存详情';
        break;
      case 'secondhand':
        message = '二手车库存详情';
        break;
      case 'others':
        message = '其他品牌库存详情';
        break;
      default:
        message = '库存详情';
    }
    
    wx.showToast({
      title: `${message}功能开发中...`,
      icon: 'none'
    });
  },

  // 统计数据点击事件
  onStatsClick: function(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击统计类型：', type);
    
    switch(type) {
      case 'monthly-sales':
        wx.showToast({
          title: '本月销售详情功能开发中...',
          icon: 'none'
        });
        break;
      case 'pending-credit':
        wx.showToast({
          title: '赊欠管理功能开发中...',
          icon: 'none'
        });
        break;
      case 'total-inventory':
        wx.showToast({
          title: '库存总览功能开发中...',
          icon: 'none'
        });
        break;
      default:
        wx.showToast({
          title: '功能开发中...',
          icon: 'none'
        });
    }
  },

  // 搜索相关
  onSearchChange: function(e) {
    console.log('搜索内容变化:', e.detail.value);
  },

  onSearchSubmit: function(e) {
    console.log('提交搜索:', e.detail.value);
    wx.showToast({
      title: '搜索功能开发中...',
      icon: 'none'
    });
  },

  // 扫码功能
  onScanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res);
        wx.showToast({
          title: `扫码成功: ${res.result}`,
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码取消',
          icon: 'none'
        });
      }
    });
  },

  // 登出功能
  onLogout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 数据库测试相关方法
  testDatabase: function() {
    wx.showToast({
      title: '数据库测试功能开发中...',
      icon: 'none'
    });
  },

  listTables: function() {
    wx.showToast({
      title: '查看数据表功能开发中...',
      icon: 'none'
    });
  },

  queryUsers: function() {
    wx.showToast({
      title: '查询用户数据功能开发中...',
      icon: 'none'
    });
  },

  queryCreditSituation: function() {
    wx.showToast({
      title: '查询赊欠情况功能开发中...',
      icon: 'none'
    });
  },

  queryUsedCars: function() {
    wx.showToast({
      title: '查询二手车库存功能开发中...',
      icon: 'none'
    });
  }
}); 