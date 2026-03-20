import multer from 'multer'

// Store in memory — then upload to Cloudinary from buffer
const storage = multer.diskStorage({
  filename: (req, file, cb) => cb(null, file.originalname)
})

const upload = multer({ storage })
export default upload
