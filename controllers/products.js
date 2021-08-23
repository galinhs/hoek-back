import products from '../models/products.js'

// 新增商品
export const newProduct = async (req, res) => {
  // 是否有管理員權限
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  // 檢查資料格式
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await products.create({
      name: req.body.name,
      price: req.body.price,
      author: req.body.author,
      category: req.body.category,
      description: req.body.description,
      authorDescription: req.body.authorDescription,
      sell: req.body.sell,
      recommend: req.body.recommend,
      image: req.files
    })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log(error)
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

// 取得上架商品
export const getProduct = async (req, res) => {
  try {
    const result = await products.find({ sell: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得全部商品
export const getAllProduct = async (req, res) => {
  // 是否有管理員權限
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  try {
    const result = await products.find()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得個別商品
export const getProductById = async (req, res) => {
  try {
    const result = await products.findById(req.params.id)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無商品' })
    }
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 編輯商品
export const editProduct = async (req, res) => {
  // 是否有管理員權限
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限' })
    return
  }
  // 檢查資料格式
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      name: req.body.name,
      price: req.body.price,
      author: req.body.author,
      category: req.body.category,
      description: req.body.description,
      authorDescription: req.body.authorDescription,
      sell: req.body.sell,
      recommend: req.body.recommend
    }
    // 如果有 req.filepath 才放 image 進去
    if (req.files.length > 0) data.image = req.files
    const result = await products.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
