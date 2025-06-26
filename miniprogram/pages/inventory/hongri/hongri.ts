interface IHongriInventory {
  vin: string;
  series: string;
  model: string;
  config: string;
  color: string;
  factoryDate: string;
  arrivalDate: string;
  status: string;
}

interface IHongriData {
  searchValue: string;
  filterVisible: boolean;
  inventoryList: IHongriInventory[];
  filteredInventory: IHongriInventory[];
}

Page({
  data: {
    searchValue: '',
    filterVisible: false,
    // 标注：以下是模拟数据，后续需要连接真实的数据库API
    inventoryList: [
      {
        vin: '123456',
        series: '鸿日A系列',
        model: 'A1',
        config: '标准版',
        color: '白色',
        factoryDate: '2025-05-20',
        arrivalDate: '2025-05-20',
        status: '在库'
      },
      {
        vin: '234567',
        series: '鸿日B系列',
        model: 'B2',
        config: '豪华版',
        color: '黑色',
        factoryDate: '2025-05-18',
        arrivalDate: '2025-05-18',
        status: '在库'
      },
      {
        vin: '345678',
        series: '鸿日A系列',
        model: 'A2',
        config: '舒适版',
        color: '红色',
        factoryDate: '2025-05-19',
        arrivalDate: '2025-05-19',
        status: '在库'
      },
      {
        vin: '456789',
        series: '鸿日C系列',
        model: 'C1',
        config: '标准版',
        color: '蓝色',
        factoryDate: '2025-05-16',
        arrivalDate: '2025-05-16',
        status: '已预订'
      },
      {
        vin: '567890',
        series: '鸿日B系列',
        model: 'B1',
        config: '豪华版',
        color: '灰色',
        factoryDate: '2025-05-14',
        arrivalDate: '2025-05-14',
        status: '在库'
      }
    ],
    filteredInventory: []
  } as IHongriData,

  onLoad() {
    this.loadInventoryData();
  },

  onShow() {
    // 每次页面显示时重新加载数据，以获取最新的库存信息
    this.loadInventoryData();
  },

  // 加载库存数据
  loadInventoryData() {
    console.log('开始加载鸿日车库存数据');
    
    // 调用云函数查询鸿日车库存
    wx.cloud.callFunction({
      name: 'car-inventory',
      data: {
        action: 'queryHR',
        data: {
          // 移除分页参数，云函数会自动分页获取所有数据
        }
      },
      success: (res) => {
        console.log('鸿日车库存查询成功:', res);
        
        const result = res.result as any;
        if (result && result.code === 0 && result.data) {
          // 转换数据格式以匹配页面显示
          const inventoryList = result.data.map((item: any) => ({
            vin: item.VIN || '',
            series: item.model_series || '',
            model: item.model_type || '',
            config: item.additional_configuration || item.configuration || '',
            color: item.color || '',
            factoryDate: item.headquarter_shipment_date || '',
            arrivalDate: item.entry_date || '',
            status: item.inventory_status || '在库'
          }));
          
          console.log('转换后的鸿日车库存数据:', inventoryList);
          console.log('鸿日车库存数据总数:', inventoryList.length);
          
          this.setData({
            inventoryList: inventoryList,
            filteredInventory: inventoryList
          });
          
          // 显示数据加载成功提示
          wx.showToast({
            title: `加载成功，共${inventoryList.length}条数据`,
            icon: 'success'
          });
        } else {
          console.log('鸿日车库存查询失败或无数据:', result?.message);
          // 如果查询失败或无数据，使用模拟数据作为备选
          this.setData({
            filteredInventory: this.data.inventoryList
          });
          
          wx.showToast({
            title: '暂无库存数据',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('鸿日车库存查询失败:', err);
        // 查询失败时使用模拟数据
        this.setData({
          filteredInventory: this.data.inventoryList
        });
        
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    });
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
    console.log('鸿日车批量导入按钮被点击');
    
    // 跳转到鸿日车专用批量入库页面
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

  viewDetail(e: any) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '车辆详情',
      content: `VIN: ${item.vin}\n车型: ${item.series} ${item.model}\n配置: ${item.config}\n颜色: ${item.color}\n状态: ${item.status}`,
      showCancel: false
    });

    // 标注：这里应该跳转到车辆详情页面
    // wx.navigateTo({
    //   url: `/pages/inventory/detail/detail?vin=${item.vin}`
    // });
  }
}); 