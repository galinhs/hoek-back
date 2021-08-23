import express from 'express'
import { getFile } from '../controllers/files.js'

const router = express.Router()

router.get('/:file', getFile)

export default router
