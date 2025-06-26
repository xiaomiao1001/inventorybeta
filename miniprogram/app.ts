// app.ts

// 引入云开发客户端SDK
const { init } = require("./wxCloudClientSDK.umd.js");

App<IAppOption>({
  globalData: {
    models: null as any // 全局数据模型实例
  },
  
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-2gv7aqlv39d20b5c', // 腾讯云开发环境 ID
        traceUser: true,
      });
      
      // 初始化数据模型SDK
      try {
        const client = init(wx.cloud);
        this.globalData.models = client.models;
        console.log('数据模型SDK初始化成功');
      } catch (error) {
        console.error('数据模型SDK初始化失败:', error);
      }
    }

    // 登录
    wx.login({
      success: res => {
        console.log('登录成功，code:', res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail: err => {
        console.error('登录失败:', err);
      }
    })
  }
})