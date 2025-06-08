interface IVehicle {
  id: string;
  vin: string;
  series: string;
  model: string;
  config: string;
  color: string;
  status: string;
  type: string;
}

interface ICustomerInfo {
  idCardImage: string;
  name: string;
  phone: string;
  address: string;
}

interface IPaymentInfo {
  method: string;
  amount: string;
}

interface ISaleInfo {
  salesperson: string;
  hasCredit: boolean;
  creditAmount: string;
  creditDueDate: string;
  hasTradeIn: boolean;
  tradeInAmount: string;
  tradeInBrand: string;
  tradeInColor: string;
}

interface IRetailData {
  currentStep: number;
  selectedInventoryType: string;
  vehicleSearchValue: string;
  availableVehicles: IVehicle[];
  selectedVehicle: IVehicle | null;
  customerInfo: ICustomerInfo;
  paymentInfo: IPaymentInfo;
  saleInfo: ISaleInfo;
  canNextStep: boolean;
  submitting: boolean;
}

Page({
  data: {
    currentStep: 1,
    selectedInventoryType: 'hongri',
    vehicleSearchValue: '',
    // 标注：以下是模拟数据，后续需要连接真实的数据库API
    availableVehicles: [
      {
        id: '1',
        vin: '123456',
        series: '鸿日A系列',
        model: 'A1',
        config: '标准版',
        color: '白色',
        status: '在库',
        type: 'hongri'
      },
      {
        id: '2',
        vin: '234567',
        series: '鸿日B系列', 
        model: 'B2',
        config: '豪华版',
        color: '黑色',
        status: '在库',
        type: 'hongri'
      }
    ],
    selectedVehicle: null,
    customerInfo: {
      idCardImage: '',
      name: '',
      phone: '',
      address: ''
    },
    paymentInfo: {
      method: '',
      amount: ''
    },
    saleInfo: {
      salesperson: '',
      hasCredit: false,
      creditAmount: '',
      creditDueDate: '',
      hasTradeIn: false,
      tradeInAmount: '',
      tradeInBrand: '',
      tradeInColor: ''
    },
    canNextStep: false,
    submitting: false
  } as IRetailData,

  onLoad() {
    this.loadAvailableVehicles();
    this.checkNextStepAvailable();
  },

  loadAvailableVehicles() {
    // 标注：这里应该调用API根据库存类型获取可用车辆
    console.log('Loading available vehicles...');
    this.checkNextStepAvailable();
  },

  onInventoryTypeChange(e: any) {
    const value = e.detail.value;
    this.setData({ 
      selectedInventoryType: value,
      selectedVehicle: null 
    });
    // 根据类型重新加载车辆列表
    this.loadAvailableVehicles();
  },

  onVehicleSearchChange(e: any) {
    this.setData({ vehicleSearchValue: e.detail.value });
    // 实现搜索过滤
  },

  selectVehicle(e: any) {
    const vehicle = e.currentTarget.dataset.vehicle;
    this.setData({ selectedVehicle: vehicle });
    this.checkNextStepAvailable();
  },

  uploadIdCard() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'customerInfo.idCardImage': tempFilePath
        });
        
        // 标注：这里应该调用OCR API识别身份证信息
        this.mockOCRRecognition(tempFilePath);
      }
    });
  },

  mockOCRRecognition(imagePath: string) {
    // 标注：模拟OCR识别，实际应该调用火山引擎API
    setTimeout(() => {
      this.setData({
        'customerInfo.name': '张三',
        'customerInfo.address': '内蒙古巴彦淖尔市临河区某某街道'
      });
      wx.showToast({
        title: 'OCR识别完成',
        icon: 'success'
      });
    }, 1000);
  },

  previewIdCard() {
    wx.previewImage({
      urls: [this.data.customerInfo.idCardImage]
    });
  },

  onCustomerInfoChange(e: any) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`customerInfo.${field}`]: value
    });
    this.checkNextStepAvailable();
  },

  selectPaymentMethod(e: any) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      'paymentInfo.method': method
    });
    this.checkNextStepAvailable();
  },

  onPaymentInfoChange(e: any) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`paymentInfo.${field}`]: value
    });
  },

  onSaleInfoChange(e: any) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`saleInfo.${field}`]: value
    });
  },

  toggleCredit(e: any) {
    const checked = e.detail.value;
    this.setData({
      'saleInfo.hasCredit': checked
    });
  },

  toggleTradeIn(e: any) {
    const checked = e.detail.value;
    this.setData({
      'saleInfo.hasTradeIn': checked
    });
  },

  selectCreditDate() {
    wx.showModal({
      title: '选择还款日期',
      content: '这里应该弹出日期选择器',
      showCancel: false
    });
  },

  checkNextStepAvailable() {
    const { currentStep, selectedVehicle, customerInfo, paymentInfo } = this.data;
    let canNext = false;

    switch (currentStep) {
      case 1:
        canNext = !!selectedVehicle;
        break;
      case 2:
        canNext = !!(customerInfo.name && customerInfo.phone);
        break;
      case 3:
        canNext = !!paymentInfo.method;
        break;
    }

    this.setData({ canNextStep: canNext });
  },

  nextStep() {
    if (!this.data.canNextStep) return;
    
    const nextStep = this.data.currentStep + 1;
    this.setData({ currentStep: nextStep });
    this.checkNextStepAvailable();
  },

  prevStep() {
    const prevStep = this.data.currentStep - 1;
    if (prevStep >= 1) {
      this.setData({ currentStep: prevStep });
      this.checkNextStepAvailable();
    }
  },

  async submitSale() {
    this.setData({ submitting: true });

    try {
      // 标注：这里应该调用API提交出库信息
      const saleData = {
        vehicle: this.data.selectedVehicle,
        customer: this.data.customerInfo,
        payment: this.data.paymentInfo,
        saleInfo: this.data.saleInfo,
        saleDate: new Date().toISOString()
      };

      console.log('Submitting sale data:', saleData);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      wx.showToast({
        title: '出库成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
}); 