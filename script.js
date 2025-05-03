// 获取所有输入和输出元素
const factoryPrice = document.getElementById('factory_price');
const tax = document.getElementById('tax');
const priceWithoutTax = document.getElementById('price_without_tax');
const exchangeRateCost = document.getElementById('exchange_rate_cost');
const usdPrice = document.getElementById('usd_price');
const containerQuantity = document.getElementById('container_quantity');
const freightRmbTotal = document.getElementById('freight_rmb_total');
const freightRmbPerItem = document.getElementById('freight_rmb_per_item');
const freightRmbPerItemRight = document.getElementById('freight_rmb_per_item_right');
const freightUsdPerItem = document.getElementById('freight_usd_per_item');
const fobUsd = document.getElementById('fob_usd');
const sellingPriceUsd = document.getElementById('selling_price_usd');
const settlementExchangeRate = document.getElementById('settlement_exchange_rate');
const sellingPriceRmb = document.getElementById('selling_price_rmb');
const taxRefundRate = document.getElementById('tax_refund_rate');
const taxRefund = document.getElementById('tax_refund');
const priceDifference = document.getElementById('price_difference');
const totalPriceDifference = document.getElementById('total_price_difference');
const minPriceDifference = document.getElementById('min_price_difference');
const reverseSellingPriceUsd = document.getElementById('reverse_selling_price_usd');
const requiredUsd = document.getElementById('required_usd');
const reverseFactoryPrice = document.getElementById('reverse_factory_price');

// 获取按钮元素
const calculateBtn = document.getElementById('calculate-btn');
const resetBtn = document.getElementById('reset-btn');

// 添加输入字段的事件监听器，实现自动计算
const inputFields = [
    factoryPrice, exchangeRateCost, containerQuantity, freightRmbTotal,
    sellingPriceUsd, settlementExchangeRate, taxRefundRate,
    minPriceDifference, requiredUsd
];

inputFields.forEach(field => {
    field.addEventListener('input', calculateAll);
});

// 添加按钮事件监听器
calculateBtn.addEventListener('click', calculateAll);
resetBtn.addEventListener('click', resetAll);

// 从输入框获取浮点数值的函数
function getFloatValue(element) {
    try {
        const value = element.value.trim();
        // 移除非数字字符（保留小数点）
        const cleanValue = value.replace(/[^\d.]+/g, '');
        if (cleanValue) {
            return parseFloat(cleanValue);
        }
        return 0;
    } catch (error) {
        return 0;
    }
}

// 设置输出字段的值的函数
function setOutputValue(element, value) {
    if (typeof value === 'number') {
        element.value = value.toFixed(2);
    } else {
        element.value = value;
    }
}

// 计算所有输出值的函数
function calculateAll() {
    // 获取输入值
    const factoryPriceValue = getFloatValue(factoryPrice);
    const exchangeRateCostValue = getFloatValue(exchangeRateCost) || 1; // 防止除以零
    const containerQuantityValue = getFloatValue(containerQuantity) || 1; // 防止除以零
    const freightRmbTotalValue = getFloatValue(freightRmbTotal);
    const sellingPriceUsdValue = getFloatValue(sellingPriceUsd);
    const settlementExchangeRateValue = getFloatValue(settlementExchangeRate) || 1; // 防止除以零
    const taxRefundRateValue = getFloatValue(taxRefundRate);
    const minPriceDifferenceValue = getFloatValue(minPriceDifference);
    const requiredUsdValue = getFloatValue(requiredUsd);
    
    // 计算左列输出值
    // 税 = 含税出厂价 / 1.13 * 0.13
    const taxValue = factoryPriceValue / 1.13 * 0.13;
    setOutputValue(tax, taxValue);
    
    // 不含税价 = 含税出厂价 / 1.13
    const priceWithoutTaxValue = factoryPriceValue / 1.13;
    setOutputValue(priceWithoutTax, priceWithoutTaxValue);
    
    // USD价 = 不含税价 / 汇率成本
    const usdPriceValue = priceWithoutTaxValue / exchangeRateCostValue;
    setOutputValue(usdPrice, usdPriceValue);
    
    // 运费RMB(个) = 运费RMB(总) / 装柜数量
    const freightRmbPerItemValue = freightRmbTotalValue / containerQuantityValue;
    setOutputValue(freightRmbPerItem, freightRmbPerItemValue);
    setOutputValue(freightRmbPerItemRight, freightRmbPerItemValue);
    
    // 运费USD(个) = 运费RMB(个) / 汇率成本
    const freightUsdPerItemValue = freightRmbPerItemValue / exchangeRateCostValue;
    setOutputValue(freightUsdPerItem, freightUsdPerItemValue);
    
    // FOB USD = USD价 + 运费USD(个)
    const fobUsdValue = usdPriceValue + freightUsdPerItemValue;
    setOutputValue(fobUsd, fobUsdValue);
    
    // 计算右列输出值
    // 卖价结算(RMB) = 卖价(USD) * 结算汇率
    const sellingPriceRmbValue = sellingPriceUsdValue * settlementExchangeRateValue;
    setOutputValue(sellingPriceRmb, sellingPriceRmbValue);
    
    // 退税 = 含税出厂价 / 1.13 * 退税率
    const taxRefundValue = factoryPriceValue / 1.13 * (taxRefundRateValue / 100);
    setOutputValue(taxRefund, taxRefundValue);
    
    // 差价 = 卖价结算(RMB) + 退税 - 含税出厂价 - 运费RMB(个)
    const priceDifferenceValue = sellingPriceRmbValue + taxRefundValue - factoryPriceValue - freightRmbPerItemValue;
    setOutputValue(priceDifference, priceDifferenceValue);
    
    // 差价(总) = 差价(个) * 装柜数量
    const totalPriceDifferenceValue = priceDifferenceValue * containerQuantityValue;
    setOutputValue(totalPriceDifference, totalPriceDifferenceValue);
    
    // 倒推卖价(USD) = (验算(最低差价)/装柜数量+出厂含税价+运费RMB(个)-退税) / 结算汇率
    const reverseSellingPriceUsdValue = (minPriceDifferenceValue / containerQuantityValue + factoryPriceValue + freightRmbPerItemValue - taxRefundValue) / settlementExchangeRateValue;
    setOutputValue(reverseSellingPriceUsd, reverseSellingPriceUsdValue);
    
    // 倒推(最低出厂价RMB) = (验算(最低差价)/装柜数量+运费RMB(个)-验算(需求USD)*结算汇率) / (退税率 / 1.13 - 1)
    const taxRefundRateDecimal = taxRefundRateValue / 100;
    const denominator = (taxRefundRateDecimal / 1.13 - 1);
    
    // 防止除以零
    let reverseFactoryPriceValue = 0;
    if (denominator !== 0) {
        reverseFactoryPriceValue = (minPriceDifferenceValue / containerQuantityValue + freightRmbPerItemValue - requiredUsdValue * settlementExchangeRateValue) / denominator;
    }
    setOutputValue(reverseFactoryPrice, reverseFactoryPriceValue);
}

// 重置所有输入和输出字段的函数
function resetAll() {
    // 重置输入字段
    inputFields.forEach(field => {
        field.value = '';
    });
    
    // 重置输出字段
    const outputFields = [
        tax, priceWithoutTax, usdPrice, freightRmbPerItem, freightRmbPerItemRight,
        freightUsdPerItem, fobUsd, sellingPriceRmb, taxRefund, priceDifference,
        totalPriceDifference, reverseSellingPriceUsd, reverseFactoryPrice
    ];
    
    outputFields.forEach(field => {
        field.value = '';
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化时清空所有字段
    resetAll();
});