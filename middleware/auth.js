import jwt from 'jsonwebtoken'
import users from '../models/users.js'

// 登入驗證
export default async (req, res, next) => {
  try {
    const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : ''
    if (token.length > 0) {
      const decoded = jwt.verify(token, process.env.SECRET)
      const _id = decoded._id
      req.user = await users.findOne({ _id, tokens: token })
      req.token = token
      // 如果有找到使用者
      if (req.user !== null) {
        next()
      } else {
        throw new Error()
      }
    }
  } catch (error) {
    console.log(error)
    // .send 會自動判斷裡面的格式
    // .json 會送 json 格式
    res.status(401).send({ success: false, message: '驗證錯誤' })
  }
}
