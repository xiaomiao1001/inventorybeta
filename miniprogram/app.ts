// app.ts

// 如果是下载 SDK 的方式，改成 const { init } = require('./wxCloudClientSDK.umd.js')
const { init } = require('./wxCloudClientSDK.umd.js');

// 指定云开发环境 ID
wx.cloud.init({
  env: "cloud1-2gv7aqlv39d20b5c", // 当前的云开发环境 ID
});

const client = init(wx.cloud);
const models = client.models; // 或者也可以直接从 wx.cloud.models 上获取，这种方式的类型提示会弱一些

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})