import express from 'express'
import auth from '../middleware/auth.js'
import {
  checkout,
  getOrders,
  getAllOrders,
  updateOrder
} from '../controllers/orders.js'

const router = express.Router()

router.post('/checkout', auth, checkout)
router.get('/', auth, getOrders)
router.get('/all', auth, getAllOrders)
router.patch('/:id', auth, updateOrder)

export default router
