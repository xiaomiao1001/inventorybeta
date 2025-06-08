# 第三方API技术设计文档 (TDD)

## 概述
本文档描述了郭四车行库存管理系统中涉及的第三方API集成功能的技术设计，主要包括身份证OCR识别和消息推送功能。

---

## 1. 身份证OCR识别功能

### 1.1 功能描述
在零售出库流程中，支持用户拍照或从相册选择身份证图片，通过火山引擎 Ark API 进行OCR识别，自动提取客户信息。

### 1.2 技术规格

#### 接口名称
`身份证OCR识别接口`

#### 请求路径和方法
- **服务商**: 火山引擎 (ByteDance)
- **API端点**: `https://visual.volcengineapi.com`
- **请求路径**: `/OCRNormal`
- **HTTP方法**: `POST`
- **Content-Type**: `application/json`

#### 请求参数说明

**Headers**
```json
{
  "Authorization": "HMAC-SHA256 Credential={AccessKeyId}/{Date}/{Region}/visual/request, SignedHeaders=content-type;host;x-date, Signature={Signature}",
  "Content-Type": "application/json",
  "X-Date": "{ISO8601格式时间戳}"
}
```

**Body参数**
```json
{
  "req_key": "id_card_ocr",
  "image_base64": "{base64编码的图片数据}",
  "image_url": "{图片URL地址}",
  "scene": "id_card",
  "config": {
    "detect_direction": true,
    "detect_risk": false,
    "crop_image": false
  }
}
```

**参数详细说明**:
- `req_key`: 固定值 "id_card_ocr"，标识身份证识别请求
- `image_base64`: base64编码的身份证图片数据（与image_url二选一）
- `image_url`: 身份证图片的URL地址（与image_base64二选一）
- `scene`: 固定值 "id_card"，指定识别场景
- `config.detect_direction`: 是否检测图片方向，建议设为true
- `config.detect_risk`: 是否检测风险，可设为false
- `config.crop_image`: 是否返回裁剪后的图片，可设为false

#### 依赖的外部服务
- **火山引擎 Visual Intelligence API**
- **服务地域**: 建议使用 `cn-north-1` (华北1-北京)
- **认证方式**: HMAC-SHA256签名认证
- **依赖配置**:
  - AccessKey ID
  - Secret Access Key
  - 服务地域配置

#### 示例返回JSON

**成功响应**:
```json
{
  "code": 10000,
  "message": "success",
  "request_id": "20231207123456789abcdef",
  "time_elapsed": 1.23,
  "data": {
    "id_card_info": {
      "name": "张三",
      "gender": "男",
      "nation": "汉",
      "birth": "19900101",
      "address": "北京市朝阳区某某街道某某号",
      "id_card_number": "110101199001011234",
      "issue_authority": "北京市公安局朝阳分局",
      "valid_period": "2020.01.01-2030.01.01"
    },
    "detection_info": {
      "card_type": "front",
      "card_direction": 0,
      "card_quality": "good"
    }
  }
}
```

**错误响应**:
```json
{
  "code": 40001,
  "message": "图片格式不支持",
  "request_id": "20231207123456789abcdef",
  "time_elapsed": 0.5,
  "data": null
}
```

**字段说明**:
- `name`: 姓名
- `gender`: 性别
- `nation`: 民族
- `birth`: 出生日期 (YYYYMMDD格式)
- `address`: 地址
- `id_card_number`: 身份证号码
- `issue_authority`: 签发机关
- `valid_period`: 有效期限
- `card_type`: 卡片类型 (front/back)
- `card_direction`: 图片方向 (0-正向, 90-顺时针90度, 180-180度, 270-逆时针90度)
- `card_quality`: 图片质量评估

---

## 2. 微信小程序消息推送功能

### 2.1 功能描述
用于赊欠管理中的还款提醒功能，通过微信小程序的模板消息或订阅消息向用户推送还款提醒。

### 2.2 技术规格

#### 接口名称
`微信小程序订阅消息推送接口`

#### 请求路径和方法
- **服务商**: 微信开放平台
- **API端点**: `https://api.weixin.qq.com`
- **请求路径**: `/cgi-bin/message/subscribe/send`
- **HTTP方法**: `POST`
- **Content-Type**: `application/json`

#### 请求参数说明

**URL参数**
```
access_token={ACCESS_TOKEN}
```

**Body参数**
```json
{
  "touser": "{用户openid}",
  "template_id": "{模板ID}",
  "page": "pages/debt/detail?id={债务ID}",
  "miniprogram_state": "formal",
  "lang": "zh_CN",
  "data": {
    "thing1": {
      "value": "车辆销售赊欠"
    },
    "amount2": {
      "value": "5000.00"
    },
    "date3": {
      "value": "2023年12月15日"
    },
    "thing4": {
      "value": "请及时还款，避免影响信用"
    }
  }
}
```

**参数详细说明**:
- `touser`: 接收消息的用户openid
- `template_id`: 订阅消息模板ID
- `page`: 点击消息跳转的小程序页面路径
- `miniprogram_state`: 小程序状态 (developer/trial/formal)
- `lang`: 语言，默认zh_CN
- `data`: 模板数据，根据模板字段填充

#### 依赖的外部服务
- **微信小程序API**
- **认证方式**: Access Token
- **依赖配置**:
  - 小程序AppID
  - 小程序AppSecret
  - 订阅消息模板ID

#### 示例返回JSON

**成功响应**:
```json
{
  "errcode": 0,
  "errmsg": "ok",
  "msgid": 123456789
}
```

**错误响应**:
```json
{
  "errcode": 43101,
  "errmsg": "user refuse to receive the msg"
}
```

**常见错误码**:
- `43101`: 用户拒绝接收该小程序的模板消息
- `47003`: 模板参数不正确
- `41030`: 不合法的refresh_token
- `40037`: 不合法的template_id

---

## 3. 实现注意事项

### 3.1 身份证OCR识别
1. **图片预处理**: 建议在上传前对图片进行压缩和格式转换
2. **错误处理**: 需要处理网络异常、识别失败、图片质量差等情况
3. **数据验证**: 对识别结果进行基本的格式验证（如身份证号码格式）
4. **隐私保护**: 识别后的图片数据应及时清理，避免敏感信息泄露
5. **成本控制**: 建议添加调用频率限制，避免恶意调用

### 3.2 消息推送
1. **用户授权**: 需要用户主动订阅消息模板
2. **推送时机**: 建议在约定还款日期前3天、1天、当天分别推送
3. **消息内容**: 内容应简洁明了，包含关键信息
4. **推送频率**: 避免频繁推送造成用户反感
5. **失败重试**: 对推送失败的情况进行适当重试

### 3.3 通用注意事项
1. **API密钥安全**: 所有API密钥应存储在服务端，不得暴露在客户端
2. **请求限流**: 实现合理的请求频率限制
3. **日志记录**: 记录API调用日志，便于问题排查
4. **监控告警**: 对API调用失败率进行监控和告警
5. **降级方案**: 准备API服务不可用时的降级处理方案

---

## 4. 集成时序图

### 4.1 身份证识别流程
```
用户 -> 小程序前端 -> 云函数 -> 火山引擎API -> 云函数 -> 小程序前端 -> 用户
  |        |           |         |              |         |            |
  拍照    上传图片    调用OCR    识别处理        返回结果   填充表单    确认信息
```

### 4.2 消息推送流程
```
定时任务 -> 云函数 -> 微信API -> 用户
    |        |        |        |
  检查到期  发送推送  推送消息  接收提醒
```

---

*文档版本: v1.0*  
*创建时间: 2024年12月*  
*更新时间: 2024年12月* 