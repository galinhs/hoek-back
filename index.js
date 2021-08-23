import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'

import userRouter from './routes/users.js'
import productRouter from './routes/products.js'
import orderRouter from './routes/orders.js'
import fileRouter from './routes/files.js'
import exhibitionRouter from './routes/exhibitions.js'

dotenv.config()

mongoose.connect(process.env.MONGODB)

const app = express()

// cors 處理跨域請求
app.use(
  cors({
    origin (origin, callback) {
      // 開發環境下允許全部請求
      if (process.env.DEV === 'true') {
        callback(null, true)
      } else {
        // 非開發環境下，判斷請求從哪裡來，只允許來自 github 的請求
        if (origin !== undefined && origin.includes('github')) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed'), false)
        }
      }
    }
  })
)

// 處理 cors 錯誤
app.use((_, req, res, next) => {
  res.status(403).send({ success: false, message: '請求被拒絕' })
})

// body-parser 解析 post 進來的資料
app.use(bodyParser.json())

// 處理 body-parser 錯誤
app.use((_, req, res, next) => {
  res.status(404).send({ success: false, message: '內容格式錯誤' })
})

// 放在 bosy-parser 處理錯誤前錯誤就會跑出來
// 放在最後面會永遠讀不到
app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/orders', orderRouter)
app.use('/files', fileRouter)
app.use('/exhibitions', exhibitionRouter)

// 最後擋住 404 不要讓 express 去處理
app.all('*', (req, res) => {
  res.status(404).send({ success: false, message: '找不到內容' })
})

app.listen(process.env.PORT, () => {
  console.log('server start')
})
