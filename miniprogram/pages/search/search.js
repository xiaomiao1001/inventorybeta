// pages/search/search.js
Page({
  data: {
    keyword: ''
  },

  onLoad: function(options) {
    var keyword = options.keyword || '';
    this.setData({
      keyword: decodeURIComponent(keyword)
    });
  },

  onShow: function() {
    // 页面显示
  }
}); 