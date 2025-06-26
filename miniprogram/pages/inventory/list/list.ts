Page({
  data: {
    userRole: '',
    canEdit: false,
    canAdd: false,
    inventoryCount: {
      hongri: 32,
      secondhand: 15,
      other: 8
    },
    searchKeyword: '',
    showFilter: false
  },

  onLoad() {
    console.log('库存列表页面加载');
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
    // 使用静态数据，避免数据库连接错误
    this.setData({
      inventoryCount: {
        hongri: 32,
        secondhand: 15,
        other: 8
      }
    });
  },

  // 搜索功能
  onSearchChange(e: any) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    console.log('搜索关键词:', keyword);
  },

  onSearchSubmit(e: any) {
    const keyword = e.detail.value;
    if (keyword.trim()) {
      console.log('执行搜索:', keyword);
      wx.showToast({
        title: `搜索: ${keyword}`,
        icon: 'none',
        duration: 1500
      });
      // TODO: 实现实际搜索功能
    }
  },

  // 筛选功能
  onFilterTap() {
    wx.showActionSheet({
      itemList: ['全部类型', '鸿日车', '二手车', '其他品牌', '库存充足', '库存不足'],
      success: (res) => {
        const filterOptions = ['全部类型', '鸿日车', '二手车', '其他品牌', '库存充足', '库存不足'];
        const selectedFilter = filterOptions[res.tapIndex];
        console.log('选择筛选:', selectedFilter);
        
        wx.showToast({
          title: `筛选: ${selectedFilter}`,
          icon: 'none',
          duration: 1500
        });
        
        // TODO: 实现实际筛选功能
      },
      fail: () => {
        console.log('用户取消筛选');
      }
    });
  },


  // 批量导入按钮点击
  onBatchImportTap() {
    console.log('批量导入按钮被点击');
    
    console.log('当前用户权限状态:', {
      userRole: this.data.userRole,
      canAdd: this.data.canAdd,
      canEdit: this.data.canEdit
    });
    
    // 检查权限
    if (!this.data.canAdd) {
      console.log('权限检查失败，用户没有批量导入权限');
      wx.showToast({
        title: '您没有批量导入权限',
        icon: 'none'
      });
      return;
    }

    console.log('权限检查通过，开始跳转到鸿日车批量入库页面');
    
    // 跳转到鸿日车批量入库页面，传递库存类型参数
    wx.navigateTo({
      url: '/pages/inventory/batch-import/batch-import?type=hongri&title=鸿日车批量入库',
      success: function() {
        console.log('跳转到鸿日车批量入库页面成功');
      },
      fail: function(error) {
        console.error('跳转到批量入库页面失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 其他品牌批量导入按钮点击
  onOtherBatchImportTap() {
    console.log('其他品牌批量导入按钮被点击');
    
    console.log('当前用户权限状态:', {
      userRole: this.data.userRole,
      canAdd: this.data.canAdd,
      canEdit: this.data.canEdit
    });
    
    // 检查权限
    if (!this.data.canAdd) {
      console.log('权限检查失败，用户没有批量导入权限');
      wx.showToast({
        title: '您没有批量导入权限',
        icon: 'none'
      });
      return;
    }

    console.log('权限检查通过，开始跳转到其他品牌批量入库页面');
    
    // 跳转到其他品牌批量入库页面，传递库存类型参数
    wx.navigateTo({
      url: '/pages/inventory/batch-import/batch-import?type=other&title=其他品牌批量入库',
      success: function() {
        console.log('跳转到其他品牌批量入库页面成功');
      },
      fail: function(error) {
        console.error('跳转到批量入库页面失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
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