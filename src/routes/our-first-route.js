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

    fastify.get('/users/', async (req, reply) => {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query(
          'SELECT * FROM users',
        )
        // Note: avoid doing expensive computation here, this will block releasing the client
        return rows
      } finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    })

    fastify.get('/users/:id', async (req, reply) => {
        const client = await fastify.pg.connect()
        try {
          const { rows } = await client.query(
            'SELECT * FROM users WHERE id=$1', [req.params.id],
          )
          // Note: avoid doing expensive computation here, this will block releasing the client
          return rows
        } finally {
          // Release the client immediately after query resolves, or upon error
          client.release()
        }
      })

      // fastify.post('/users/', function (req, reply) {
      //   fastify.pg.query(
      //     'INSERT INTO "Users"(ID,NAME,AGE,ADDRESS,SALARY) VALUES($1, $2, $3, $4, $5) RETURNING *', [req.params.id],
      //     function onResult (err, result) {
      //       reply.send(err || result)
      //     }
      //   )
      // })      

      fastify.post('/users/', async (req, reply) => {
        const client = await fastify.pg.connect()
        const {id, name, email, age, password} = req.body;
        console.log(name);
        // const id = uuidv4()
        const done = false
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        try {
          const { rows } = await client.query(
            'INSERT INTO users(ID,NAME,EMAIL,AGE,PASSWORD,"createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [id,name,email,age,password,createdAt,updatedAt],
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
  