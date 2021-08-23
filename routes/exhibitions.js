import express from 'express'

import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'

import {
  newExhibition,
  getAllExhibition,
  getExhibitionById,
  editExhibition
} from '../controllers/exhibitions.js'

const router = express.Router()

router.post('/', auth, upload, newExhibition)
router.get('/all', getAllExhibition)
router.get('/:id', getExhibitionById)
router.patch('/:id', auth, upload, editExhibition)

export default router
