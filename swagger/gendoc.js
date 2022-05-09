import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import swaggerAutogen from "swagger-autogen"

const __dirname = dirname(fileURLToPath(import.meta.url))
const doc = {
  info: {
    title: "DeclaBot",
    description: "TBD",
  },
  host: "localhost:3000",
  schemes: ["http"],
  definitions: {
    declaration: {
      $declType: "type",
      $content: "smth",
    },
    document: {
      $docType: "type",
      $conent: "smth",
    },
  },
}

const outputFile = join(__dirname, "/output.json")
const endpointsFiles = [join(__dirname, "../server/server.js")]

swaggerAutogen()(outputFile, endpointsFiles, doc).then(async () => {
  if (process.argv[2] !== "--skip") {
    await import("../server/server.js")
  }
})
