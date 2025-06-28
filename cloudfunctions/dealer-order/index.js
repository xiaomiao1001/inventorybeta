'use strict';

// 引入微达低代码客户端SDK
const { init } = require('./wxCloudClientSDK.umd.js');

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('经销商订单云函数开始执行:', event);
  
  const { action, data } = event;
  
  try {
    switch (action) {
      // 获取车型系列列表
      case 'getSeriesList':
        return await getSeriesList(data);
      
      // 根据系列获取车型列表
      case 'getModelsList':
        return await getModelsList(data);
      
      // 根据系列和车型获取配置列表
      case 'getConfigsList':
        return await getConfigsList(data);
      
      // 根据系列、车型、配置获取颜色列表
      case 'getColorsList':
        return await getColorsList(data);
      
      // 获取车辆价格信息
      case 'getVehiclePrice':
        return await getVehiclePrice(data);
      
      // 检查库存可用性
      case 'checkInventoryAvailability':
        return await checkInventoryAvailability(data);
      
      // 获取完整的车辆选项数据
      case 'getVehicleOptions':
        return await getVehicleOptions(data);
      
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('经销商订单云函数执行错误:', error);
    return {
      code: -1,
      message: error.message,
      data: null
    };
  }
};

/**
 * 获取车型系列列表
 */
const getSeriesList = async (data) => {
  try {
    console.log('开始获取车型系列列表');
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询鸿日库存数据，只获取车型系列字段
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          inventory_status: '在库' // 只查询在库的车辆
        }
      },
      select: {
        model_series: true
      },
      pageSize: 200,
      envType: "prod"
    });
    
    console.log('系列查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    // 提取唯一的车型系列
    const seriesSet = new Set();
    records.forEach(item => {
      if (item.model_series) {
        seriesSet.add(item.model_series);
      }
    });
    
    const seriesList = Array.from(seriesSet).map(series => ({
      value: series,
      label: series
    }));
    
    console.log('提取到的车型系列列表:', seriesList);
    
    return {
      code: 0,
      message: '获取车型系列成功',
      data: seriesList
    };
    
  } catch (error) {
    console.error('获取车型系列列表错误:', error);
    return {
      code: -1,
      message: `获取车型系列失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 根据系列获取车型列表
 */
const getModelsList = async (data) => {
  try {
    const { series } = data;
    
    if (!series) {
      throw new Error('缺少车型系列参数');
    }
    
    console.log('开始获取车型列表，系列:', series);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询指定系列的车型数据
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          model_series: series,
          inventory_status: '在库'
        }
      },
      select: {
        model_type: true
      },
      pageSize: 200,
      envType: "prod"
    });
    
    console.log('车型查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    // 提取唯一的车型
    const modelsSet = new Set();
    records.forEach(item => {
      if (item.model_type) {
        modelsSet.add(item.model_type);
      }
    });
    
    const modelsList = Array.from(modelsSet).map(model => ({
      value: model,
      label: model
    }));
    
    console.log('提取到的车型列表:', modelsList);
    
    return {
      code: 0,
      message: '获取车型列表成功',
      data: modelsList
    };
    
  } catch (error) {
    console.error('获取车型列表错误:', error);
    return {
      code: -1,
      message: `获取车型列表失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 根据系列和车型获取配置列表
 */
const getConfigsList = async (data) => {
  try {
    const { series, model } = data;
    
    if (!series || !model) {
      throw new Error('缺少车型系列或车型参数');
    }
    
    console.log('开始获取配置列表，系列:', series, '车型:', model);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询指定系列和车型的配置数据
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          model_series: series,
          model_type: model,
          inventory_status: '在库'
        }
      },
      select: {
        configuration: true
      },
      pageSize: 200,
      envType: "prod"
    });
    
    console.log('配置查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    // 提取唯一的配置
    const configsSet = new Set();
    records.forEach(item => {
      if (item.configuration) {
        configsSet.add(item.configuration);
      }
    });
    
    const configsList = Array.from(configsSet).map(config => ({
      value: config,
      label: config
    }));
    
    console.log('提取到的配置列表:', configsList);
    
    return {
      code: 0,
      message: '获取配置列表成功',
      data: configsList
    };
    
  } catch (error) {
    console.error('获取配置列表错误:', error);
    return {
      code: -1,
      message: `获取配置列表失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 根据系列、车型、配置获取颜色列表
 */
const getColorsList = async (data) => {
  try {
    const { series, model, config } = data;
    
    if (!series || !model || !config) {
      throw new Error('缺少车型系列、车型或配置参数');
    }
    
    console.log('开始获取颜色列表，系列:', series, '车型:', model, '配置:', config);
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询指定条件的颜色数据
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          model_series: series,
          model_type: model,
          configuration: config,
          inventory_status: '在库'
        }
      },
      select: {
        color: true
      },
      pageSize: 200,
      envType: "prod"
    });
    
    console.log('颜色查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    // 提取唯一的颜色
    const colorsSet = new Set();
    records.forEach(item => {
      if (item.color) {
        colorsSet.add(item.color);
      }
    });
    
    // 颜色映射
    const colorMap = {
      '红色': '#ff0000',
      '蓝色': '#0066cc',
      '白色': '#ffffff',
      '黑色': '#000000',
      '银色': '#c0c0c0',
      '灰色': '#808080',
      '绿色': '#008000',
      '黄色': '#ffff00'
    };
    
    const colorsList = Array.from(colorsSet).map(color => ({
      value: color,
      label: color,
      color: colorMap[color] || '#666666'
    }));
    
    console.log('提取到的颜色列表:', colorsList);
    
    return {
      code: 0,
      message: '获取颜色列表成功',
      data: colorsList
    };
    
  } catch (error) {
    console.error('获取颜色列表错误:', error);
    return {
      code: -1,
      message: `获取颜色列表失败: ${error.message}`,
      data: []
    };
  }
};

/**
 * 获取车辆价格信息
 */
const getVehiclePrice = async (data) => {
  try {
    const { series, model, config, color } = data;
    
    if (!series || !model) {
      throw new Error('缺少车型系列或车型参数');
    }
    
    console.log('开始获取车辆价格，参数:', { series, model, config, color });
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 构建查询条件
    const where = {
      model_series: series,
      model_type: model
    };
    
    if (config) {
      where.configuration = config;
    }
    
    if (color) {
      where.color = color;
    }
    
    // 查询价格表
    const result = await cloud.models.dealer_price.list({
      filter: {
        where: where
      },
      select: {
        $master: true
      },
      pageSize: 10,
      envType: "prod"
    });
    
    console.log('价格查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    if (records.length === 0) {
      return {
        code: -1,
        message: '未找到对应的价格配置',
        data: null
      };
    }
    
    // 返回第一个匹配的价格记录
    const priceRecord = records[0];
    const priceInfo = {
      id: priceRecord.id || '',
      model_series: priceRecord.model_series || '',
      model_type: priceRecord.model_type || '',
      configuration: priceRecord.configuration || '',
      color: priceRecord.color || '',
      senior_dealer_price: priceRecord.Senior_Dealer_price || 0,
      junior_dealer_price: priceRecord.Junior_Dealer_price || 0,
      current_senior_dealer_price: priceRecord.current_Senior_Dealer_price || 0,
      current_junior_dealer_price: priceRecord.current_Junior_Dealer_price || 0,
      policy_preference: priceRecord.Policy_Preference || 0,
      is_active: priceRecord.is_active !== undefined ? priceRecord.is_active : true
    };
    
    console.log('返回的价格信息:', priceInfo);
    
    return {
      code: 0,
      message: '获取价格信息成功',
      data: priceInfo
    };
    
  } catch (error) {
    console.error('获取车辆价格错误:', error);
    return {
      code: -1,
      message: `获取车辆价格失败: ${error.message}`,
      data: null
    };
  }
};

/**
 * 检查库存可用性
 */
const checkInventoryAvailability = async (data) => {
  try {
    const { series, model, config, color } = data;
    
    if (!series || !model || !config || !color) {
      throw new Error('缺少必要的车辆信息参数');
    }
    
    console.log('开始检查库存可用性，参数:', { series, model, config, color });
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询库存
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          model_series: series,
          model_type: model,
          configuration: config,
          color: color,
          inventory_status: '在库'
        }
      },
      select: {
        VIN_number: true,
        entry_date: true
      },
      pageSize: 50,
      envType: "prod"
    });
    
    console.log('库存查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    const availableCount = records.length;
    const availableVins = records.map(item => item.VIN_number).filter(vin => vin);
    
    return {
      code: 0,
      message: '库存检查完成',
      data: {
        available: availableCount > 0,
        count: availableCount,
        vins: availableVins.slice(0, 10) // 最多返回10个VIN码
      }
    };
    
  } catch (error) {
    console.error('检查库存可用性错误:', error);
    return {
      code: -1,
      message: `检查库存可用性失败: ${error.message}`,
      data: {
        available: false,
        count: 0,
        vins: []
      }
    };
  }
};

/**
 * 获取完整的车辆选项数据（一次性获取所有级联数据）
 */
const getVehicleOptions = async (data) => {
  try {
    console.log('开始获取完整的车辆选项数据');
    
    // 使用腾讯云开发SDK
    const tcb = require('@cloudbase/node-sdk');
    const app = tcb.init({
      env: "cloud1-2gv7aqlv39d20b5c"
    });
    
    // 初始化微达SDK
    const cloud = init(app);
    
    // 查询所有在库的车辆数据
    const result = await cloud.models.inventory_model.list({
      filter: {
        where: {
          inventory_status: '在库'
        }
      },
      select: {
        model_series: true,
        model_type: true,
        configuration: true,
        color: true
      },
      pageSize: 200,
      envType: "prod"
    });
    
    console.log('完整选项查询结果:', result);
    
    // 处理返回数据
    let records = [];
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data.records && Array.isArray(result.data.records)) {
        records = result.data.records;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        records = result.data.list;
      }
    }
    
    // 构建级联数据结构
    const vehicleOptions = {};
    
    records.forEach(item => {
      if (!item.model_series) return;
      
      // 初始化系列
      if (!vehicleOptions[item.model_series]) {
        vehicleOptions[item.model_series] = {};
      }
      
      if (!item.model_type) return;
      
      // 初始化车型
      if (!vehicleOptions[item.model_series][item.model_type]) {
        vehicleOptions[item.model_series][item.model_type] = {};
      }
      
      if (!item.configuration) return;
      
      // 初始化配置
      if (!vehicleOptions[item.model_series][item.model_type][item.configuration]) {
        vehicleOptions[item.model_series][item.model_type][item.configuration] = new Set();
      }
      
      if (item.color) {
        vehicleOptions[item.model_series][item.model_type][item.configuration].add(item.color);
      }
    });
    
    // 转换为数组格式
    const formattedOptions = {};
    Object.keys(vehicleOptions).forEach(series => {
      formattedOptions[series] = {};
      Object.keys(vehicleOptions[series]).forEach(model => {
        formattedOptions[series][model] = {};
        Object.keys(vehicleOptions[series][model]).forEach(config => {
          formattedOptions[series][model][config] = Array.from(vehicleOptions[series][model][config]);
        });
      });
    });
    
    console.log('格式化后的车辆选项:', formattedOptions);
    
    return {
      code: 0,
      message: '获取车辆选项成功',
      data: formattedOptions
    };
    
  } catch (error) {
    console.error('获取车辆选项错误:', error);
    return {
      code: -1,
      message: `获取车辆选项失败: ${error.message}`,
      data: {}
    };
  }
}; 