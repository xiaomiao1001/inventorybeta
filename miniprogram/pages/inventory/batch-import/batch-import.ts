Page({
  data: {
    pageTitle: '鸿日车批量入库',
    formatDescription: '请按照以下格式粘贴鸿日车数据，各列之间使用Tab键或多个空格分隔',
    exampleHeader: 'VIN号 车型系列 车型 配置 颜色 总部出库日期 入库日期',
    exampleContent: '示例：LHR71B2AS04R00416 鸿日S1 23款铂酸5kw心动版 增程器 薄雾蓝 2025/06/10 2025/06/13',
    placeholderText: '在此粘贴您的数据，支持多行，各字段用Tab键或空格分隔',
    batchImportData: '',
    dataLineCount: 0,
    parseResult: [] as any[],
    parseErrors: [] as string[],
    canParse: false,
    isLoading: false,
    loadingType: ''
  },

  onLoad(options: { type?: string; title?: string }) {
    console.log('Batch import page loaded with options:', options);
    
    // 设置页面标题
    if (options?.title) {
      this.setData({
        pageTitle: options.title
      });
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: options.title
      });
    }

    // 根据类型设置不同的数据格式说明
    const type = options?.type || 'hongri';
    console.log('Inventory type:', type);
    
    if (type === 'other') {
      // 其他品牌库存的数据格式说明
      this.setData({
        formatDescription: '请按照以下格式粘贴其他品牌车数据，各列之间使用Tab键或多个空格分隔',
        exampleHeader: '车架号 车型系列 车型 配置 颜色 出厂日期',
        exampleContent: '示例：LHGXX1234567890123 宝马3系 320i 豪华版 珍珠白 2025/06/10',
        placeholderText: '在此粘贴您的其他品牌车数据，支持多行，各字段用Tab键或空格分隔'
      });
    } else {
      // 鸿日车的默认placeholder已在data中设置
      this.setData({
        placeholderText: '在此粘贴您的鸿日车数据，支持多行，各字段用Tab键或空格分隔'
      });
    }
  },

  // 数据输入处理
  onDataInput(e: any) {
    const value = e.detail.value;
    const lineCount = value.trim() ? value.trim().split('\n').length : 0;
    
    this.setData({
      batchImportData: value,
      dataLineCount: lineCount,
      canParse: lineCount > 0
    });
  },

  // 文本框获取焦点
  onTextareaFocus() {
    console.log('Textarea focused');
  },

  // 文本框失去焦点
  onTextareaBlur() {
    console.log('Textarea blurred');
  },

  // 清空数据
  clearData() {
    this.setData({
      batchImportData: '',
      dataLineCount: 0,
      parseResult: [],
      parseErrors: [],
      canParse: false
    });
  },

  // 从剪贴板粘贴
  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({
          batchImportData: res.data
        });
        this.onDataInput({ detail: { value: res.data } });
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
  parseData() {
    this.setData({
      isLoading: true,
      loadingType: 'parse'
    });

    setTimeout(() => {
      // 模拟解析过程
      const lines = this.data.batchImportData.trim().split('\n');
      const result: any[] = [];
      const errors: string[] = [];

      // 获取当前页面的类型参数
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = (currentPage as any).options || {};
      const type = options.type || 'hongri';

      lines.forEach((line, index) => {
        const parts = line.trim().split(/\s+/);
        
        if (type === 'other') {
          // 其他品牌：车架号、车型系列、车型、配置、颜色、出厂日期 (6个字段)
          if (parts.length >= 6) {
            result.push({
              vin: parts[0],
              series: parts[1],
              model: parts[2],
              config: parts[3],
              color: parts[4],
              factoryDate: parts[5]
            });
          } else {
            errors.push(`第${index + 1}行数据格式不正确，应包含6个字段：车架号、车型系列、车型、配置、颜色、出厂日期`);
          }
        } else {
          // 鸿日车：VIN号、车型系列、车型、配置、颜色、总部出库日期、入库日期 (7个字段)
          if (parts.length >= 7) {
            result.push({
              vin: parts[0],
              series: parts[1],
              model: parts[2],
              config: parts[3],
              color: parts[4],
              outDate: parts[5],
              inDate: parts[6]
            });
          } else {
            errors.push(`第${index + 1}行数据格式不正确，应包含7个字段：VIN号、车型系列、车型、配置、颜色、总部出库日期、入库日期`);
          }
        }
      });

      this.setData({
        parseResult: result,
        parseErrors: errors,
        isLoading: false,
        loadingType: ''
      });
    }, 1000);
  },

  // 导入数据
  async importData() {
    if (this.data.parseResult.length === 0) {
      wx.showToast({
        title: '没有可导入的数据',
        icon: 'none'
      });
      return;
    }

    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    const type = options.type || 'hongri';

    this.setData({
      isLoading: true,
      loadingType: 'import'
    });

    try {
      let result: any;
      
      if (type === 'other') {
        // 其他品牌车批量导入
        const items = this.data.parseResult.map(item => ({
          VIN: item.vin,
          brand: item.series,
          model: item.model,
          color: item.color,
          production_date: this.formatDate(item.factoryDate)
        }));

        result = await wx.cloud.callFunction({
          name: 'car-inventory',
          data: {
            action: 'addMany',
            data: { items }
          }
        });
      } else {
        // 鸿日车批量导入
        const items = this.data.parseResult.map(item => ({
          VIN: item.vin,
          model_series: item.series,
          model_type: item.model,
          color: item.color,
          configuration: item.config,
          additional_configuration: '',
          entry_date: this.formatDate(item.inDate),
          headquarter_shipment_date: this.formatDate(item.outDate)
        }));

        result = await wx.cloud.callFunction({
          name: 'car-inventory',
          data: {
            action: 'addManyHR',
            data: { items }
          }
        });
      }

      this.setData({
        isLoading: false,
        loadingType: ''
      });

      console.log('批量导入结果:', result);
      
      const res = result.result as any;
      if (res && res.code === 0) {
        // 导入成功
        wx.showModal({
          title: '导入成功',
          content: `${res.message}`,
          showCancel: false,
          success: () => {
            // 返回上一页并刷新数据
            wx.navigateBack({
              success: () => {
                // 触发上一页的数据刷新
                const pages = getCurrentPages();
                if (pages.length > 0) {
                  const prevPage = pages[pages.length - 1];
                  if (prevPage.loadInventoryData) {
                    prevPage.loadInventoryData();
                  }
                }
              }
            });
          }
        });
      } else {
        // 导入失败
        wx.showModal({
          title: '导入失败',
          content: res?.message || '批量导入失败，请检查数据格式',
          showCancel: false
        });
      }

    } catch (error) {
      this.setData({
        isLoading: false,
        loadingType: ''
      });

      console.error('批量导入失败:', error);
      wx.showModal({
        title: '导入失败',
        content: `批量导入过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
        showCancel: false
      });
    }
  },

  // 格式化日期
  formatDate(dateStr: string): string {
    const cleanDate = dateStr.replace(/[\/\-]/g, '');
    
    if (cleanDate.length === 8) {
      return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`;
    } else if (dateStr.includes('/')) {
      return dateStr.replace(/\//g, '-');
    } else if (dateStr.includes('-')) {
      return dateStr;
    }
    
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
});