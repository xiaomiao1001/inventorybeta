// 统一封装云函数调用，减少页面重复逻辑
const DEALER_FUNCTION = 'dealer-order'

async function callDealer(action, data = {}) {
  const res = await wx.cloud.callFunction({
    name: DEALER_FUNCTION,
    data: { action, data }
  })

  const result = res && res.result
  if (!result || result.code !== 0) {
    const message = (result && (result.message || result.msg)) || '云函数调用失败'
    throw new Error(`${action}: ${message}`)
  }
  return result
}

async function getSeriesList() {
  const result = await callDealer('getSeriesList', {})
  return {
    list: result.data || [],
    inventoryData: result.inventoryData || [],
    priceData: result.priceData || []
  }
}

async function getModelsList(series) {
  const result = await callDealer('getModelsList', { series })
  return result.data || []
}

async function getConfigsList(series, model) {
  const result = await callDealer('getConfigsList', { series, model })
  return result.data || []
}

async function getColorsList(series, model, config) {
  const result = await callDealer('getColorsList', { series, model, config })
  return result.data || []
}

async function getVehiclePrice(params) {
  const result = await callDealer('getVehiclePrice', params)
  return result.data || null
}

module.exports = {
  getSeriesList,
  getModelsList,
  getConfigsList,
  getColorsList,
  getVehiclePrice
}
