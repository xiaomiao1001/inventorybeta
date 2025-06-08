Page({
  data: {
    keyword: ''
  },

  onLoad(options: any) {
    const keyword = options.keyword || '';
    this.setData({
      keyword: decodeURIComponent(keyword)
    });
  },

  onShow() {
    // 页面显示
  }
}); 