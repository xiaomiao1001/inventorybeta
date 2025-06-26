/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    models?: any, // 数据模型实例
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}