interface IOtherInventory {
  vin: string;
  series: string;
  model: string;
  config: string;
  color: string;
  factoryDate: string;
  arrivalDate: string;
  status: string;
}

interface IOtherData {
  searchValue: string;
  filterVisible: boolean;
  inventoryList: IOtherInventory[];
  filteredInventory: IOtherInventory[];
}

Page({
  data: {
    searchValue: '',
    filterVisible: false,
    // 标注：以下是模拟数据，后续需要连接真实的数据库API
    inventoryList: [
      {
        vin: 'LVVDB11B6ND123456',
        series: '雅迪',
        model: 'G5',
        config: '标准版',
        color: '蓝色',
        factoryDate: '2025-05-20',
        arrivalDate: '2025-05-20',
        status: '在库'
      },
      {
        vin: 'LVVDB11B6ND234567',
        series: '爱玛',
        model: 'A500',
        config: '豪华版',
        color: '红色',
        factoryDate: '2025-05-18',
        arrivalDate: '2025-05-18',
        status: '在库'
      },
      {
        vin: 'LVVDB11B6ND345678',
        series: '台铃',
        model: 'N7',
        config: '运动版',
        color: '黑色',
        factoryDate: '2025-05-16',
        arrivalDate: '2025-05-16',
        status: '已预订'
      },
      {
        vin: 'LVVDB11B6ND456789',
        series: '小牛',
        model: 'NGT',
        config: '智能版',
        color: '白色',
        factoryDate: '2025-05-15',
        arrivalDate: '2025-05-15',
        status: '在库'
      }
    ],
    filteredInventory: []
  } as IOtherData,

  onLoad() {
    this.loadInventoryData();
  },

  onShow() {
    // 每次页面显示时重新加载数据，以获取最新的库存信息
    this.loadInventoryData();
  },

  // 加载库存数据
  async loadInventoryData() {
    try {
      wx.showLoading({
        title: '加载中...'
      });

      const result = await wx.cloud.callFunction({
        name: 'car-inventory',
        data: {
          action: 'query',
          data: {
            page: 1,
            limit: 100 // 加载前100条数据
          }
        }
      });

      wx.hideLoading();

      if (result.result.code === 0) {
        // 转换数据格式以匹配界面显示
        const inventoryList = result.result.data.map((item: any) => ({
          vin: item.VIN,
          series: item.brand,
          model: item.model,
          config: item.brand + ' ' + item.model, // 组合显示
          color: item.color,
          factoryDate: item.production_date,
          arrivalDate: item.created_at ? item.created_at.substring(0, 10) : item.production_date,
          status: item.stock_quantity > 0 ? '在库' : '已售出'
        }));

        this.setData({
          inventoryList: inventoryList,
          filteredInventory: inventoryList
        });
      } else {
        console.error('加载库存数据失败:', result.result.message);
        // 如果数据库查询失败，使用模拟数据
        this.setData({
          filteredInventory: this.data.inventoryList
        });
        
        wx.showToast({
          title: '数据加载失败，显示示例数据',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('调用云函数失败:', error);
      
      // 如果云函数调用失败，使用模拟数据
      this.setData({
        filteredInventory: this.data.inventoryList
      });
      
      wx.showToast({
        title: '网络错误，显示示例数据',
        icon: 'none'
      });
    }
  },

  onSearchChange(e: any) {
    const searchValue = e.detail.value;
    this.setData({ searchValue });
    this.filterInventory(searchValue);
  },

  onSearchSubmit(e: any) {
    const searchValue = e.detail.value;
    this.filterInventory(searchValue);
  },

  onSearchClear() {
    this.setData({ 
      searchValue: '',
      filteredInventory: this.data.inventoryList
    });
  },

  filterInventory(searchValue: string) {
    const { inventoryList } = this.data;
    
    if (!searchValue.trim()) {
      this.setData({ filteredInventory: inventoryList });
      return;
    }

    const filtered = inventoryList.filter(item => 
      item.vin.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.series.includes(searchValue) ||
      item.model.includes(searchValue) ||
      item.color.includes(searchValue)
    );

    this.setData({ filteredInventory: filtered });
  },

  toggleFilter() {
    this.setData({
      filterVisible: !this.data.filterVisible
    });
  },

  // 批量导入按钮点击
  onBatchImportTap() {
    console.log('其他品牌批量导入按钮被点击');
    
    // 跳转到其他品牌专用批量入库页面
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

  viewDetail(e: any) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '车辆详情',
      content: `VIN: ${item.vin}\n车型: ${item.series} ${item.model}\n配置: ${item.config}\n颜色: ${item.color}\n状态: ${item.status}`,
      showCancel: false
    });

    // 标注：这里应该跳转到车辆详情页面
    // wx.navigateTo({
    //   url: `/pages/inventory/detail/detail?vin=${item.vin}&type=other`
    // });
  },
}); 