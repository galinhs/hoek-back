// import users from '../models/users.js'
// import products from '../models/products.js'
// import md5 from 'md5'
// import jwt from 'jsonwebtoken'
import orders from '../models/orders.js'

// 結帳
export const checkout = async (req, res) => {
  try {
    // receiver: req.body.receiver
    // phone: req.body.phone,
    // address: req.body.address,
    // delivery: req.body.delivery,
    // payment: req.body.payment,
    // totalPrice: req.body.totalPrice
    if (req.user.cart.length > 0) {
      await orders.create({
        user: req.user._id,
        products: req.user.cart,
        date: new Date(),
        deliver: req.body.deliver
      })
      req.user.cart = []
      req.user.save({ validateBeforeSave: false })
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得個人訂單
export const getOrders = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('products.product')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得全部訂單
export const getAllOrders = async (req, res) => {
  // 是否有管理員權限
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    // .populate(使用 ref 的欄位, 要取那些欄位)
    const result = await orders.find().populate('user', 'account').populate('products.product', 'name price').lean()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const updateOrder = async (req, res) => {
  // 是否有管理員權限
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    // 簡單版
    // 第一步: 找出符合的資料
    const result = await orders.findOne({
      'orders._id': req.params.id,
      'orders.products.p_id': req.body.products.p_id
    })
    // 第二步: 直接做陣列處理改資料
    const orderidx = result.orders.findIndex(order => {
      return order._id.toString() === req.params.id
    })
    const productidx = result.orders[orderidx].products.findIndex(product => {
      return product.p_id.toString() === req.body.products.p_id
    })
    result.orders[orderidx].products[productidx].amount = req.body.amount
    // 第三步: 存回去
    result.save()

    // 複雜版
    // const result = await users.findOneAndUpdate(
    //   // 尋找符合指定的 orders 的 id 和 orders 內的商品 p_id
    //   {
    //     'orders._id': req.params.id,
    //     'orders.items.p_id': req.body.p_id
    //   },
    //   // 將找到的第一筆設定為傳入的新數量
    //   {
    //     $set: {
    //       'orders.$[a].items.$[b].amount': req.body.amount
    //     }
    //   },
    //   { new: true, arrayFilters: [{'a._id': req.params.id}, {'b.p_id': req.body.p_id}] }
    // )

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無訂單' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
