import express from "express"
import localtunnel from "localtunnel"

import { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"

import swaggerUi from "swagger-ui-express"
import { readFileSync } from "fs"

import declRouter from "./routes/decls.routes.js"
import docRouter from "./routes/docs.routes.js"
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

ser.listen(port, () => {
  console.log(`Server listening on ${port}!`)
})
localtunnel(port, { subdomain: "declabot" }).then((tunnel) => {
  console.log("Https redirect:", tunnel.url)
  bot("5329580924:AAFsd2Itl-F4PDxgOOLtwkGNzCbTst1CvH0", tunnel.url)
})
