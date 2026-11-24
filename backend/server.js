import express from 'express'
import swaggerUi from 'swagger-ui-express'

const app = express()
const port = 6000

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Demo Backend API',
    version: '1.0.0',
    description: 'Simple Express API for Docker / Kubernetes demo',
  },
  servers: [{ url: '/' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/messages': {
      get: {
        summary: 'Get demo message',
        tags: ['Messages'],
        responses: {
          200: {
            description: 'Message from backend container',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'سلام از کانتینر backend',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/api/messages', (req, res) => {
  res.json({ message: 'سلام از کانتینر backend' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`server is running on ${port}`)
  console.log(`swagger UI: http://localhost:${port}/api-docs`)
})
