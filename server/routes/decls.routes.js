import { declarations } from "../database.js"
import { Router } from "express"

const declRouter = Router()

declRouter.get("/:id", (req, res) => {
  /*
    #swagger.description = 'Get declaration by id.'
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/declaration' }
    }
  */
  const id = req.params.id
  const decl = declarations.find((curDecl) => curDecl.id == id)
  if (decl) {
    res.status(200).send(decl)
  } else {
    res.status(404).send("Document not found.")
  }
})

export default declRouter
