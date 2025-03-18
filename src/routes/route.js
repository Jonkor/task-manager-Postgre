// route.js

import { format } from "sequelize/lib/utils";
import { getUserSchema, postUserSchema, loginUserSchema, getTaskSchema, postTaskSchema} from "../schemas/schemas.js";
import { v4 as uuidv4 } from 'uuid';


/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    await fastify.register(import('fastify-bcrypt'), { //loads plugin bycrypt hashing password
      saltWorkFactor: 12
    });

    await fastify.register(import('@fastify/jwt'), { //loads plugin jwt
      secret: 'wowsosecret'
    });

    await fastify.decorate("authenticate", async function(request, reply) { //using fastify auth plugin to protect the routes
      const client = await fastify.pg.connect(); 
      try {
        const token = request.raw.rawHeaders.filter((header) => header.includes('Bearer'));// filter to see if contains Bearer header       
        const decoded = await request.jwtVerify(token); // gets the id of the row related to the token
        
        if (!decoded) {
          throw new Error('No token found')
        }
        const tokenString = token[0].replace(/^Bearer\s+/i, "").trim(); //removes bearer so only the string is left
        console.log(decoded);
        
                
        const { rows } = await client.query( //this get all tokens from user and search if both id and jwt exists
          `SELECT * FROM users 
          WHERE EXISTS (SELECT 1 FROM jsonb_each_text(tokens) AS token(key, value) WHERE value=$1)
          AND id=$2`, [tokenString, request.user.id]
        )

        // const { rows } = await client.query( //this get all tokens from user
        //   `SELECT * FROM users 
        //   WHERE EXISTS (SELECT 1 FROM jsonb_each_text(tokens) AS token(key, value) 
        //   WHERE value=$1)`, [tokenString]
        // )

        // const exist = Object.entries(rows[0].tokens).forEach((key, value) => {
        //   if (value === tokenString){
        //     return true;
        //   }
        // }) 
        // console.log(rows[0]);
        // console.log(exist);
        
        if (rows.length === 0) { // if not record exists either id or token was not found in db
          throw new Error('No token found, please login');
        }
       
        // console.log(rows[0].tokens);
        
        request.user.token = token; //asigns user token to the request
               
        request.user.id = decoded.id; // assigns to and returns the request petition the id of the row

        request.user.tokens = rows[0].tokens; //asigns user tokenn to the request
        
        return request.user;        
        //await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      } finally {
        client.release();
      }
    })

    fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    });

    await fastify.get('/users/me', {schema: getUserSchema, onRequest: [fastify.authenticate]}, async (req, reply) => { //onRequest used to protect route
      const client = await fastify.pg.connect();
      try {
        const { rows } = await client.query(
          'SELECT name,email,age FROM users WHERE id=$1', [req.user.id]
        )
        // Note: avoid doing expensive computation here, this will block releasing the client
        reply.code(200);
        return rows;
      } catch (error){
        throw new Error(error);
      } finally {
        // Release the client immediately after query resolves, or upon error
        client.release();
      }
    });

      await fastify.post('/users/', {schema: postUserSchema}, async (req, reply) => {
        const client = await fastify.pg.connect();
        const {name, email, age, password} = req.body;
        const id = uuidv4();
        // const randomNumber = Math.floor(Math.random() * 5000);       
        const done = false;
        const hashedPassword = await fastify.bcrypt.hash(password); //hash password       
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();

        // const token = await fastify.jwt.sign({randomNumber: randomNumber.toString()}, {expiresIn: '7d'}, 'wowsosecret', );  //generates json web token string using a random number      
        const token = await fastify.jwt.sign({id: id.toString()}, {expiresIn: '7d'}, 'wowsosecret', ); //generates json web token string using uuid for randomness 
        const objectToken = {token}; //assigns token string as a object for Tokens JsonB field

        try {
          const { rows } = await client.query(
            'INSERT INTO users(ID,NAME,EMAIL,AGE,PASSWORD,TOKENS,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING NAME, EMAIL, AGE', [id,name,email,age,hashedPassword,objectToken,createdAt,updatedAt],
          )
          // Note: avoid doing expensive computation here, this will block releasing the client                    
          reply.code(201);
          return rows;
        } catch (error){
          throw new Error(error);
        }finally {
          // Release the client immediately after query resolves, or upon error
          client.release();
        }
      }); 
      
      await fastify.post('/users/login', loginUserSchema, async (req, reply) => {
        const {email, password} = req.body;
        const client = await fastify.pg.connect();
        // const randomNumber = Math.floor(Math.random() * 5000); // for jwt       
        try {
          const { rows } = await client.query(
            `SELECT * FROM users WHERE email=$1`, [email]
          );

          if (rows.length === 0){
            return reply.status(400).send({ error: 'User not found' });
          }

          const user = rows[0];
          const isMatch = await fastify.bcrypt.compare(password, user.password);

          if (!isMatch) {
            return reply.status(401).send({ error: 'Invalid credentials' });
          }
          
          // const token = await fastify.jwt.sign({randomNumber: randomNumber.toString()}, {expiresIn: '7d'}, 'wowsosecret', );  //generates json web token string using a random number      
          const token = await fastify.jwt.sign({id: user.id.toString()}, {expiresIn: '7d'}, 'wowsosecret', ); //generates json web token string using uuid for randomness 
          
          // user.tokens = user.tokens.concat({token});//assigns token to users tokens string array 
          user.tokens['token'+(Object.keys(user.tokens).length+1).toString()] = token; //generates dynamic keys based on the tokens we have and then we store the value token
          
          const updatedAt = new Date().toISOString();  

          const query = {
            text: `UPDATE users SET
            tokens= COALESCE($1, tokens), "updatedAt"= COALESCE($2, "updatedAt")
            WHERE id=$3 RETURNING *`,
            values: [user.tokens, updatedAt, user.id]
          }

          const { rowUpdate } = await client.query(query);
          await reply.send({ message: 'Login successful', user, token });
          return rowUpdate;
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }
      });

      await fastify.post('/users/logout', {onRequest: [fastify.authenticate]}, async (req, reply) => {
        const client = await fastify.pg.connect();
        try {          
          const userId = req.user.id;
          const token = req.user.token[0].replace(/^Bearer\s+/i, "").trim();  
          
          const rows = await client.query(
            `UPDATE users 
            SET tokens = tokens - (
            SELECT key FROM jsonb_each_text(tokens) 
            WHERE value = $1
            ) 
            WHERE id = $2`,
            [token, userId]
          );

          req.user.token = null;
          reply.send({ message: 'Logged out successfully' });
          return rows;
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }
      });

      await fastify.post('/users/logoutAll', {onRequest: [fastify.authenticate]}, async (req, reply) => {
        const client = await fastify.pg.connect();
        try{
          const userId = req.user.id;

          const rows = await client.query( // set empty jsonb object, removing all tokens from the user
            `UPDATE users 
            SET tokens = '{}'::jsonb
            WHERE id = $1`,
            [userId]
          );          
          req.user.token = null;
          req.user.token = null;        
          reply.send({ message: 'Logged out all sessions successfully' });
          return rows;
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }
      });

      await fastify.patch('/users/me', {onRequest: [fastify.authenticate]}, async (req, reply) => {
        const client = await fastify.pg.connect();

        const updates = Object.keys(req.body); //array of strings
        const allowedUpdates = ["name", "email", "age", "password"]; //fields allowed to update
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        
        if (!isValidOperation) { 
          return reply.status(400).send({ error: 'Invalid update'});
        }
        
        const {name, email, age, password} = req.body;
        const hashedPassword = await fastify.bcrypt.hash(password); //hash password 
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString(); 

        const query = {
          text: `UPDATE users SET 
          name= COALESCE($1, name), email= COALESCE($2, email), age= COALESCE($3, age), password= COALESCE($4, password), "createdAt"= COALESCE($5, "createdAt"), "updatedAt"= COALESCE($6, "updatedAt") 
          WHERE id=$7 RETURNING name,email`,
          values: [name, email, age, hashedPassword, createdAt, updatedAt, req.user.id]
        }       
        try {
          const { rows } = await client.query(query);
          reply.code(204);
          return rows;
        }catch(error){
          throw new Error(error);
        }finally{
          client.release();
        }
      });
      
      await fastify.delete('/users/me', {onRequest: [fastify.authenticate]}, async (req, reply) => {
        const client = await fastify.pg.connect();
        try {
          const { rows } = await client.query(`DELETE FROM users WHERE id= $1 RETURNING name,email`, [req.user.id]); //use the attached user id on req auth
          reply.code(204);
          return rows;          
        } catch (error) {
          throw new Error(error);
        }finally {
          client.release();
        }
      });

      fastify.get('/tasks/', {schema: getTaskSchema}, async (req, reply) => {
        const client = await fastify.pg.connect();
        try{
          const { rows } = await client.query(
            'SELECT * FROM tasks',
          )
          reply.code(200);
          return rows; 
        } catch (error){
          throw new Error(error);
        } finally {
          client.release();
        }
      });

      fastify.get('/tasks/:id', {schema: getTaskSchema}, async (req, reply) => {
        const client = await fastify.pg.connect();
        try{
          const { rows } = await client.query(
            'SELECT * FROM tasks WHERE id=$1', [req.params.id],
          )
          reply.code(200);
          return rows;
        }catch (error){
          throw new Error(error);          
        }finally{
          client.release();
        }
      });

      await fastify.post('/tasks/', {schema: postTaskSchema}, async (req, reply) => {
        const client = await fastify.pg.connect();
        const {description, completed} = req.body;
        const id = uuidv4();       
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();        
        try{
          const { rows } = await client.query(
            'INSERT INTO tasks(ID,DESCRIPTION,COMPLETED,"createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5) RETURNING DESCRIPTION,COMPLETED', [id,description,completed,createdAt,updatedAt],            
          )
          reply.code(201);
          return rows;
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }

      });

      fastify.patch('/tasks/:id', async (req, reply) => {
        const client = await fastify.pg.connect();

        const updates = Object.keys(req.body); //array of strings
        const allowedUpdates = ["description", "completed"]; //fields allowed to update
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        
        if (!isValidOperation) { 
          return reply.status(400).send({ error: 'Invalid update'});
        }

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
          const {rowCount}  = await client.query(
            'SELECT * FROM tasks WHERE id=$1', [req.params.id],
          )

          if (rowCount === 0) { //If not record is found
            return reply.status(404).send({ error: 'Task not found'});
          }

          const { rows } = await client.query(query);
          reply.code(204);
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
          const {rowCount}  = await client.query(
            'SELECT * FROM tasks WHERE id=$1', [req.params.id],
          )

          if (rowCount === 0) { //If not record is found
            return reply.status(404).send({ error: 'Task not found'});
          }          
          const { rows } = await client.query(`DELETE FROM tasks WHERE id= $1 RETURNING *`, [req.params.id]);
          reply.code(204);
          return rows;
        } catch (error) {
          throw new Error(error);
        } finally {
          client.release();
        }
      });
  }
  
  //ESM
  export default routes;