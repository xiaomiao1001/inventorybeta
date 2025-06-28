'use strict';

// 引入微达低代码客户端SDK
const { init } = require('./wxCloudClientSDK.umd.js');

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('云函数开始执行:', event);
  
  const { action, data } = event;
  
  try {
    switch (action) {
      // 其他品牌库存操作
      case 'add':
        return await addInventory(data);
      case 'addMany':
        return await addManyInventory(data);
      case 'query':
        return await queryInventory(data);
      case 'queryByVin':
        return await queryByVin(data);
      
      // 鸿日车库存操作
      case 'addHR':
        return await addHRInventory(data);
      case 'addManyHR':
        return await addManyHRInventory(data);
      case 'queryHR':
        return await queryHRInventory(data);
      case 'queryByVinHR':
        return await queryByVinHR(data);
      
      // 车辆价格查询操作
      case 'queryVehiclePrices':
        return await queryVehiclePrices(data);
      
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: -1,
      message: error.message,
      data: null
    };
  }
};

/**
 * 添加库存记录 - 使用微达数据模型API
 */
const addInventory = async (data) => {
  try {
    const { VIN, brand, model, color, production_date } = data;
    
    console.log('接收到的数据:', data);
    
    // 基本验证
    if (!VIN || !brand || !model || !production_date) {
      throw new Error('缺少必要字段：VIN, brand, model, production_date');
    }
    
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(production_date)) {
      throw new Error('日期格式必须为YYYY-MM-DD');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 根据数据模型字段构建数据
    const insertData = {
      VIN_num: VIN,                    // 车架号
      Production_Date: production_date, // 出厂日期
      color: color || '',              // 颜色
      configuration: `${brand} ${model}`, // 配置
      series: brand,                   // 系列
      Vehicle_Model_Series: model      // 车型系列
    };
    
    console.log('准备插入的数据:', insertData);
    
    // 使用微达数据模型API创建记录
    const result = await cloud.models.other_brand_inventory.create({
      data: insertData,
      envType: "prod" // 使用正式环境
    });
    
    console.log('数据模型操作结果:', result);
    
    return {
      code: 0,
      message: '添加成功',
      data: result.data
    };
    
  } catch (error) {
    console.error('添加库存记录错误:', error);
    
    // 处理重复VIN码
    if (error.message && (error.message.includes('Duplicate') || error.message.includes('duplicate'))) {
      return {
        code: -1,
        message: 'VIN码已存在，请检查车架号',
        data: null
      };
    }
    
    return {
      code: -1,
      message: `添加失败: ${error.message}`,
      data: null
    };
  }
};

/**
 * 查询库存记录
 */
const queryInventory = async (data) => {
  try {
    const { brand, model } = data;
    
    console.log('查询参数:', data);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 构建查询条件
    const where = {};
    if (brand) {
      where.series = brand;
    }
    if (model) {
      where.Vehicle_Model_Series = model;
    }
    
    // 分页查询所有数据，每次最多200条
    let allRecords = [];
    let currentPage = 1;
    const pageSize = 200; // 微达API最大支持200条
    let hasMore = true;
    
    while (hasMore) {
      console.log(`正在查询其他品牌第${currentPage}页，每页${pageSize}条`);
      
      const result = await cloud.models.other_brand_inventory.list({
        filter: {
          where: where
        },
        select: {
          $master: true
        },
        pageSize: pageSize,
        pageNumber: currentPage,
        envType: "prod" // 使用正式环境
      });
      
      console.log(`其他品牌第${currentPage}页查询结果:`, result);
      
      // 处理返回数据，适配不同的返回格式
      let records = [];
      if (result && result.data) {
        // 如果result.data是数组
        if (Array.isArray(result.data)) {
          records = result.data;
        }
        // 如果result.data是对象，可能包含records字段
        else if (result.data.records && Array.isArray(result.data.records)) {
          records = result.data.records;
        }
        // 如果result.data是对象，可能包含list字段
        else if (result.data.list && Array.isArray(result.data.list)) {
          records = result.data.list;
        }
        // 其他情况，尝试直接使用
        else {
          console.warn(`其他品牌第${currentPage}页未知的数据格式:`, result.data);
          records = [];
        }
      }
      
      console.log(`其他品牌第${currentPage}页处理后的records:`, records.length, '条');
      
      // 将当前页数据添加到总结果中
      allRecords = allRecords.concat(records);
      
      // 判断是否还有更多数据
      if (records.length < pageSize) {
        // 当前页数据少于pageSize，说明已经是最后一页
        hasMore = false;
      } else {
        // 继续查询下一页
        currentPage++;
      }
      
      // 防止无限循环，最多查询50页（10000条数据）
      if (currentPage > 50) {
        console.warn('其他品牌已达到最大查询页数限制，停止查询');
        hasMore = false;
      }
    }
    
    console.log('其他品牌所有数据查询完成，总共:', allRecords.length, '条');
    
    // 转换数据格式
    const formattedRecords = allRecords.map(item => ({
      VIN: item.VIN_num || item.vin_num || '',
      brand: item.series || '',
      model: item.Vehicle_Model_Series || item.vehicle_model_series || '',
      color: item.color || '',
      production_date: item.Production_Date || item.production_date || '',
      created_at: item.Production_Date || item.production_date || '', // 使用出厂日期作为创建时间
      stock_quantity: 1 // 默认库存为1
    }));
    
    return {
      code: 0,
      message: '查询成功',
      data: formattedRecords,
      total: formattedRecords.length
    };
    
  } catch (error) {
    console.error('查询库存记录错误:', error);
    return {
      code: -1,
      message: `查询失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 根据VIN码查询单条记录
 */
const queryByVin = async (data) => {
  try {
    const { VIN } = data;
    
    if (!VIN) {
      throw new Error('VIN码不能为空');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    const result = await cloud.models.other_brand_inventory.list({
      filter: {
        where: {
          VIN_num: VIN
        }
      },
      select: {
        $master: true
      },
      pageSize: 1,
      envType: "prod" // 使用正式环境
    });
    
    console.log('VIN查询结果:', result);
    
    // 处理返回数据，适配不同的返回格式
    let records = [];
    if (result && result.data) {
      // 如果result.data是数组
      if (Array.isArray(result.data)) {
        records = result.data;
      }
      // 如果result.data是对象，可能包含records字段
      else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      }
      // 如果result.data是对象，可能包含list字段
      else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    if (!records || records.length === 0) {
      return {
        code: -1,
        message: '未找到该VIN码对应的记录',
        data: null
      };
    }
    
    const item = records[0];
    const record = {
      VIN: item.VIN_num || item.vin_num || '',
      brand: item.series || '',
      model: item.Vehicle_Model_Series || item.vehicle_model_series || '',
      color: item.color || '',
      production_date: item.Production_Date || item.production_date || '',
      created_at: item.Production_Date || item.production_date || '',
      stock_quantity: 1
    };
    
    return {
      code: 0,
      message: '查询成功',
      data: record
    };
    
  } catch (error) {
    console.error('VIN查询错误:', error);
    return {
      code: -1,
      message: `查询失败: ${error.message}`,
      data: null
    };
  }
};

/**
 * 批量添加库存记录 - 使用微达数据模型API
 */
const addManyInventory = async (data) => {
  try {
    const { items } = data;
    
    console.log('接收到的批量数据:', data);
    
    // 基本验证
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('缺少必要字段：items，且必须为非空数组');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 验证和转换每条数据
    const insertDataList = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { VIN, brand, model, color, production_date } = item;
      
      // 基本验证
      if (!VIN || !brand || !model || !production_date) {
        throw new Error(`第${i + 1}条数据缺少必要字段：VIN, brand, model, production_date`);
      }
      
      // 验证日期格式
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(production_date)) {
        throw new Error(`第${i + 1}条数据日期格式必须为YYYY-MM-DD`);
      }
      
      // 构建数据
      const insertData = {
        VIN_num: VIN,                    // 车架号
        Production_Date: production_date, // 出厂日期
        color: color || '',              // 颜色
        configuration: `${brand} ${model}`, // 配置
        series: brand,                   // 系列
        Vehicle_Model_Series: model      // 车型系列
      };
      
      insertDataList.push(insertData);
    }
    
    console.log('准备批量插入的数据:', insertDataList);
    
    // 使用微达数据模型API批量创建记录
    const result = await cloud.models.other_brand_inventory.createMany({
      data: insertDataList,
      envType: "prod" // 使用正式环境
    });
    
    console.log('批量数据模型操作结果:', result);
    
    return {
      code: 0,
      message: `批量添加成功，共添加${insertDataList.length}条记录`,
      data: result.data
    };
    
  } catch (error) {
    console.error('批量添加库存记录错误:', error);
    
    return {
      code: -1,
      message: `批量添加失败: ${error.message}`,
      data: null
    };
  }
};

// ==================== 鸿日车库存相关函数 ====================

/**
 * 添加鸿日车库存记录 - 使用微达数据模型API
 */
const addHRInventory = async (data) => {
  try {
    const { VIN, model_series, model_type, color, entry_date, headquarter_shipment_date, additional_configuration, configuration } = data;
    
    console.log('接收到的鸿日车数据:', data);
    
    // 基本验证
    if (!VIN || !model_series || !model_type || !entry_date) {
      throw new Error('缺少必要字段：VIN, model_series, model_type, entry_date');
    }
    
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry_date)) {
      throw new Error('入库日期格式必须为YYYY-MM-DD');
    }
    if (headquarter_shipment_date && !dateRegex.test(headquarter_shipment_date)) {
      throw new Error('总部出库日期格式必须为YYYY-MM-DD');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 根据inventory_model数据模型字段构建数据
    const insertData = {
      VIN_number: VIN,                                    // VIN码
      model_series: model_series,                         // 车型系列
      model_type: model_type,                            // 车型
      color: color || '',                                // 颜色
      configuration: configuration || `${model_series} ${model_type}`, // 配置，优先使用传入的configuration
      additional_configuration: additional_configuration || '', // 增加配置
      entry_date: entry_date,                            // 入库日期
      headquarter_shipment_date: headquarter_shipment_date || '', // 总部出库时间
      inventory_status: '在库'                           // 库存状态，默认为在库
    };
    
    console.log('准备插入的鸿日车数据:', insertData);
    
    // 使用微达数据模型API创建记录
    const result = await cloud.models.inventory_model.create({
      data: insertData,
      envType: "prod" // 使用正式环境
    });
    
    console.log('鸿日车数据模型操作结果:', result);
    
    return {
      code: 0,
      message: '鸿日车添加成功',
      data: result.data
    };
    
  } catch (error) {
    console.error('添加鸿日车库存记录错误:', error);
    
    // 处理重复VIN码
    if (error.message && (error.message.includes('Duplicate') || error.message.includes('duplicate'))) {
      return {
        code: -1,
        message: 'VIN码已存在，请检查车架号',
        data: null
      };
    }
    
    return {
      code: -1,
      message: `鸿日车添加失败: ${error.message}`,
      data: null
    };
  }
};

/**
 * 批量添加鸿日车库存记录 - 使用微达数据模型API
 */
const addManyHRInventory = async (data) => {
  try {
    const { items } = data;
    
    console.log('接收到的鸿日车批量数据:', data);
    
    // 基本验证
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('缺少必要字段：items，且必须为非空数组');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 验证和转换每条数据
    const insertDataList = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { VIN, model_series, model_type, color, entry_date, headquarter_shipment_date, additional_configuration, configuration } = item;
      
      // 基本验证
      if (!VIN || !model_series || !model_type || !entry_date) {
        throw new Error(`第${i + 1}条数据缺少必要字段：VIN, model_series, model_type, entry_date`);
      }
      
      // 验证日期格式
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(entry_date)) {
        throw new Error(`第${i + 1}条数据入库日期格式必须为YYYY-MM-DD`);
      }
      if (headquarter_shipment_date && !dateRegex.test(headquarter_shipment_date)) {
        throw new Error(`第${i + 1}条数据总部出库日期格式必须为YYYY-MM-DD`);
      }
      
      // 构建数据
      const insertData = {
        VIN_number: VIN,                                    // VIN码
        model_series: model_series,                         // 车型系列
        model_type: model_type,                            // 车型
        color: color || '',                                // 颜色
        configuration: configuration || `${model_series} ${model_type}`, // 配置，优先使用传入的configuration
        additional_configuration: additional_configuration || '', // 增加配置
        entry_date: entry_date,                            // 入库日期
        headquarter_shipment_date: headquarter_shipment_date || '', // 总部出库时间
        inventory_status: '在库'                           // 库存状态，默认为在库
      };
      
      insertDataList.push(insertData);
    }
    
    console.log('准备批量插入的鸿日车数据:', insertDataList);
    
    // 使用微达数据模型API批量创建记录
    const result = await cloud.models.inventory_model.createMany({
      data: insertDataList,
      envType: "prod" // 使用正式环境
    });
    
    console.log('鸿日车批量数据模型操作结果:', result);
    
    return {
      code: 0,
      message: `鸿日车批量添加成功，共添加${insertDataList.length}条记录`,
      data: result.data
    };
    
  } catch (error) {
    console.error('批量添加鸿日车库存记录错误:', error);
    
    return {
      code: -1,
      message: `鸿日车批量添加失败: ${error.message}`,
      data: null
    };
  }
};

/**
 * 查询鸿日车库存记录
 */
const queryHRInventory = async (data) => {
  try {
    const { model_series, model_type, inventory_status } = data;
    
    console.log('鸿日车查询参数:', data);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 构建查询条件
    const where = {};
    if (model_series) {
      where.model_series = model_series;
    }
    if (model_type) {
      where.model_type = model_type;
    }
    if (inventory_status) {
      where.inventory_status = inventory_status;
    }
    
    // 分页查询所有数据，每次最多200条
    let allRecords = [];
    let currentPage = 1;
    const pageSize = 200; // 微达API最大支持200条
    let hasMore = true;
    
    while (hasMore) {
      console.log(`正在查询第${currentPage}页，每页${pageSize}条`);
      
      const result = await cloud.models.inventory_model.list({
        filter: {
          where: where
        },
        select: {
          $master: true
        },
        pageSize: pageSize,
        pageNumber: currentPage,
        envType: "prod" // 使用正式环境
      });
      
      console.log(`第${currentPage}页查询结果:`, result);
      
      // 处理返回数据，适配不同的返回格式
      let records = [];
      if (result && result.data) {
        // 如果result.data是数组
        if (Array.isArray(result.data)) {
          records = result.data;
        }
        // 如果result.data是对象，可能包含records字段
        else if (result.data.records && Array.isArray(result.data.records)) {
          records = result.data.records;
        }
        // 如果result.data是对象，可能包含list字段
        else if (result.data.list && Array.isArray(result.data.list)) {
          records = result.data.list;
        }
        // 其他情况，尝试直接使用
        else {
          console.warn(`第${currentPage}页鸿日车未知的数据格式:`, result.data);
          records = [];
        }
      }
      
      console.log(`第${currentPage}页处理后的records:`, records.length, '条');
      
      // 将当前页数据添加到总结果中
      allRecords = allRecords.concat(records);
      
      // 判断是否还有更多数据
      if (records.length < pageSize) {
        // 当前页数据少于pageSize，说明已经是最后一页
        hasMore = false;
      } else {
        // 继续查询下一页
        currentPage++;
      }
      
      // 防止无限循环，最多查询50页（10000条数据）
      if (currentPage > 50) {
        console.warn('已达到最大查询页数限制，停止查询');
        hasMore = false;
      }
    }
    
    console.log('鸿日车所有数据查询完成，总共:', allRecords.length, '条');
    
    // 转换数据格式
    const formattedRecords = allRecords.map(item => ({
      VIN: item.VIN_number || item.vin_number || '',
      model_series: item.model_series || '',
      model_type: item.model_type || '',
      color: item.color || '',
      configuration: item.configuration || '',
      additional_configuration: item.additional_configuration || '',
      entry_date: item.entry_date || '',
      headquarter_shipment_date: item.headquarter_shipment_date || '',
      inventory_status: item.inventory_status || '在库',
      created_at: item.entry_date || '', // 使用入库日期作为创建时间
      stock_quantity: 1 // 默认库存为1
    }));
    
    return {
      code: 0,
      message: '鸿日车查询成功',
      data: formattedRecords,
      total: formattedRecords.length // 添加总数统计
    };
    
  } catch (error) {
    console.error('查询鸿日车库存记录错误:', error);
    return {
      code: -1,
      message: `鸿日车查询失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 根据VIN码查询鸿日车单条记录
 */
const queryByVinHR = async (data) => {
  try {
    const { VIN } = data;
    
    if (!VIN) {
      throw new Error('VIN码不能为空');
    }
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          VIN_number: VIN
        }
      },
      select: {
        $master: true
      },
      pageSize: 1,
      envType: "prod" // 使用正式环境
    });
    
    console.log('鸿日车VIN查询结果:', result);
    
    // 处理返回数据，适配不同的返回格式
    let records = [];
    if (result && result.data) {
      // 如果result.data是数组
      if (Array.isArray(result.data)) {
        records = result.data;
      }
      // 如果result.data是对象，可能包含records字段
      else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      }
      // 如果result.data是对象，可能包含list字段
      else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    if (!records || records.length === 0) {
      return {
        code: -1,
        message: '未找到该VIN码对应的鸿日车记录',
        data: null
      };
    }
    
    const item = records[0];
    const record = {
      VIN: item.VIN_number || item.vin_number || '',
      model_series: item.model_series || '',
      model_type: item.model_type || '',
      color: item.color || '',
      configuration: item.configuration || '',
      additional_configuration: item.additional_configuration || '',
      entry_date: item.entry_date || '',
      headquarter_shipment_date: item.headquarter_shipment_date || '',
      inventory_status: item.inventory_status || '在库',
      created_at: item.entry_date || '',
      stock_quantity: 1
    };
    
    return {
      code: 0,
      message: '鸿日车查询成功',
      data: record
    };
    
  } catch (error) {
    console.error('鸿日车VIN查询错误:', error);
    return {
      code: -1,
      message: `鸿日车查询失败: ${error.message}`,
      data: null
    };
  }
};

// ==================== 车辆价格查询相关函数 ====================

/**
 * 查询经销商价格数据 - 连接dealer_price表
 */
const queryVehiclePrices = async (data) => {
  try {
    const { model_series, model_type, configuration } = data;
    
    console.log('经销商价格查询参数:', data);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 构建查询条件
    const where = {};
    if (model_series) {
      where.model_series = model_series;
    }
    if (model_type) {
      where.model_type = model_type;
    }
    if (configuration) {
      where.configuration = configuration;
    }
    
    console.log('查询条件:', where);
    
    // 分页查询所有价格数据
    let allRecords = [];
    let currentPage = 1;
    const pageSize = 200;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`正在查询经销商价格第${currentPage}页，每页${pageSize}条`);
      
      // 查询dealer_price表
      const result = await cloud.models.dealer_price.list({
        filter: {
          where: where
        },
        select: {
          $master: true
        },
        pageSize: pageSize,
        pageNumber: currentPage,
        envType: "prod" // 使用正式环境
      });
      
      console.log(`经销商价格第${currentPage}页查询结果:`, result);
      
      // 处理返回数据，适配不同的返回格式
      let records = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          records = result.data;
        } else if (result.data.records && Array.isArray(result.data.records)) {
          records = result.data.records;
        } else if (result.data.list && Array.isArray(result.data.list)) {
          records = result.data.list;
        } else {
          console.warn(`经销商价格第${currentPage}页未知的数据格式:`, result.data);
          records = [];
        }
      }
      
      console.log(`经销商价格第${currentPage}页处理后的records:`, records.length, '条');
      
      // 将当前页数据添加到总结果中
      allRecords = allRecords.concat(records);
      
      // 判断是否还有更多数据
      if (records.length < pageSize) {
        hasMore = false;
      } else {
        currentPage++;
      }
      
      // 防止无限循环
      if (currentPage > 20) {
        console.warn('已达到最大查询页数限制，停止查询');
        hasMore = false;
      }
    }
    
    console.log('经销商价格所有数据查询完成，总共:', allRecords.length, '条');
    
    // 转换数据格式，使用正确的字段名称
    const formattedRecords = allRecords.map(item => ({
      id: item.id || '',
      model_series: item.model_series || '',
      model_type: item.model_type || '',
      configuration: item.configuration || '',
      color: item.color || '',
      Senior_Dealer_price: item.Senior_Dealer_price || 0,
      Junior_Dealer_price: item.Junior_Dealer_price || 0,
      current_Senior_Dealer_price: item.current_Senior_Dealer_price || 0,
      current_Junior_Dealer_price: item.current_Junior_Dealer_price || 0,
      Policy_Preference: item.Policy_Preference || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      // 兼容字段
      county_dealer_price: item.Senior_Dealer_price || 0,
      township_dealer_price: item.Junior_Dealer_price || 0,
      policy_discount: item.Policy_Preference || 0,
      created_at: item.created_at || '',
      updated_at: item.updated_at || ''
    }));
    
    return {
      code: 0,
      message: '经销商价格查询成功',
      data: formattedRecords,
      total: formattedRecords.length
    };
    
  } catch (error) {
    console.error('查询经销商价格错误:', error);
    return {
      code: -1,
      message: `经销商价格查询失败: ${error.message}`,
      data: []
    };
  }
};
  