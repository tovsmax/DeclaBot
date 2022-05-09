import { docs } from "../database.js"
import { Router, json } from "express"

const docRouter = Router()

docRouter.get("/", (req, res) => {
  /* 
    #swagger.description = 'Get all documents in database.'
    #swagger.responses[200] = {
      description: 'Array of documents.',
      schema: [
        { $ref: '#/definitions/document' }
      ]
    }
  */
  res.status(200).send(docs)
})

docRouter.post("/", json(), (req, res) => {
  /* 
    #swagger.description = 'Add a document.'
    #swagger.parameters['newDoc'] = {
      in: 'body',
      schema: { 
        $ref: '#/definitions/document' 
      }
    }
  */
  const id = Math.max.apply(
    null,
    docs.map((doc) => doc.id)
  )
  const newDoc = {
    id: id + 1,
    type: req.body.type,
    content: req.body.content,
  }

  docs.push(newDoc)
  res.status(201).send("New document was added.")
})

docRouter.delete("/:id", (req, res) => {
  /* 
    #swagger.description = 'Delete a document.'
    #swagger.responses[200] = {
      description: 'Return deleted document.',
      schema: { $ref: '#/definitions/document' }
    }
  */
  const id = req.params.id
  const docInd = docs.findIndex((curDic) => curDic.id == id)
  if (docInd > -1) {
    const delDoc = docs.splice(docInd, 1)[0]
    res.send(delDoc)
  } else {
    res.status(404).send("Document not found.")
  }
})

docRouter.put("/:id", json(), (req, res) => {
  /* 
    #swagger.description = 'Change a document.'
    #swagger.parameters['changes'] = {
      in: 'body',
      description: 'Change the document with the given field(s).',
      schema: {
        docType: "type",
        content: "asd"
      }
    }
    #swagger.responses[201] = {
      description: '*Bug Response*'
    }
  */
  if (!req.body) return res.sendStatus(400)

  const doc = docs.find((doc) => doc.id == req.params.id)
  if (doc) {
    doc.type = req.body.type || doc.type
    doc.content = req.body.content || doc.content
    res.status(200).send(doc)
  } else {
    res.status(404).send("Document not found.")
  }
})

export default docRouter
