// our-first-route.js

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    })

    fastify.get('/user/:id', async (req, reply) => {
        const client = await fastify.pg.connect()
        try {
          const { rows } = await client.query(
            'SELECT * FROM "Tasks" WHERE id=$1', [req.params.id],
          )
          // Note: avoid doing expensive computation here, this will block releasing the client
          return rows
        } finally {
          // Release the client immediately after query resolves, or upon error
          client.release()
        }
      })
  }
  
  //ESM
  export default routes;
  