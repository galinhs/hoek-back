import mongoose from 'mongoose'

const Schema = mongoose.Schema

const exhitbitionSchema = new Schema({
  name: {
    type: String,
    required: [true, '展名不能為空'],
    minlength: [1, '展名不能為空']
  },
  artist: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    required: [true, '展覽描述不能為空'],
    minlength: [1, '展覽描述不能為空']
  },
  current: {
    type: Boolean,
    default: false
  },
  image: {
    type: [String]
  }
}, { versionKey: false })

export default mongoose.model('exhitbitions', exhitbitionSchema)
