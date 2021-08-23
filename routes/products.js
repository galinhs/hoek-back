import express from 'express'

import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'

import {
  newProduct,
  getProduct,
  getAllProduct,
  getProductById,
  editProduct
} from '../controllers/products.js'

const router = express.Router()

router.post('/', auth, upload, newProduct)
router.get('/', getProduct)
// 若順序先 '/:id'後 '/all'，'/all'會被當成 id
router.get('/all', auth, getAllProduct)
router.get('/:id', getProductById)
router.patch('/:id', auth, upload, editProduct)

export default router
