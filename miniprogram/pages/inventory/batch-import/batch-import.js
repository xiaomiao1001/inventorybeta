// pages/inventory/batch-import/batch-import.js
Page({
  data: {
    batchImportData: '',
    parseResult: [],
    parseErrors: [],
    isLoading: false,
    loadingType: '', // 'parse' | 'import'
    textareaFocused: false,
    dataLineCount: 0,
    canParse: false,
    inventoryType: 'hongri', // 库存类型
    pageTitle: '鸿日车批量入库' // 页面标题
  },

  onLoad: function(options) {
    console.log('批量入库页面onLoad开始执行');
    console.log('Page对象创建成功');
    console.log('接收到的参数:', options);
    
    // 获取库存类型和页面标题
    const inventoryType = options.type || 'hongri';
    const pageTitle = options.title || '鸿日车批量入库';
    
    this.setData({
      inventoryType: inventoryType,
      pageTitle: pageTitle
    });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: pageTitle
    });
    
    console.log('批量入库页面加载完成，库存类型:', inventoryType);
  },

  onShow: function() {
    // 页面显示时的处理
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 显示帮助信息
  showHelp: function() {
    wx.showModal({
      title: '批量入库帮助',
      content: '1. 按照指定格式准备数据\n2. 复制数据到输入框\n3. 点击"解析数据"检查格式\n4. 确认无误后点击"导入"',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 数据输入事件
  onDataInput: function(e) {
    const value = e.detail.value;
    
    // 计算有效数据行数
    const lineCount = value.trim() ? value.split('\n').filter(line => line.trim()).length : 0;
    
    this.setData({
      batchImportData: value,
      dataLineCount: lineCount,
      canParse: value.trim().length > 0
    });
    
    // 清除之前的解析结果
    if (this.data.parseResult.length > 0 || this.data.parseErrors.length > 0) {
      this.setData({
        parseResult: [],
        parseErrors: []
      });
    }
  },

  // 文本框获得焦点
  onTextareaFocus: function() {
    this.setData({
      textareaFocused: true
    });
  },

  // 文本框失去焦点
  onTextareaBlur: function() {
    this.setData({
      textareaFocused: false
    });
  },

  // 清空数据
  clearData: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入的数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            batchImportData: '',
            parseResult: [],
            parseErrors: [],
            dataLineCount: 0,
            canParse: false
          });
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1000
          });
        }
      }
    });
  },

  // 从剪贴板粘贴
  pasteFromClipboard: function() {
    wx.getClipboardData({
      success: (res) => {
        const clipboardData = res.data;
        if (clipboardData && clipboardData.trim()) {
          // 计算有效数据行数
          const lineCount = clipboardData.split('\n').filter(line => line.trim()).length;
          
          this.setData({
            batchImportData: clipboardData,
            parseResult: [],
            parseErrors: [],
            dataLineCount: lineCount,
            canParse: true
          });
          wx.showToast({
            title: '粘贴成功',
            icon: 'success',
            duration: 1000
          });
        } else {
          wx.showToast({
            title: '剪贴板为空',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '粘贴失败',
          icon: 'none'
        });
      }
    });
  },

  // 解析数据
  parseData: function() {
    console.log('parseData方法被调用');
    console.log('当前数据:', this.data.batchImportData);
    
    const data = this.data.batchImportData.trim();
    
    if (!data) {
      console.log('数据为空，显示提示');
      wx.showToast({
        title: '请输入数据',
        icon: 'none'
      });
      return;
    }

    console.log('开始解析数据，数据长度:', data.length);
    this.setData({
      isLoading: true,
      loadingType: 'parse'
    });

    // 模拟解析延迟
    setTimeout(() => {
      try {
        // 解析数据
        const lines = data.split('\n').filter(line => line.trim());
        const parsedData = [];
        const errors = [];

        lines.forEach((line, index) => {
          const lineNumber = index + 1;
          // 使用正则表达式分割，支持Tab键和多个空格
          const columns = line.trim().split(/\s+/);
          
          console.log(`第${lineNumber}行数据:`, columns);
          console.log(`第${lineNumber}行列数:`, columns.length);
          
          if (columns.length < 7) {
            errors.push(`第${lineNumber}行：数据列数不足（需要7列，实际${columns.length}列）`);
            return;
          }

          const [vin, series, model, config, color, factoryDate, inDate] = columns;
          
          // 基本验证
          if (!vin || vin.length < 10) {
            errors.push(`第${lineNumber}行：VIN码格式不正确（${vin}）`);
            return;
          }

          // 验证日期格式
          if (!this.isValidDate(factoryDate)) {
            errors.push(`第${lineNumber}行：总部出库日期格式不正确（${factoryDate}）`);
            return;
          }

          if (!this.isValidDate(inDate)) {
            errors.push(`第${lineNumber}行：入库日期格式不正确（${inDate}）`);
            return;
          }

          parsedData.push({
            vin: vin,
            series: series,
            model: model,
            config: config,
            color: color,
            factoryDate: factoryDate,
            inDate: inDate,
            lineNumber: lineNumber
          });
        });

        this.setData({
          parseResult: parsedData,
          parseErrors: errors,
          isLoading: false,
          loadingType: ''
        });

        // 显示解析结果提示
        if (errors.length === 0 && parsedData.length > 0) {
          wx.showToast({
            title: `解析成功：${parsedData.length}条`,
            icon: 'success'
          });
        } else if (errors.length > 0) {
          wx.showToast({
            title: `发现${errors.length}个错误`,
            icon: 'none'
          });
        }

      } catch (error) {
        this.setData({
          isLoading: false,
          loadingType: '',
          parseErrors: ['数据解析失败，请检查数据格式']
        });
        wx.showToast({
          title: '解析失败',
          icon: 'none'
        });
        console.error('批量导入解析错误:', error);
      }
    }, 800);
  },

  // 导入数据
  importData: function() {
    console.log('importData方法被调用');
    console.log('解析结果数量:', this.data.parseResult.length);
    
    if (this.data.parseResult.length === 0) {
      wx.showToast({
        title: '没有可导入的数据',
        icon: 'none'
      });
      return;
    }

    const dataCount = this.data.parseResult.length;
    const inventoryTypeName = this.data.inventoryType === 'hongri' ? '鸿日车库存表' : '库存表';
    
    wx.showModal({
      title: '确认导入',
      content: `确定要将${dataCount}条鸿日车数据导入到${inventoryTypeName}吗？`,
      success: (res) => {
        if (res.confirm) {
          this.executeImport();
        }
      }
    });
  },

  // 执行导入
  executeImport: function() {
    this.setData({
      isLoading: true,
      loadingType: 'import'
    });

    const importData = this.data.parseResult;
    const inventoryType = this.data.inventoryType;
    
    console.log(`开始导入数据到${inventoryType}库存表:`, importData);
    
    // 调用云函数导入数据
    if (inventoryType === 'hongri') {
      // 鸿日车数据导入
      this.importHongriData(importData);
    } else {
      // 其他品牌数据导入
      this.importOtherData(importData);
    }
  },

  // 导入鸿日车数据
  importHongriData: function(importData) {
    // 转换数据格式以匹配云函数期望的格式
    const items = importData.map(item => ({
      VIN: item.vin,
      model_series: item.series,
      model_type: item.model,
      color: item.color,
      entry_date: this.formatDate(item.inDate),
      headquarter_shipment_date: this.formatDate(item.factoryDate),
      additional_configuration: item.config
    }));

    console.log('准备调用云函数，数据:', items);

    wx.cloud.callFunction({
      name: 'car-inventory',
      data: {
        action: 'addManyHR',
        data: { items: items }
      },
      success: (res) => {
        console.log('鸿日车批量导入云函数调用成功:', res);
        this.setData({
          isLoading: false,
          loadingType: ''
        });

        if (res.result.code === 0) {
          wx.showModal({
            title: '导入成功',
            content: `成功将${items.length}条鸿日车数据导入到数据库`,
            showCancel: false,
            confirmText: '返回',
            success: () => {
              wx.navigateBack();
            }
          });
        } else {
          wx.showModal({
            title: '导入失败',
            content: res.result.message || '导入过程中发生错误',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('鸿日车批量导入云函数调用失败:', err);
        this.setData({
          isLoading: false,
          loadingType: ''
        });
        
        wx.showModal({
          title: '导入失败',
          content: `云函数调用失败: ${err.errMsg}`,
          showCancel: false
        });
      }
    });
  },

  // 导入其他品牌数据
  importOtherData: function(importData) {
    // 转换数据格式以匹配云函数期望的格式
    const items = importData.map(item => ({
      VIN: item.vin,
      brand: item.series,
      model: item.model,
      color: item.color,
      production_date: this.formatDate(item.factoryDate)
    }));

    console.log('准备调用云函数，其他品牌数据:', items);

    wx.cloud.callFunction({
      name: 'car-inventory',
      data: {
        action: 'addMany',
        data: { items: items }
      },
      success: (res) => {
        console.log('其他品牌批量导入云函数调用成功:', res);
        this.setData({
          isLoading: false,
          loadingType: ''
        });

        if (res.result.code === 0) {
          wx.showModal({
            title: '导入成功',
            content: `成功将${items.length}条其他品牌数据导入到数据库`,
            showCancel: false,
            confirmText: '返回',
            success: () => {
              wx.navigateBack();
            }
          });
        } else {
          wx.showModal({
            title: '导入失败',
            content: res.result.message || '导入过程中发生错误',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('其他品牌批量导入云函数调用失败:', err);
        this.setData({
          isLoading: false,
          loadingType: ''
        });
        
        wx.showModal({
          title: '导入失败',
          content: `云函数调用失败: ${err.errMsg}`,
          showCancel: false
        });
      }
    });
  },

  // 格式化日期为YYYY-MM-DD格式
  formatDate: function(dateString) {
    // 支持格式：2024/08/10, 2024-08-10, 20240810
    const dateRegex = /^(\d{4})[\/\-]?(\d{1,2})[\/\-]?(\d{1,2})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
      return dateString; // 如果格式不匹配，返回原字符串
    }
    
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // 验证日期格式
  isValidDate: function(dateString) {
    // 支持格式：2024/08/10, 2024-08-10, 20240810
    const dateRegex = /^(\d{4})[\/\-]?(\d{1,2})[\/\-]?(\d{1,2})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
      return false;
    }
    
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    
    // 基本范围检查
    if (year < 2000 || year > 2030) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    return true;
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '批量入库 - 郭四车行库存管理系统',
      path: '/pages/inventory/batch-import/batch-import'
    };
  }
}); 