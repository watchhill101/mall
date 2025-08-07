import request from '../../utils/request'

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
        createProduct: createProduct,
        deleteProductFromRecycleBin: deleteProductFromRecycleBin,
        searchProducts: searchProducts,
        getproductCategories: getproductCategories,
        addProductCategory: addProductCategory,
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
// 更新商品信息
function updateProductInfo(updatedRecord) {
    const { productId, ...updateData } = updatedRecord;
    return request({
        url: `/qiao/updateProductInfo`,
        method: 'PUT',  // 确保与后端路由方法一致
        data: { productId, ...updateData }  // 将productId一起发送
    })
}
//创建新商品
function createProduct(productData) {
    console.log('添加商品')
    return request({
        url: `/qiao/createProduct`,
        method: 'POST',
        data: productData
    });
}
// 从回收站中永久删除商品
function deleteProductFromRecycleBin(id) {
    return request({
        url: `/qiao/deleteProductFromRecycleBin/${id}`,
        method: 'DELETE'
    });
}
// 搜索
// 添加搜索商品方法
function searchProducts(params) {

    return request({
        url: '/qiao/searchProducts',
        method: 'GET',
        params
    })
}
// 获取商品分类
function getproductCategories() {
    return request({
        url: '/qiao/productCategories',
        method: 'GET'
    });

}
// 添加商品分类
function addProductCategory(category) {
    return request({
        url: '/qiao/productCategories',
        method: 'POST',
        data: category
    });
}
