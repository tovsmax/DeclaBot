import express from 'express'
import path from 'path'

import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'

import declRouter from './routes/decls.routes.js'
import docRouter from './routes/docs.routes.js'
import fileTransRouter from './routes/fileTransfering.routes.js'
import { corsAllowOrigin } from './cors.js'
import createBot from './bot.js'

const ser = express()
const port = 3000

const allowedOrigins = ['https://declabot.loca.lt', `http://127.0.0.1:${port}`]

corsAllowOrigin(ser, allowedOrigins)

ser.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

ser.use('/', express.static(path.resolve('client')))

const swaggerFile = JSON.parse(
  readFileSync(path.resolve('swagger', 'output.json'))
)
ser.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

ser.use('/declarations', declRouter)
ser.use('/docs', docRouter)
ser.use('/upload', fileTransRouter)

ser.listen(port, async () => {
  createBot()

  console.log(`Server listening on ${port}!`)
  console.log('Http url:', 'http://localhost:3000')
  console.log('API Documentation:', `http://localhost:3000/api-doc`)
})