import request from '@/utils/request'

const apiMap = {
    // 商品数据
    Product: {
        getList: getDashboardCharts,
        updateProductSta: updateProductStatus,
        getAudit: getAuditList,
        addToRecycleBin: addToRecycleBin,
        getProductRecycleBin: getProductRecycleBin,
        addProductAudit: addProductAudit,
        restoreProductFromRecycleBin: restoreProductFromRecycleBin,
        updateAuditStatus: updateAuditStatus,
        updateProductInfo: updateProductInfo,  // 确保此条目存在
    }
}

export default apiMap


// 获取商品数据
function getDashboardCharts() {
    return request({
        url: '/products/products',
        method: 'GET'
    })
}
// 修改商品状态
function updateProductStatus(productId, status) {
    return request({
        url: `/products/updateProductStatus`,
        method: 'PUT',
        data: {
            productId,
            status
        }
    })

}
// 获取审核列表数据
function getAuditList() {
    return request({
        url: '/products/productAudit',
        method: 'GET'
    })
}
// 商品加入回收站
function addToRecycleBin(data) {
    return request({
        url: `/products/addProductRecycleBin`,
        method: 'POST',
        data
    })
}
// 获取回收站数据
function getProductRecycleBin() {
    return request({
        url: `/products/getProductRecycleBin`,
        method: 'GET'
    })
}
// 新增商品审核记录
function addProductAudit(data) {
    return request({
        url: `/products/addProductAudit`,
        method: 'POST',
        data
    });
}
// 从回收站恢复商品
function restoreProductFromRecycleBin(data) {
    return request({
        url: `/products/restoreProductFromRecycleBin`,
        method: 'POST',
        data
    });
}
// 更新审核状态
function updateAuditStatus(data) {
    return request({
        url: `/products/updateAuditStatus`,
        method: 'PUT',
        data
    });
}
// 更新商品信息
function updateProductInfo(updatedRecord) {
    const { productId, ...updateData } = updatedRecord;
    return request({
        url: `/products/updateProductInfo`,
        method: 'PUT',  // 确保与后端路由方法一致
        data: { productId, ...updateData }  // 将productId一起发送
    })
}

// const searchProducts = (data) => {
//     return request({
//         url: `/products/searchProducts`,
//         method: 'POST',
//         data
//     });
// }