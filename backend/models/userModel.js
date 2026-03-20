import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  image:            { type: String, default: '' },
  phone:            { type: String, default: '' },
  address:          { type: Object, default: { line1: '', line2: '' } },
  gender:           { type: String, default: 'Not Selected' },
  dob:              { type: String, default: '' },
  bloodGroup:       { type: String, default: '' },
  conditions:       { type: String, default: '' },
  allergies:        { type: String, default: '' },
  medications:      { type: String, default: '' },
  emergencyContact: { type: String, default: '' }, // phone number with country code e.g. +919876543210
}, { timestamps: true })

const userModel = mongoose.models.user || mongoose.model('user', userSchema)
export default userModel
