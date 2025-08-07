import React from 'react';
import ProductSelector from '../../components/ProductSelector/ProductSelector';

const ProductSelectorTest = () => {
  const handleProductsChange = (products) => {
    console.log('商品列表变化:', products);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>商品选择器测试页面</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>理货单模式</h3>
        <ProductSelector 
          type="tally"
          onChange={handleProductsChange}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>分拣单模式</h3>
        <ProductSelector 
          type="sorting"
          onChange={handleProductsChange}
        />
      </div>
    </div>
  );
};

export default ProductSelectorTest;
