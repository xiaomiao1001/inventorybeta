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
    this.initInventoryData();
  },

  initInventoryData() {
    // 标注：这里应该调用API获取鸿日车库存数据
    const { inventoryList } = this.data;
    this.setData({
      filteredInventory: inventoryList
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