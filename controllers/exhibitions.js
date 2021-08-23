import exhibitions from '../models/exhibitions.js'

// 新增展覽資料
export const newExhibition = async (req, res) => {
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
    const result = await exhibitions.create({
      name: req.body.name,
      artist: req.body.artist,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      current: req.body.current,
      image: req.files
    })
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

// 取得全部展覽資料
export const getAllExhibition = async (req, res) => {
  try {
    const result = await exhibitions.find()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 取得個別展覽資料
export const getExhibitionById = async (req, res) => {
  try {
    const result = await exhibitions.findById(req.params.id)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無展覽資料' })
    }
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// 編輯展覽
export const editExhibition = async (req, res) => {
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
      artist: req.body.artist,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      current: req.body.current
    }
    // 如果有 req.filepath 才放 image 進去
    if (req.files) data.image = req.files
    const result = await exhibitions.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
