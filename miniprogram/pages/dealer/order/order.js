// 获取应用实例
const app = getApp()

Page({
  data: {
    // 经销商信息
    dealerInfo: '',
    dealerLevel: '',
    
    // 车辆选择
    selectedSeries: '',
    selectedModel: '',
    selectedConfig: '',
    selectedColor: '',
    selectedColorCode: '#ff0000',
    basePrice: 0,
    
    // 配置选项
    configOptions: [
      {
        id: 'lithium',
        name: '锂电池+锂电加装手工费',
        desc: '60V车型（小功率）',
        price: 4200,
        selected: false
      },
      {
        id: 'leadAcid',
        name: '铅酸电池折抵',
        desc: '',
        price: -3120,
        selected: false
      },
      {
        id: 'steering',
        name: '方向助力',
        desc: '',
        price: 680,
        selected: false
      },
      {
        id: 'extender',
        name: '增程器',
        desc: '',
        price: 1400,
        selected: false
      },
      {
        id: 'heater',
        name: '柴暖',
        desc: '',
        price: 400,
        selected: false
      },
      {
        id: 'aluminumWheels',
        name: '铝轮',
        desc: '',
        price: 720,
        selected: false
      },
      {
        id: 'cushion',
        name: '坐垫',
        desc: '',
        price: 100,
        selected: false
      },
      {
        id: 'floorMat',
        name: '脚垫',
        desc: '',
        price: 50,
        selected: false
      },
      {
        id: 'hubcap',
        name: '轮毂盖',
        desc: '',
        price: 50,
        selected: false
      }
    ],
    configTotalPrice: 0,
    
    // 其他费用
    otherFees: {
      insurance: 0,
      shipping: 0,
      markup: 0,
      discount: 0
    },
    otherFeesTotalPrice: 0,
    
    // 提车方式
    deliveryOptions: [
      { value: 'logistics', name: '物流发运', fee: 0 },
      { value: 'pickup', name: '自提', fee: 0 },
      { value: 'delivery', name: '送车', fee: 150 }
    ],
    deliveryMethod: 'logistics',
    deliveryFee: 0,
    
    // 总价
    totalAmount: 0,
    
    // 选择器相关
    showPicker: false,
    pickerTitle: '',
    pickerOptions: [],
    currentPickerType: '',
    currentPickerValue: '',
    
    // 数据源 - 从鸿日库存获取
    seriesList: [],
    modelsList: [],
    configsList: [],
    colorsList: [],
    
    // 鸿日库存原始数据
    hongriInventoryData: [],
    
    // 车辆价格数据
    vehiclePricesData: [],
    
    // 加载状态
    isLoadingInventory: false
  },

  onLoad(options) {
    this.initDealerInfo()
    this.loadInventoryAndPriceData()
    this.calculateTotalPrice()
  },

  // 初始化经销商信息
  initDealerInfo() {
    // 从全局状态或本地存储获取经销商信息
    const userInfo = wx.getStorageSync('userInfo') || {}
    const dealerLevel = userInfo.username === 'jxs-qx' ? '高级批发商' : '低级批发商'
    
    this.setData({
      dealerInfo: `${userInfo.username} (${dealerLevel})`,
      dealerLevel: dealerLevel
    })
    
    // 根据经销商等级设置费用
    this.setOtherFees(dealerLevel)
  },

  // 设置其他费用
  setOtherFees(dealerLevel) {
    const fees = dealerLevel === '高级批发商' ? {
      insurance: 80,
      shipping: 1150,
      markup: 400,
      discount: 0
    } : {
      insurance: 0,
      shipping: 0,
      markup: 0,
      discount: 0
    }
    
    const total = fees.insurance + fees.shipping + fees.markup - fees.discount
    
    this.setData({
      otherFees: fees,
      otherFeesTotalPrice: total
    })
  },

  // 加载库存和价格数据
  async loadInventoryAndPriceData() {
    try {
      this.setData({ isLoadingInventory: true })
      
      wx.showLoading({
        title: '加载数据中...'
      })
      
      // 使用新的经销商订单云函数获取车型系列数据
      const seriesResult = await wx.cloud.callFunction({
        name: 'dealer-order',
        data: {
          action: 'getSeriesList',
          data: {}
        }
      })
      
      console.log('车型系列查询结果:', seriesResult)
      
      // 处理车型系列数据
      if (seriesResult.result && seriesResult.result.code === 0 && seriesResult.result.data) {
        const seriesList = seriesResult.result.data
        console.log('获取到的车型系列列表:', seriesList)
        
        this.setData({
          seriesList: seriesList
        })
        
        wx.showToast({
          title: `加载成功，共${seriesList.length}个车型系列`,
          icon: 'success',
          duration: 2000
        })
      } else {
        console.log('车型系列数据加载失败:', seriesResult)
        wx.showToast({
          title: '暂无车型系列数据',
          icon: 'none',
          duration: 2000
        })
        this.initFallbackData()
      }
      
      wx.hideLoading()
      
    } catch (error) {
      wx.hideLoading()
      console.error('加载数据失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'error',
        duration: 2000
      })
      
      // 使用备用数据
      this.initFallbackData()
    } finally {
      this.setData({ isLoadingInventory: false })
    }
  },

  // 根据选择的系列提取车型列表
  extractModelsList(selectedSeries) {
    console.log('开始提取车型列表，选择的系列:', selectedSeries)
    
    const modelsSet = new Set()
    
    this.data.hongriInventoryData.forEach((item, index) => {
      if (item.model_series === selectedSeries && item.model_type) {
        modelsSet.add(item.model_type)
        if (index < 3) {
          console.log(`匹配的车型数据第${index + 1}条:`, {
            model_series: item.model_series,
            model_type: item.model_type
          })
        }
      }
    })
    
    const modelsList = Array.from(modelsSet).map(model => ({
      value: model,
      label: model
    }))
    
    console.log('提取到的车型列表:', modelsList)
    
    return modelsList
  },

  // 根据选择的车型提取配置列表
  extractConfigsList(selectedSeries, selectedModel) {
    console.log('开始提取配置列表，系列:', selectedSeries, '车型:', selectedModel)
    
    const configsSet = new Set()
    
    this.data.hongriInventoryData.forEach((item, index) => {
      if (item.model_series === selectedSeries && 
          item.model_type === selectedModel && 
          item.configuration) {
        configsSet.add(item.configuration)
        if (index < 3) {
          console.log(`匹配的配置数据第${index + 1}条:`, {
            model_series: item.model_series,
            model_type: item.model_type,
            configuration: item.configuration
          })
        }
      }
    })
    
    const configsList = Array.from(configsSet).map(config => ({
      value: config,
      label: config
    }))
    
    console.log('提取到的配置列表:', configsList)
    
    return configsList
  },

  // 根据选择的车型和配置提取颜色列表
  extractColorsList(selectedSeries, selectedModel, selectedConfig) {
    console.log('开始提取颜色列表，系列:', selectedSeries, '车型:', selectedModel, '配置:', selectedConfig)
    
    const colorsSet = new Set()
    
    this.data.hongriInventoryData.forEach((item, index) => {
      if (item.model_series === selectedSeries && 
          item.model_type === selectedModel && 
          item.configuration === selectedConfig &&
          item.color) {
        colorsSet.add(item.color)
        if (index < 3) {
          console.log(`匹配的颜色数据第${index + 1}条:`, {
            model_series: item.model_series,
            model_type: item.model_type,
            configuration: item.configuration,
            color: item.color
          })
        }
      }
    })
    
    const colorsList = Array.from(colorsSet).map(color => ({
      value: color,
      label: color,
      color: this.getColorCode(color)
    }))
    
    console.log('提取到的颜色列表:', colorsList)
    
    return colorsList
  },

  // 获取颜色代码
  getColorCode(colorName) {
    const colorMap = {
      '红色': '#ff0000',
      '蓝色': '#0066cc',
      '白色': '#ffffff',
      '黑色': '#000000',
      '银色': '#c0c0c0',
      '灰色': '#808080',
      '绿色': '#008000',
      '黄色': '#ffff00'
    }
    
    return colorMap[colorName] || '#666666'
  },

  // 备用数据初始化
  initFallbackData() {
    this.setData({
      seriesList: [
        { value: '鸿日S1', label: '鸿日S1' },
        { value: '鸿日S1Pro', label: '鸿日S1Pro' },
        { value: '鸿日S1Max', label: '鸿日S1Max' },
        { value: '御虎', label: '御虎' }
      ]
    })
  },

  // 显示车型系列选择器
  showSeriesPicker() {
    console.log('=== 显示车型系列选择器 ===')
    console.log('当前isLoadingInventory:', this.data.isLoadingInventory)
    console.log('当前seriesList:', this.data.seriesList)
    console.log('seriesList长度:', this.data.seriesList.length)
    
    if (this.data.isLoadingInventory) {
      console.log('数据正在加载中，无法显示选择器')
      wx.showToast({
        title: '数据加载中，请稍候',
        icon: 'none'
      })
      return
    }
    
    if (this.data.seriesList.length === 0) {
      console.log('seriesList为空，无法显示选择器')
      console.log('尝试重新从库存数据提取系列...')
      
      // 如果系列列表为空，但有库存数据，尝试重新提取
      if (this.data.hongriInventoryData.length > 0) {
        console.log('检测到库存数据，重新提取系列列表')
        this.extractSeriesList(this.data.hongriInventoryData)
        
        // 重新检查
        if (this.data.seriesList.length > 0) {
          console.log('重新提取成功，继续显示选择器')
        } else {
          wx.showToast({
            title: '无法提取车型系列数据',
            icon: 'none'
          })
          return
        }
      } else {
        wx.showToast({
          title: '暂无可选车型系列',
          icon: 'none'
        })
        return
      }
    }
    
    console.log('准备显示选择器，选项:', this.data.seriesList)
    
    this.setData({
      showPicker: true,
      pickerTitle: '选择车型系列',
      pickerOptions: this.data.seriesList,
      currentPickerType: 'series',
      currentPickerValue: this.data.selectedSeries
    })
    
    console.log('选择器已设置，showPicker:', this.data.showPicker)
  },

  // 显示车型选择器
  async showModelPicker() {
    if (!this.data.selectedSeries) {
      wx.showToast({
        title: '请先选择车型系列',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({
        title: '加载车型中...'
      })
      
      // 调用新的云函数获取车型列表
      const modelsResult = await wx.cloud.callFunction({
        name: 'dealer-order',
        data: {
          action: 'getModelsList',
          data: {
            series: this.data.selectedSeries
          }
        }
      })
      
      wx.hideLoading()
      
      console.log('车型查询结果:', modelsResult)
      
      if (modelsResult.result && modelsResult.result.code === 0 && modelsResult.result.data) {
        const models = modelsResult.result.data
        
        if (models.length === 0) {
          wx.showToast({
            title: '该系列暂无可选车型',
            icon: 'none'
          })
          return
        }
        
        this.setData({
          showPicker: true,
          pickerTitle: '选择车型',
          pickerOptions: models,
          currentPickerType: 'model',
          currentPickerValue: this.data.selectedModel
        })
      } else {
        wx.showToast({
          title: '获取车型列表失败',
          icon: 'error'
        })
      }
      
    } catch (error) {
      wx.hideLoading()
      console.error('获取车型列表失败:', error)
      wx.showToast({
        title: '获取车型列表失败',
        icon: 'error'
      })
    }
  },

  // 显示配置选择器
  async showConfigPicker() {
    if (!this.data.selectedSeries || !this.data.selectedModel) {
      wx.showToast({
        title: '请先选择车型系列和车型',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({
        title: '加载配置中...'
      })
      
      // 调用新的云函数获取配置列表
      const configsResult = await wx.cloud.callFunction({
        name: 'dealer-order',
        data: {
          action: 'getConfigsList',
          data: {
            series: this.data.selectedSeries,
            model: this.data.selectedModel
          }
        }
      })
      
      wx.hideLoading()
      
      console.log('配置查询结果:', configsResult)
      
      if (configsResult.result && configsResult.result.code === 0 && configsResult.result.data) {
        const configs = configsResult.result.data
        
        if (configs.length === 0) {
          wx.showToast({
            title: '该车型暂无可选配置',
            icon: 'none'
          })
          return
        }
        
        this.setData({
          showPicker: true,
          pickerTitle: '选择配置',
          pickerOptions: configs,
          currentPickerType: 'config',
          currentPickerValue: this.data.selectedConfig
        })
      } else {
        wx.showToast({
          title: '获取配置列表失败',
          icon: 'error'
        })
      }
      
    } catch (error) {
      wx.hideLoading()
      console.error('获取配置列表失败:', error)
      wx.showToast({
        title: '获取配置列表失败',
        icon: 'error'
      })
    }
  },

  // 显示颜色选择器
  async showColorPicker() {
    if (!this.data.selectedSeries || !this.data.selectedModel || !this.data.selectedConfig) {
      wx.showToast({
        title: '请先选择车型系列、车型和配置',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({
        title: '加载颜色中...'
      })
      
      // 调用新的云函数获取颜色列表
      const colorsResult = await wx.cloud.callFunction({
        name: 'dealer-order',
        data: {
          action: 'getColorsList',
          data: {
            series: this.data.selectedSeries,
            model: this.data.selectedModel,
            config: this.data.selectedConfig
          }
        }
      })
      
      wx.hideLoading()
      
      console.log('颜色查询结果:', colorsResult)
      
      if (colorsResult.result && colorsResult.result.code === 0 && colorsResult.result.data) {
        const colors = colorsResult.result.data
        
        if (colors.length === 0) {
          wx.showToast({
            title: '该配置暂无可选颜色',
            icon: 'none'
          })
          return
        }
        
        this.setData({
          showPicker: true,
          pickerTitle: '选择颜色',
          pickerOptions: colors,
          currentPickerType: 'color',
          currentPickerValue: this.data.selectedColor
        })
      } else {
        wx.showToast({
          title: '获取颜色列表失败',
          icon: 'error'
        })
      }
      
    } catch (error) {
      wx.hideLoading()
      console.error('获取颜色列表失败:', error)
      wx.showToast({
        title: '获取颜色列表失败',
        icon: 'error'
      })
    }
  },

  // 隐藏选择器
  hidePicker() {
    this.setData({
      showPicker: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 选择器选项点击
  selectPickerOption(e) {
    const { value, label, data } = e.currentTarget.dataset
    const { currentPickerType } = this.data
    
    switch (currentPickerType) {
      case 'series':
        this.setData({
          selectedSeries: label,
          selectedModel: '',
          selectedConfig: '',
          selectedColor: '',
          basePrice: 0
        })
        break
      case 'model':
        this.setData({
          selectedModel: label,
          selectedConfig: '',
          selectedColor: '',
          basePrice: this.getBasePriceByModel(label)
        })
        break
      case 'config':
        this.setData({
          selectedConfig: label
        })
        // 当配置选择完成后，尝试从价格表获取价格
        this.updatePriceFromTable()
        break
      case 'color':
        this.setData({
          selectedColor: label,
          selectedColorCode: data.color || '#ff0000'
        })
        // 当颜色选择完成后，再次尝试从价格表获取价格
        this.updatePriceFromTable()
        break
    }
    
    this.hidePicker()
    this.calculateTotalPrice()
  },

  // 从价格表更新价格
  async updatePriceFromTable() {
    const { selectedSeries, selectedModel, selectedConfig, selectedColor } = this.data
    
    // 只有当系列和车型都选择了才查询价格
    if (!selectedSeries || !selectedModel) {
      return
    }
    
    try {
      console.log('尝试从经销商价格表获取价格:', {
        series: selectedSeries,
        model: selectedModel,
        config: selectedConfig,
        color: selectedColor
      })
      
      // 调用新的云函数获取价格信息
      const priceResult = await wx.cloud.callFunction({
        name: 'dealer-order',
        data: {
          action: 'getVehiclePrice',
          data: {
            series: selectedSeries,
            model: selectedModel,
            config: selectedConfig,
            color: selectedColor
          }
        }
      })
      
      console.log('价格查询结果:', priceResult)
      
      if (priceResult.result && priceResult.result.code === 0 && priceResult.result.data) {
        const priceInfo = priceResult.result.data
        console.log('找到匹配的价格:', priceInfo)
        
        // 根据经销商等级选择对应价格
        const dealerPrice = this.data.dealerLevel === '高级批发商' 
          ? priceInfo.senior_dealer_price || priceInfo.current_senior_dealer_price
          : priceInfo.junior_dealer_price || priceInfo.current_junior_dealer_price
        
        if (dealerPrice && dealerPrice > 0) {
          this.setData({
            basePrice: dealerPrice
          })
          
          wx.showToast({
            title: '已更新实时价格',
            icon: 'success',
            duration: 1000
          })
          
          console.log('价格更新成功:', dealerPrice)
        } else {
          console.log('价格数据无效:', dealerPrice)
          wx.showToast({
            title: '暂无价格数据',
            icon: 'none',
            duration: 1000
          })
        }
      } else {
        console.log('未找到匹配的价格，使用默认价格')
        wx.showToast({
          title: '未找到价格配置',
          icon: 'none',
          duration: 1000
        })
      }
      
    } catch (error) {
      console.error('获取价格失败:', error)
      wx.showToast({
        title: '获取价格失败',
        icon: 'none',
        duration: 1000
      })
    }
  },

  // 切换配置选项
  toggleConfig(e) {
    const index = e.currentTarget.dataset.index
    const configOptions = [...this.data.configOptions]
    configOptions[index].selected = !configOptions[index].selected
    
    // 更新锂电池价格（根据车型功率）
    if (configOptions[index].id === 'lithium') {
      const is60V = this.isLowPowerModel(this.data.selectedModel)
      configOptions[index].price = is60V ? 4200 : 4600
      configOptions[index].desc = is60V ? '60V车型（小功率）' : '72V车型（其他）'
    }
    
    this.setData({
      configOptions
    })
    
    this.calculateConfigTotal()
    this.calculateTotalPrice()
  },

  // 选择提车方式
  selectDeliveryMethod(e) {
    const value = e.currentTarget.dataset.value
    const option = this.data.deliveryOptions.find(item => item.value === value)
    
    this.setData({
      deliveryMethod: value,
      deliveryFee: option.fee
    })
    
    this.calculateTotalPrice()
  },

  // 计算配置总价
  calculateConfigTotal() {
    const total = this.data.configOptions.reduce((sum, item) => {
      return sum + (item.selected ? item.price : 0)
    }, 0)
    
    this.setData({
      configTotalPrice: total
    })
  },

  // 计算总价
  calculateTotalPrice() {
    const { basePrice, configTotalPrice, otherFeesTotalPrice, deliveryFee } = this.data
    const total = basePrice + configTotalPrice + otherFeesTotalPrice + deliveryFee
    
    this.setData({
      totalAmount: total
    })
  },

  // 加入购物车
  addToCart() {
    if (!this.validateForm()) {
      return
    }
    
    const orderData = this.buildOrderData('pending')
    this.saveOrder(orderData)
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  },

  // 提交订单
  submitOrder() {
    if (!this.validateForm()) {
      return
    }
    
    const orderData = this.buildOrderData('submitted')
    this.saveOrder(orderData)
    
    wx.showToast({
      title: '订单提交成功',
      icon: 'success'
    })
    
    // 跳转到订单列表
    setTimeout(() => {
      this.switchToOrders()
    }, 1500)
  },

  // 表单验证
  validateForm() {
    if (!this.data.selectedSeries) {
      wx.showToast({ title: '请选择车型系列', icon: 'none' })
      return false
    }
    if (!this.data.selectedModel) {
      wx.showToast({ title: '请选择车型', icon: 'none' })
      return false
    }
    if (!this.data.selectedConfig) {
      wx.showToast({ title: '请选择配置', icon: 'none' })
      return false
    }
    if (!this.data.selectedColor) {
      wx.showToast({ title: '请选择颜色', icon: 'none' })
      return false
    }
    return true
  },

  // 构建订单数据
  buildOrderData(status) {
    const now = new Date()
    const orderNo = this.generateOrderNo()
    
    return {
      orderNo,
      dealer: this.data.dealerInfo,
      dealerLevel: this.data.dealerLevel,
      vehicleSeries: this.data.selectedSeries,
      vehicleModel: this.data.selectedModel,
      vehicleConfig: this.data.selectedConfig,
      vehicleColor: this.data.selectedColor,
      basePrice: this.data.basePrice,
      additionalConfigs: this.data.configOptions.filter(item => item.selected),
      configTotalPrice: this.data.configTotalPrice,
      otherFees: this.data.otherFees,
      otherFeesTotalPrice: this.data.otherFeesTotalPrice,
      deliveryMethod: this.data.deliveryMethod,
      deliveryFee: this.data.deliveryFee,
      totalAmount: this.data.totalAmount,
      status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  },

  // 生成订单号
  generateOrderNo() {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.getTime().toString().slice(-3)
    const prefix = this.data.selectedSeries.includes('鸿日') ? 'HR' : 'QT'
    return `${prefix}${dateStr}${timeStr}`
  },

  // 保存订单
  saveOrder(orderData) {
    try {
      const orders = wx.getStorageSync('dealerOrders') || []
      
      // 检查是否已存在相同订单号的订单
      const existingIndex = orders.findIndex(order => order.orderNo === orderData.orderNo)
      
      if (existingIndex >= 0) {
        orders[existingIndex] = orderData
      } else {
        orders.unshift(orderData)
      }
      
      wx.setStorageSync('dealerOrders', orders)
    } catch (error) {
      console.error('保存订单失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 切换到订单页面
  switchToOrders() {
    wx.navigateTo({
      url: '/pages/dealer/orders/orders'
    })
  },

  // 刷新库存数据
  refreshInventoryData() {
    console.log('手动刷新库存数据')
    this.loadInventoryAndPriceData()
  },

  // 测试数据连接 - 临时调试函数
  async testDataConnection() {
    try {
      wx.showLoading({ title: '测试数据连接...' })
      
      // 测试鸿日库存查询
      console.log('=== 开始测试鸿日库存数据连接 ===')
      const inventoryResult = await wx.cloud.callFunction({
        name: 'car-inventory',
        data: {
          action: 'queryHR',
          data: {} // 不添加任何筛选条件，获取所有数据
        }
      })
      
      console.log('鸿日库存测试结果:', inventoryResult)
      
      if (inventoryResult.result && inventoryResult.result.data) {
        const data = inventoryResult.result.data
        console.log('鸿日库存数据总数:', data.length)
        
        if (data.length > 0) {
          console.log('鸿日库存数据示例（前5条）:')
          data.slice(0, 5).forEach((item, index) => {
            console.log(`第${index + 1}条完整数据:`, item)
            console.log(`  - VIN: ${item.VIN}`)
            console.log(`  - model_series: ${item.model_series}`)
            console.log(`  - model_type: ${item.model_type}`)
            console.log(`  - configuration: ${item.configuration}`)
            console.log(`  - color: ${item.color}`)
            console.log(`  - inventory_status: ${item.inventory_status}`)
          })
          
          // 统计系列分布
          const seriesStats = {}
          data.forEach(item => {
            if (item.model_series) {
              seriesStats[item.model_series] = (seriesStats[item.model_series] || 0) + 1
            }
          })
          console.log('系列分布统计:', seriesStats)
          
          wx.showModal({
            title: '数据连接测试',
            content: `鸿日库存数据连接成功！\n\n总数据量: ${data.length}条\n系列分布: ${Object.keys(seriesStats).join(', ')}\n\n详细信息请查看控制台`,
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '数据连接测试',
            content: '鸿日库存数据库连接成功，但暂无数据。\n\n请先添加库存数据再进行测试。',
            showCancel: false
          })
        }
      } else {
        console.log('鸿日库存查询失败:', inventoryResult)
        wx.showModal({
          title: '数据连接测试',
          content: '鸿日库存数据连接失败，请检查云函数配置。',
          showCancel: false
        })
      }
      
      wx.hideLoading()
      
    } catch (error) {
      wx.hideLoading()
      console.error('测试数据连接失败:', error)
      wx.showModal({
        title: '数据连接测试',
        content: `数据连接测试失败：${error.message}`,
        showCancel: false
      })
    }
  },

  // 工具方法：根据车型获取基础价格
  getBasePriceByModel(model) {
    // 首先尝试从实时价格数据中查找
    const priceData = this.findPriceByModel(model)
    if (priceData) {
      // 根据经销商等级返回对应价格
      return this.data.dealerLevel === '高级批发商' 
        ? priceData.Senior_Dealer_price || priceData.county_dealer_price
        : priceData.Junior_Dealer_price || priceData.township_dealer_price
    }
    
    // 如果没有找到实时价格，使用固定价格映射作为备用
    const priceMap = {
      'S1-23款磷酸铁锂4kw心动版': this.data.dealerLevel === '高级批发商' ? 21900 : 25800,
      'S1Pro-24款铅酸4kw冠军版': this.data.dealerLevel === '高级批发商' ? 24900 : 28300,
      'S1Max-23款铅酸4kw豪华版': this.data.dealerLevel === '高级批发商' ? 27580 : 31500,
      '御虎新款-自动档': 35700
    }
    
    // 尝试精确匹配
    if (priceMap[model]) {
      return priceMap[model]
    }
    
    // 模糊匹配
    for (const key in priceMap) {
      if (model.includes(key.split('-')[0]) || key.includes(model)) {
        return priceMap[key]
      }
    }
    
    // 默认价格
    return this.data.dealerLevel === '高级批发商' ? 20000 : 24000
  },

  // 工具方法：从价格数据中查找匹配的车型价格
  findPriceByModel(model) {
    const pricesData = this.data.vehiclePricesData
    
    if (!pricesData || pricesData.length === 0) {
      return null
    }
    
    console.log('从价格数据中查找车型:', model)
    console.log('可用价格数据条数:', pricesData.length)
    
    // 精确匹配车型名称
    let matchedPrice = pricesData.find(price => 
      this.matchField(price.model_type, model)
    )
    if (matchedPrice) {
      console.log('车型精确匹配成功:', matchedPrice)
      return matchedPrice
    }
    
    // 模糊匹配：检查车型名称是否包含价格表中的型号
    matchedPrice = pricesData.find(price => {
      return this.matchField(price.model_type, model)
    })
    if (matchedPrice) {
      console.log('车型模糊匹配成功:', matchedPrice)
      return matchedPrice
    }
    
    // 通过系列匹配：提取车型系列进行匹配
    const selectedSeries = this.data.selectedSeries
    if (selectedSeries) {
      matchedPrice = pricesData.find(price => {
        return this.matchField(price.model_series, selectedSeries)
      })
      if (matchedPrice) {
        console.log('系列匹配成功:', matchedPrice)
        return matchedPrice
      }
    }
    
    console.log('未找到匹配的价格数据')
    return null
  },

  // 工具方法：判断是否为低功率车型
  isLowPowerModel(model) {
    const lowPowerModels = ['S1-23款磷酸铁锂4kw心动版']
    return lowPowerModels.some(lowModel => model.includes(lowModel) || lowModel.includes(model))
  },

  // 创建测试数据 - 临时调试函数
  async createTestData() {
    try {
      wx.showLoading({ title: '创建测试数据...' })
      
      // 测试数据
      const testData = [
        {
          VIN: 'TEST001',
          model_series: '鸿日S1',
          model_type: 'S1标准版',
          color: '红色',
          configuration: '标准配置',
          additional_configuration: '无',
          entry_date: '2025-01-20',
          headquarter_shipment_date: '2025-01-18'
        },
        {
          VIN: 'TEST002',
          model_series: '鸿日S1',
          model_type: 'S1豪华版',
          color: '蓝色',
          configuration: '豪华配置',
          additional_configuration: '真皮座椅',
          entry_date: '2025-01-20',
          headquarter_shipment_date: '2025-01-18'
        },
        {
          VIN: 'TEST003',
          model_series: '鸿日S1Pro',
          model_type: 'S1Pro运动版',
          color: '白色',
          configuration: '运动配置',
          additional_configuration: '运动套件',
          entry_date: '2025-01-21',
          headquarter_shipment_date: '2025-01-19'
        },
        {
          VIN: 'TEST004',
          model_series: '鸿日S1Max',
          model_type: 'S1Max旗舰版',
          color: '黑色',
          configuration: '旗舰配置',
          additional_configuration: '全景天窗',
          entry_date: '2025-01-21',
          headquarter_shipment_date: '2025-01-19'
        },
        {
          VIN: 'TEST005',
          model_series: '御虎',
          model_type: '御虎标准版',
          color: '银色',
          configuration: '标准配置',
          additional_configuration: '无',
          entry_date: '2025-01-22',
          headquarter_shipment_date: '2025-01-20'
        }
      ]
      
      console.log('准备添加测试数据:', testData)
      
      // 调用云函数批量添加数据
      const result = await wx.cloud.callFunction({
        name: 'car-inventory',
        data: {
          action: 'addManyHR',
          data: {
            items: testData
          }
        }
      })
      
      console.log('添加测试数据结果:', result)
      
      wx.hideLoading()
      
      if (result.result && result.result.code === 0) {
        wx.showModal({
          title: '测试数据创建成功',
          content: `成功添加 ${testData.length} 条测试数据！\n\n包含车型系列：\n- 鸿日S1\n- 鸿日S1Pro\n- 鸿日S1Max\n- 御虎\n\n现在可以测试级联选择功能了。`,
          showCancel: false,
          success: () => {
            // 重新加载数据
            this.loadInventoryAndPriceData()
          }
        })
      } else {
        wx.showModal({
          title: '测试数据创建失败',
          content: `创建失败：${result.result ? result.result.message : '未知错误'}`,
          showCancel: false
        })
      }
      
    } catch (error) {
      wx.hideLoading()
      console.error('创建测试数据失败:', error)
      wx.showModal({
        title: '测试数据创建失败',
        content: `创建失败：${error.message}`,
        showCancel: false
      })
    }
  },

  // 检查当前数据状态 - 临时调试函数
  checkCurrentDataStatus() {
    const currentData = {
      hongriInventoryData: this.data.hongriInventoryData,
      seriesList: this.data.seriesList,
      vehiclePricesData: this.data.vehiclePricesData,
      selectedSeries: this.data.selectedSeries,
      selectedModel: this.data.selectedModel,
      selectedConfig: this.data.selectedConfig,
      selectedColor: this.data.selectedColor
    }
    
    console.log('=== 当前页面数据状态检查 ===')
    console.log('鸿日库存数据条数:', currentData.hongriInventoryData.length)
    console.log('车型系列列表:', currentData.seriesList)
    console.log('价格数据条数:', currentData.vehiclePricesData.length)
    console.log('当前选择状态:', {
      series: currentData.selectedSeries,
      model: currentData.selectedModel,
      config: currentData.selectedConfig,
      color: currentData.selectedColor
    })
    
    // 如果有库存数据，重新提取系列列表
    if (currentData.hongriInventoryData.length > 0) {
      console.log('重新提取车型系列列表...')
      const newSeriesList = this.extractSeriesList(currentData.hongriInventoryData)
      console.log('重新提取的系列列表:', newSeriesList)
    }
    
    wx.showModal({
      title: '数据状态检查',
      content: `库存数据: ${currentData.hongriInventoryData.length}条\n系列列表: ${currentData.seriesList.length}个\n价格数据: ${currentData.vehiclePricesData.length}条\n\n详细信息请查看控制台`,
      showCancel: false
    })
  },

  // 测试经销商价格表连接 - 临时调试函数
  async testDealerPriceConnection() {
    try {
      wx.showLoading({ title: '测试经销商价格表连接...' })
      
      console.log('=== 开始测试经销商价格表数据连接 ===')
      const priceResult = await wx.cloud.callFunction({
        name: 'car-inventory',
        data: {
          action: 'queryVehiclePrices',
          data: {} // 不添加任何筛选条件，获取所有价格数据
        }
      })
      
      console.log('经销商价格表测试结果:', priceResult)
      
      if (priceResult.result && priceResult.result.data) {
        const data = priceResult.result.data
        console.log('经销商价格数据总数:', data.length)
        
        if (data.length > 0) {
          console.log('经销商价格数据示例（前5条）:')
          data.slice(0, 5).forEach((item, index) => {
            console.log(`第${index + 1}条完整数据:`, item)
            console.log(`  - model_series: ${item.model_series}`)
            console.log(`  - model_type: ${item.model_type}`)
            console.log(`  - configuration: ${item.configuration}`)
            console.log(`  - color: ${item.color}`)
            console.log(`  - Senior_Dealer_price: ${item.Senior_Dealer_price}`)
            console.log(`  - Junior_Dealer_price: ${item.Junior_Dealer_price}`)
          })
          
          // 统计系列分布
          const seriesStats = {}
          data.forEach(item => {
            if (item.model_series) {
              seriesStats[item.model_series] = (seriesStats[item.model_series] || 0) + 1
            }
          })
          console.log('价格表系列分布统计:', seriesStats)
          
          wx.showModal({
            title: '经销商价格表连接测试',
            content: `经销商价格表连接成功！\n\n总价格数据: ${data.length}条\n系列分布: ${Object.keys(seriesStats).join(', ')}\n\n详细信息请查看控制台`,
            showCancel: false,
            success: () => {
              // 更新价格数据到页面
              this.setData({
                vehiclePricesData: data
              })
            }
          })
        } else {
          wx.showModal({
            title: '经销商价格表连接测试',
            content: '经销商价格表连接成功，但暂无数据。\n\n请先添加价格数据再进行测试。',
            showCancel: false
          })
        }
      } else {
        console.log('经销商价格表查询失败:', priceResult)
        wx.showModal({
          title: '经销商价格表连接测试',
          content: '经销商价格表连接失败，请检查云函数配置和数据表名。',
          showCancel: false
        })
      }
      
      wx.hideLoading()
      
    } catch (error) {
      wx.hideLoading()
      console.error('测试经销商价格表连接失败:', error)
      wx.showModal({
        title: '经销商价格表连接测试',
        content: `连接测试失败：${error.message}`,
        showCancel: false
      })
    }
  },
}) 