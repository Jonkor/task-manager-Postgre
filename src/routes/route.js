// route.js

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    });

    fastify.get('/users/', async (req, reply) => {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query(
          'SELECT * FROM users',
        )
        // Note: avoid doing expensive computation here, this will block releasing the client
        return rows;
      } finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    });

    fastify.get('/users/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        try {
          const { rows } = await client.query(
            'SELECT * FROM users WHERE id=$1', [req.params.id],
          )
          // Note: avoid doing expensive computation here, this will block releasing the client
          return rows;
        } finally {
          // Release the client immediately after query resolves, or upon error
          client.release()
        }
      });

      fastify.post('/users/', async (req, reply) => {
        const client = await fastify.pg.connect()
        const {id, name, email, age, password} = req.body;
        // const id = uuidv4()
        const done = false;
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        try {
          const { rows } = await client.query(
            'INSERT INTO users(ID,NAME,EMAIL,AGE,PASSWORD,"createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [id,name,email,age,password,createdAt,updatedAt],
          )
          // Note: avoid doing expensive computation here, this will block releasing the client
          return rows;
        } finally {
          // Release the client immediately after query resolves, or upon error
          client.release();
        }
      }); 
 
      fastify.patch('/users/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        const {name, email, age, password} = req.body;
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString(); 
        const query = {
          text: `UPDATE users SET 
          name= COALESCE($1, name), email= COALESCE($2, email), age= COALESCE($3, age), password= COALESCE($4, password), "createdAt"= COALESCE($5, "createdAt"), "updatedAt"= COALESCE($6, "updatedAt") 
          WHERE id=$7 RETURNING *`,
          values: [name, email, age, password, createdAt, updatedAt, req.params.id]
        }       
        try {
          const { rows } = await client.query(query);
          return rows;
        }catch(e){
          throw new Error(e);
        }finally{
          client.release();
        }
      });
      
      fastify.delete('/users/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        try {
          const { rows } = await client.query(`DELETE FROM users WHERE id= $1 RETURNING *`, [req.params.id]);
          reply.code(204);
          return reply.send(rows);          
        } catch (error) {
          throw new Error(error);
        }finally {
          client.release();
        }
      });

      fastify.get('/tasks/', async (req, reply) => {
        const client = await fastify.pg.connect();
        try{
          const { rows } = await client.query(
            'SELECT * FROM tasks',
          )
          return rows; 
        }finally {
          client.release();
        }
      });

      fastify.get('/tasks/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        try{
          const { rows } = await client.query(
            'SELECT * FROM tasks WHERE id=$1', [req.params.id],
          )
          return rows;
        }finally{
          client.release();
        }
      });

      fastify.post('/tasks/', async (req, reply) => {
        const client = await fastify.pg.connect();
        const {id, description, completed} = req.body;
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();        
        try{
          const { rows } = await client.query(
            'INSERT INTO tasks(ID,DESCRIPTION,COMPLETED,"createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5) RETURNING *', [id,description,completed,createdAt,updatedAt],            
          )
          return rows;
        }finally{
          client.release();
        }

      });

      fastify.patch('/tasks/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        const {description, completed} = req.body;
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString(); 
        const query = {
          text: `UPDATE tasks SET 
          description= COALESCE($1, description), completed= COALESCE($2, completed), "createdAt"= COALESCE($3, "createdAt"), "updatedAt"= COALESCE($4, "updatedAt") 
          WHERE id=$5 RETURNING *`,
          values: [description, completed, createdAt, updatedAt, req.params.id]
        }       
        try {
          const { rows } = await client.query(query);
          return rows;
        }catch(error){
          throw new Error(error);
        }finally{
          client.release();
        }
      });

      fastify.delete('/tasks/:id', async (req, reply) => {
        const client = await fastify.pg.connect();
        try {
          const { rows } = await client.query(`DELETE FROM tasks WHERE id= $1 RETURNING *`, [req.params.id]);
          reply.code(204);
          return reply(rows);
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }
      });
  }
  
  //ESM
  export default routes;
  