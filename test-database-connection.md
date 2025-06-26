# 数据库连接测试指南

## 测试步骤

### 1. 部署云函数
```bash
# 在项目根目录执行
tcb functions:deploy inventoryManager
```

### 2. 测试数据库连接
在微信开发者工具中，在任意页面的console中执行：

```javascript
// 测试基本连接
wx.cloud.callFunction({
  name: 'inventoryManager',
  data: {
    action: 'test_connection'
  },
  success: (res) => {
    console.log('连接测试结果:', res);
  },
  fail: (err) => {
    console.error('连接测试失败:', err);
  }
});
```

### 3. 初始化数据库
```javascript
// 初始化数据库表结构
wx.cloud.callFunction({
  name: 'inventoryManager',
  data: {
    action: 'init_database'
  },
  success: (res) => {
    console.log('数据库初始化结果:', res);
  },
  fail: (err) => {
    console.error('数据库初始化失败:', err);
  }
});
```

### 4. 检查环境状态
```javascript
// 检查环境配置
wx.cloud.callFunction({
  name: 'inventoryManager',
  data: {
    action: 'check_environment'
  },
  success: (res) => {
    console.log('环境检查结果:', res);
  },
  fail: (err) => {
    console.error('环境检查失败:', err);
  }
});
```

### 5. 调试数据模型
```javascript
// 调试数据模型
wx.cloud.callFunction({
  name: 'inventoryManager',
  data: {
    action: 'debug_models'
  },
  success: (res) => {
    console.log('模型调试结果:', res);
  },
  fail: (err) => {
    console.error('模型调试失败:', err);
  }
});
```

## 预期结果

### 成功的连接测试
```json
{
  "result": {
    "success": true,
    "message": "数据库连接测试成功",
    "data": {
      "environment": "cloud1-2gv7aqlv39d20b5c",
      "modelsAvailable": true,
      "timestamp": "2025-01-22T..."
    }
  }
}
```

### 成功的数据库初始化
```json
{
  "result": {
    "success": true,
    "message": "数据库初始化成功",
    "data": {
      "tablesCreated": 7,
      "dataInserted": 3
    }
  }
}
```

## 故障排除

### 如果连接失败
1. 检查CloudBase MySQL服务是否已开通
2. 确认环境ID是否正确
3. 检查云函数部署是否成功
4. 查看云函数日志获取详细错误信息

### 如果初始化失败
1. 确认数据库连接正常
2. 检查SQL语句是否有语法错误
3. 确认用户权限是否足够
4. 查看详细的错误日志

## 下一步
数据库初始化成功后，可以开始测试基础的CRUD操作：
- 添加库存数据
- 查询库存信息
- 更新库存状态
- 删除库存记录 