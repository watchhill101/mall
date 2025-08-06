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
        // 恢复回收站
        restoreProductFromRecycleBin: restoreProductFromRecycleBin,
        // 更新审核商品状态
        updateAuditStatus: updateAuditStatus,


    }
}

export default apiMap


// 获取商品数据
function getDashboardCharts() {
    return request({
        url: '/qiao/products',
        method: 'GET'
    })
}
// 修改商品状态
function updateProductStatus(productId, status) {
    return request({
        url: `/qiao/updateProductStatus`,
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
        url: '/qiao/productAudit',
        method: 'GET'
    })
}
// 商品加入回收站
function addToRecycleBin(data) {
    return request({
        url: `/qiao/addProductRecycleBin`,
        method: 'POST',
        data
    })
}
// 获取回收站数据
function getProductRecycleBin() {
    return request({
        url: `/qiao/getProductRecycleBin`,
        method: 'GET'
    })
}
// 新增商品审核记录
function addProductAudit(data) {
    return request({
        url: `/qiao/addProductAudit`,
        method: 'POST',
        data
    });
}
// 从回收站恢复商品
function restoreProductFromRecycleBin(data) {
    return request({
        url: `/qiao/restoreProductFromRecycleBin`,
        method: 'POST',
        data
    });
}
// 更新审核状态
function updateAuditStatus(data) {
    return request({
        url: `/qiao/updateAuditStatus`,
        method: 'PUT',
        data
    });
}