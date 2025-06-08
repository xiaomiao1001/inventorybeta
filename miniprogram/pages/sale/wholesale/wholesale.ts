interface IRecentWholesale {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface IWholesaleData {
  recentWholesales: IRecentWholesale[];
}

Page({
  data: {
    // 标注：以下是模拟数据，后续需要连接真实的数据库API
    recentWholesales: [
      {
        id: '1',
        title: '批发给新街经销商',
        description: '鸿日A1 白色 × 3辆',
        date: '2025-06-05'
      },
      {
        id: '2',
        title: '批发给后旗经销商',
        description: '鸿日B2 黑色 × 2辆',
        date: '2025-06-03'
      },
      {
        id: '3',
        title: '批发给沙海经销商',
        description: '雅迪G5 蓝色 × 1辆',
        date: '2025-06-01'
      }
    ]
  } as IWholesaleData,

  onLoad() {
    this.loadRecentWholesales();
  },

  loadRecentWholesales() {
    // 标注：这里应该调用API获取最近的批发出库记录
    console.log('Loading recent wholesale records...');
  },

  selectInventoryType(e: any) {
    const type = e.currentTarget.dataset.type;
    
    // 根据选择的库存类型，跳转到对应的批发出库详情页面
    // 标注：后续需要创建批发出库详情页面
    wx.showToast({
      title: `选择了${this.getInventoryTypeName(type)}`,
      icon: 'none'
    });

    // 实际应该跳转到批发出库详情页面
    // wx.navigateTo({
    //   url: `/pages/sale/wholesale/detail?type=${type}`
    // });
  },

  getInventoryTypeName(type: string): string {
    const typeMap: { [key: string]: string } = {
      hongri: '鸿日车库存',
      secondhand: '二手车库存',
      other: '其他品牌车库存'
    };
    return typeMap[type] || '未知类型';
  },

  viewWholesaleDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `查看批发记录 ${id}`,
      icon: 'none'
    });

    // 标注：这里应该跳转到批发详情页面
    // wx.navigateTo({
    //   url: `/pages/sale/wholesale/detail?id=${id}`
    // });
  }
}); 