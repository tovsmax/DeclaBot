import express from "express"
import localtunnel from "localtunnel"

import { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"

import swaggerUi from "swagger-ui-express"
import { readFileSync } from "fs"

import declRouter from "./routes/decls.routes.js"
import docRouter from "./routes/docs.routes.js"
import fileTransRouter from "./routes/fileTransfering.routes.js"
import bot from "./bot.js"

const ser = express()
const port = 3000

const __dirname = dirname(fileURLToPath(import.meta.url))
ser.use("/", express.static(join(__dirname, "../client")))

const swaggerFile = JSON.parse(
  readFileSync(resolve(__dirname, "../swagger/output.json"))
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
  
  console.log("Http url:", "http://localhost:3000")
  console.log("Https redirect:", tunnel.url)
  console.log(`Server listening on ${port}!`)
})