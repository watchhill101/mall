const mongoose = require("mongoose");

// 物流单模型
const logisticsOrderSchema = new mongoose.Schema(
  {
    logisticsOrderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 物流单编号
    
    relatedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }], // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    logisticsType: {
      type: String,
      required: true,
      enum: ["delivery", "pickup", "transfer", "return"]
    }, // 物流类型：配送、取货、调拨、退货
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "assigned", "picked_up", "in_transit", "delivered", "returned", "cancelled"],
      default: "pending"
    }, // 物流状态
    
    logisticsCompany: {
      companyId: { type: String }, // 物流公司ID
      companyName: { type: String }, // 物流公司名称
      trackingNumber: { type: String }, // 运单号
      serviceType: { 
        type: String, 
        enum: ["standard", "express", "same_day", "next_day"] 
      }, // 服务类型
      contactPhone: { type: String } // 联系电话
    }, // 物流公司信息
    
    sender: {
      name: { type: String, required: true }, // 发件人姓名
      phone: { type: String, required: true }, // 发件人电话
      address: { type: String, required: true }, // 发件地址
      detailAddress: { type: String }, // 详细地址
      postcode: { type: String } // 邮编
    }, // 发件人信息
    
    receiver: {
      name: { type: String, required: true }, // 收件人姓名
      phone: { type: String, required: true }, // 收件人电话
      address: { type: String, required: true }, // 收件地址
      detailAddress: { type: String }, // 详细地址
      postcode: { type: String } // 邮编
    }, // 收件人信息
    
    products: [{
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      }, // 商品
      productName: { 
        type: String, 
        required: true 
      }, // 商品名称
      productCode: { 
        type: String 
      }, // 商品编码
      sku: { 
        type: String 
      }, // SKU编码
      specifications: { 
        type: String 
      }, // 规格型号
      quantity: { 
        type: Number, 
        required: true 
      }, // 数量
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      weight: { 
        type: Number 
      }, // 重量(kg)
      volume: { 
        type: Number 
      }, // 体积(m³)
      value: { 
        type: Number 
      }, // 商品价值
      packageType: { 
        type: String, 
        enum: ["box", "bag", "pallet", "envelope"] 
      }, // 包装类型
      isFragile: { 
        type: Boolean, 
        default: false 
      }, // 是否易碎
      isLiquid: { 
        type: Boolean, 
        default: false 
      }, // 是否液体
      specialHandling: { 
        type: String 
      }, // 特殊处理要求
      notes: { 
        type: String 
      } // 备注
    }],
    
    shipmentInfo: {
      scheduledPickupTime: { 
        type: Date 
      }, // 预约取件时间
      actualPickupTime: { 
        type: Date 
      }, // 实际取件时间
      scheduledDeliveryTime: { 
        type: Date 
      }, // 预约送达时间
      actualDeliveryTime: { 
        type: Date 
      }, // 实际送达时间
      estimatedDeliveryTime: { 
        type: Date 
      }, // 预计送达时间
      totalDistance: { 
        type: Number 
      }, // 总距离(km)
      totalWeight: { 
        type: Number 
      }, // 总重量(kg)
      totalVolume: { 
        type: Number 
      }, // 总体积(m³)
      packageCount: { 
        type: Number, 
        default: 1 
      } // 包裹数量
    },
    
    driver: {
      driverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 司机ID
      driverName: { type: String }, // 司机姓名
      driverPhone: { type: String }, // 司机电话
      vehicleId: { type: String }, // 车辆ID
      vehiclePlate: { type: String }, // 车牌号
      vehicleType: { type: String } // 车辆类型
    }, // 司机信息
    
    tracking: [{
      timestamp: { 
        type: Date, 
        default: Date.now 
      }, // 时间戳
      status: { 
        type: String, 
        required: true 
      }, // 状态
      location: { 
        type: String 
      }, // 位置
      description: { 
        type: String 
      }, // 描述
      operator: { 
        type: String 
      }, // 操作员
      remark: { 
        type: String 
      } // 备注
    }], // 物流跟踪
    
    cost: {
      baseFee: { 
        type: Number, 
        default: 0 
      }, // 基础费用
      weightFee: { 
        type: Number, 
        default: 0 
      }, // 重量费用
      distanceFee: { 
        type: Number, 
        default: 0 
      }, // 距离费用
      serviceFee: { 
        type: Number, 
        default: 0 
      }, // 服务费用
      insuranceFee: { 
        type: Number, 
        default: 0 
      }, // 保险费用
      totalFee: { 
        type: Number, 
        default: 0 
      }, // 总费用
      paymentStatus: { 
        type: String, 
        enum: ["unpaid", "paid", "partial_paid"],
        default: "unpaid"
      } // 支付状态
    },
    
    insurance: {
      isInsured: { 
        type: Boolean, 
        default: false 
      }, // 是否投保
      insuranceAmount: { 
        type: Number, 
        default: 0 
      }, // 保险金额
      insuranceType: { 
        type: String 
      } // 保险类型
    },
    
    deliveryProof: {
      signatory: { 
        type: String 
      }, // 签收人
      signatureImage: { 
        type: String 
      }, // 签名图片
      photoProof: [{ 
        type: String 
      }], // 照片证明
      deliveryNote: { 
        type: String 
      } // 配送备注
    },
    
    emergencyContact: {
      name: { type: String }, // 紧急联系人姓名
      phone: { type: String }, // 紧急联系人电话
      relationship: { type: String } // 关系
    },
    
    specialInstructions: { 
      type: String 
    }, // 特殊说明
    
    notes: { 
      type: String 
    }, // 备注
    
    attachments: [{ 
      type: String 
    }], // 附件
    
    createBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 创建人
    
    lastUpdateBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    } // 最后更新人
  },
  {
    timestamps: true
  }
);

// 索引
// logisticsOrderSchema.index({ logisticsOrderId: 1 }); // 移除重复索引，logisticsOrderId 已经通过 unique: true 自动创建
logisticsOrderSchema.index({ merchant: 1 });
logisticsOrderSchema.index({ status: 1 });
logisticsOrderSchema.index({ logisticsType: 1 });
logisticsOrderSchema.index({ "logisticsCompany.trackingNumber": 1 });
logisticsOrderSchema.index({ "shipmentInfo.scheduledDeliveryTime": 1 });
logisticsOrderSchema.index({ "driver.driverId": 1 });

module.exports = mongoose.model("LogisticsOrder", logisticsOrderSchema);
