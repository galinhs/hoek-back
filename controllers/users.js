import users from '../models/users.js'
import products from '../models/products.js'
import md5 from 'md5'
import jwt from 'jsonwebtoken'

// 註冊
export const register = async (req, res) => {
  // 檢查資料格式
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    // 格式不正確就 return 下面不繼續
    return
  }
  try {
    await users.create(req.body)
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '帳號已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

// 登入
export const login = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    // 先在 users 資料庫找有沒有符合 post 進來的帳號的使用者
    const user = await users.findOne({ account: req.body.account }, '')
    if (user) {
      // 有沒有符合 md5 加密過的密碼
      if (user.password === md5(req.body.password)) {
        // 授權一組 jwt 的序號
        const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET, { expiresIn: '7days' })
        // 序號加入資料庫
        user.tokens.push(token)
        // 儲存
        user.save({ validateBeforeSave: false })
        // 傳回前端需要的資料
        res.status(200).send({
          success: true,
          message: '登入成功',
          token,
          email: user.email,
          account: user.account,
          role: user.role
        })
      } else {
        res.status(400).send({ success: false, message: '密碼錯誤' })
      }
    } else {
      res.status(400).send({ success: false, message: '帳號錯誤' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 登出
export const logout = async (req, res) => {
  try {
    // 拿 tokens 序號過來把資料庫 tokens 序號裡面的東西拿掉
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 加入購物車
export const addCart = async (req, res) => {
  try {
    // 驗證商品是否存在
    const result = await products.findById(req.body.product)
    // 如果找不到或已下架
    if (!result || !result.sell) {
      res.status(404).send({ success: false, message: '資料不存在' })
      return
    }
    // 找出使用者的購物車內有沒有這個商品
    // 因為原始資料是 mongoose 的 id (objectid)格式要將 item.product.toString() 轉為一般文字才能比對
    // user.cart.findIndex 找出 user 的 cart 的陣列索引值(在陣列裡的第幾項)
    // const idx = req.user.cart.findIndex(item => {
    //   return item.product.toString() === req.body.product
    // })
    const idx = req.user.cart.findIndex(item => item.product.toString() === req.body.product)
    // 有找到就數量 += 傳入的新增數量，沒找到就 push(避免商品重複)
    if (idx > -1) {
      req.user.cart[idx].amount += req.body.amount
    } else {
      req.user.cart.push({ product: req.body.product, amount: req.body.amount })
    }
    await req.user.save({ validateBeforeSave: false })
    // result: req.user.cart.length 回傳數量，將購物車目前儲存的商品數量回傳前台(顯示購物車裡目前有幾樣商品)
    res.status(200).send({ success: true, message: '', result: req.user.cart.length })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得購物車內商品
export const getCart = async (req, res) => {
  try {
    // 以使用者 id 查詢使用者，只取 cart 欄位並將 ref 的商品資料一起帶出來
    const { cart } = await users.findById(req.user._id, 'cart').populate('cart.product')
    res.status(200).send({ success: true, message: '', result: cart })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 編輯 & 刪除購物車內商品
export const editCart = async (req, res) => {
  try {
    // 如果傳入的數量小於等於 0，刪除
    // 如果大於 0，修改數量
    if (req.body.amount <= 0) {
      await users.findOneAndUpdate(
        // 找到 cart.product 裡符合傳入的商品 ID
        { 'cart.product': req.body.product },
        {
          $pull: {
            cart: {
              product: req.body.product
            }
          }
        }
      )
    } else {
      await users.findOneAndUpdate(
        // 找到 cart.product 裡符合傳入的商品 ID
        {
          'cart.product': req.body.product
        },
        // 將該筆改為傳入的數量，$ 代表符合查詢條件的索引
        {
          $set: {
            'cart.$.amount': req.body.amount
          }
        }
      )
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 將 jwt token 舊換新
export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => req.token === token)
    const token = jwt.sign({ _id: req.user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    // 標記陣列文字已修改過，不然不會更新
    req.user.markModified('tokens')
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '', result: token })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getuserinfo = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: '',
      result: { account: req.user.account, role: req.user.role, email: req.user.email }
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
