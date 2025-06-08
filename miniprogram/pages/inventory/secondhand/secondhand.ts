interface ISecondhandInventory {
  id: string;
  brand: string;
  color: string;
  arrivalDate: string;
  source: string;
  price: number;
  status: string;
  operator: string;
}

interface ISecondhandData {
  searchValue: string;
  filterVisible: boolean;
  inventoryList: ISecondhandInventory[];
  filteredInventory: ISecondhandInventory[];
}

Page({
  data: {
    searchValue: '',
    filterVisible: false,
    // 标注：以下是模拟数据，后续需要连接真实的数据库API
    inventoryList: [
      {
        id: '1',
        brand: '奥迪A6',
        color: '黑色',
        arrivalDate: '2025-06-03',
        source: '旧车折抵',
        price: 120000,
        status: '在库',
        operator: '张三'
      },
      {
        id: '2',
        brand: '宝马X5',
        color: '白色',
        arrivalDate: '2025-05-28',
        source: '客户置换',
        price: 280000,
        status: '在库',
        operator: '李四'
      },
      {
        id: '3',
        brand: '大众帕萨特',
        color: '银色',
        arrivalDate: '2025-05-25',
        source: '旧车折抵',
        price: 85000,
        status: '已售',
        operator: '王五'
      },
      {
        id: '4',
        brand: '丰田凯美瑞',
        color: '红色',
        arrivalDate: '2025-05-22',
        source: '收购',
        price: 95000,
        status: '在库',
        operator: '赵六'
      }
    ],
    filteredInventory: []
  } as ISecondhandData,

  onLoad() {
    this.initInventoryData();
  },

  initInventoryData() {
    // 标注：这里应该调用API获取二手车库存数据
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
      item.brand.includes(searchValue) ||
      item.color.includes(searchValue) ||
      item.source.includes(searchValue)
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
      title: '二手车详情',
      content: `品牌: ${item.brand}\n颜色: ${item.color}\n来源: ${item.source}\n价格: ¥${item.price}\n状态: ${item.status}`,
      showCancel: false
    });

    // 标注：这里应该跳转到二手车详情页面
    // wx.navigateTo({
    //   url: `/pages/inventory/detail/detail?id=${item.id}&type=secondhand`
    // });
  }
}); 