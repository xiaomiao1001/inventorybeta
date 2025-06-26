# 汽车库存管理云函数

## 功能说明

这个云函数用于管理其他品牌汽车库存，支持增删改查操作，使用MySQL数据库存储数据。

## 配置步骤

### 1. 环境配置

1. 复制配置文件：
   ```bash
   cp config.example.json config.json
   ```

2. 修改 `config.json` 中的配置：
   - `env`: 您的腾讯云开发环境ID
   - `credentials`: 云开发访问凭证（可选）

3. 在云函数代码中修改环境ID：
   ```javascript
   const app = tcb.init({
     env: "您的实际环境ID" // 替换这里
   });
   ```

### 2. 数据库配置

1. 登录腾讯云开发控制台
2. 进入「数据库管理」→「MySQL」
3. 执行 `database-setup.sql` 中的SQL语句创建表和索引

### 3. 部署云函数

```bash
# 安装依赖
npm install

# 部署到云端
npm run deploy
```

## API 接口

### 添加库存记录

```javascript
// 调用示例
wx.cloud.callFunction({
  name: 'car-inventory',
  data: {
    action: 'add',
    data: {
      VIN: '1HGBH41JXMN109186',
      brand: '本田',
      model: '雅阁',
      color: '白色',
      production_date: '2023-12-01',
      price: 250000.00,
      stock_quantity: 5
    }
  }
})
```

### 更新库存记录

```javascript
wx.cloud.callFunction({
  name: 'car-inventory',
  data: {
    action: 'update',
    data: {
      VIN: '1HGBH41JXMN109186',
      brand: '本田',
      model: '雅阁改款',
      color: '黑色',
      production_date: '2023-12-01',
      price: 260000.00,
      stock_quantity: 3
    }
  }
})
```

### 删除库存记录

```javascript
wx.cloud.callFunction({
  name: 'car-inventory',
  data: {
    action: 'delete',
    data: {
      VIN: '1HGBH41JXMN109186'
    }
  }
})
```

### 查询库存记录（分页）

```javascript
wx.cloud.callFunction({
  name: 'car-inventory',
  data: {
    action: 'query',
    data: {
      page: 1,
      limit: 10,
      brand: '本田', // 可选筛选条件
      model: '雅阁'  // 可选筛选条件
    }
  }
})
```

### 根据VIN码查询

```javascript
wx.cloud.callFunction({
  name: 'car-inventory',
  data: {
    action: 'queryByVin',
    data: {
      VIN: '1HGBH41JXMN109186'
    }
  }
})
```

## 数据格式要求

### VIN码
- 必须为17位字符串
- 不能为空

### 出厂日期
- 格式必须为：YYYY-MM-DD
- 例如：2023-12-01

### 价格
- 支持两位小数
- 单位：分

## 安全特性

1. **防SQL注入**：使用预编译SQL语句(`$runSQL`)
2. **VIN唯一性**：数据库层面建立唯一索引
3. **数据验证**：严格的输入参数验证
4. **错误处理**：完善的异常捕获和处理

## 错误码说明

- `0`: 操作成功
- `-1`: 操作失败，具体错误信息见message字段

## 注意事项

1. 确保MySQL数据库已正确配置
2. VIN码建立了唯一索引，重复添加会失败
3. 日期格式必须严格按照YYYY-MM-DD格式
4. 所有SQL操作都使用参数化查询防止注入攻击 