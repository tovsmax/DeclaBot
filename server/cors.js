import declRouter from './routes/decls.routes.js'
import docRouter from './routes/docs.routes.js'
import fileTransRouter from './routes/fileTransfering.routes.js'
import express from 'express'
const { Express } = express

const routers = [declRouter, docRouter, fileTransRouter]

/**
 * Выставляет cors-headers для маршрутов первого уровня и для маршрутов второго уровня, которые указаны в папке routers
 * @param {Express} ser
 * @param {string[]} allowedOrigins
 */
function corsAllowOrigin(ser, allowedOrigins) {
  for (const router of [ser, ...routers]) {
    router.use((req, res, next) => {
      const curOrigin = req.headers.origin
      if (allowedOrigins.includes(curOrigin)) {
        // res.setHeader('Access-Control-Allow-Origin', curOrigin)
        res.set({
          'Access-Control-Allow-Origin': curOrigin,
          'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        })
      }
      next()
    })
  }
}

export { corsAllowOrigin }
