import mongoose from 'mongoose'

const Schema = mongoose.Schema

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    products: [{
      product: {
        type: Schema.Types.ObjectId,
        // ref 關聯商品資料
        ref: 'products',
        required: [true, '缺少商品 ID']
      },
      amount: {
        type: Number,
        required: [true, '缺少商品數量']
      }
    }],
    date: {
      type: Date,
      required: [true, '缺少訂單日期']
    },
    receiver: {
      type: String
    },
    phone: {
      type: Number
    },
    address: {
      type: String
    },
    delivery: {
      type: String
    },
    payment: {
      type: String
    },
    totalPrice: {
      type: Number
    }
  }, { versionKey: false })

export default mongoose.model('orders', orderSchema)
