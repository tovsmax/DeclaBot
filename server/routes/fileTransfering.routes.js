import { Router } from "express"
import multer from "multer"

const fileTransRouter = Router()

fileTransRouter.get("/", (req, res) => {
  /* 
    #swagger.description = 'Get all files of all users.'
    #swagger.tags = ['WIP']
  */
  // res.status(200).send(files)
})

fileTransRouter.get('/:user', (req, res) => {
  /* 
    #swagger.description = 'Get all files of specific user.'
    #swagger.tags = ['WIP']
  */
})

fileTransRouter.get("/:user/:filename", (req, res) => {
  /* 
    #swagger.description = 'Get the file of the user.'
    #swagger.tags = ['WIP']
  */
  // const id = req.params.id
  // const file = files.find((curFile) => curFile.id == id)
  // if (file) {
  //   res.status(200).send(file)
  // } else {
  //   res.status(404).send("File not found.")
  // }
})

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

fileTransRouter.use('/', multer({storage: storageConfig}).single('filedata'))
fileTransRouter.post("/", (req, res) => {
  /* 
    #swagger.description = 'Upload user`s file.'
  */
  const filedata = req.file
  if (!filedata) {
    res.sendStatus(400)
  } else {
    res.sendStatus(201)
  }
})

export default fileTransRouter