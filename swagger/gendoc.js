import swaggerAutogen from "swagger-autogen"

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

const outputFile = "./swagger/output.json"
const endpointsFiles = ["./server/server.js"]
swaggerAutogen()(outputFile, endpointsFiles, doc).then(async () => {
  if (process.argv[2] !== "--skip") {
    await import("../server/server.js")
  }
})
