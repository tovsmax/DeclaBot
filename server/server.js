import express from "express"
import localtunnel from "localtunnel"

import path, { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"

import swaggerUi from "swagger-ui-express"
import { readFileSync } from "fs"

import declRouter from "./routes/decls.routes.js"
import docRouter from "./routes/docs.routes.js"
import fileTransRouter from "./routes/fileTransfering.routes.js"
import bot from "./bot.js"
import { corsAllowOrigin } from "./cors.js"

const ser = express()
const port = 3000

const allowedOrigins = [
  'https://declabot.loca.lt',
  `http://127.0.0.1:${port}`
]

corsAllowOrigin(ser, allowedOrigins)

const __dirname = path.resolve()
ser.use("/", express.static(path.resolve(__dirname, "client")))

const swaggerFile = JSON.parse(
  readFileSync(path.resolve(__dirname, "swagger", "output.json"))
)
ser.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerFile))

ser.use("/declarations", declRouter)
ser.use("/docs", docRouter)
ser.use('/upload', fileTransRouter)

let tunnel
let declabot
const server = ser.listen(port, async () => {
  tunnel = await localtunnel(port, { subdomain: "declabot" })
  tunnel.on('close', () => {
    tunnel.close()
  })
  declabot = bot(tunnel.url)
  
  console.log(`Server listening on ${port}!`)
  console.log("Http url:", "http://localhost:3000")
  console.log("Https redirect:", tunnel.url)
  console.log("API Documentation:", `${tunnel.url}/api-doc`)
})