import pg from 'pg'
const { Pool, Client } = pg
 
const pool = new Pool({
  user: 'postgres',
  password: 'basededatos',
  host: 'localhost',
  port: 5432,
  database: 'task',
})
 
// console.log(await pool.query('SELECT * from company'))

 
const client = new Client({
  user: 'postgres',
  password: 'basededatos',
  host: 'localhost',
  port: 5432,
  database: 'task',
})
 
await client.connect()

const text = 'INSERT INTO COMPANY(ID,NAME,AGE,ADDRESS,SALARY) VALUES($1, $2, $3, $4, $5) RETURNING *'
const text2 = 'SELECT * FROM company WHERE id = $1'
const text3 = 'SELECT * FROM company WHERE name = $1'
const values = ['2', 'Juan', 26, 'Mexicali', 20000.00]
const values2 = [2]
const values3 = ['Paul']

const res = await client.query(text3, values3)
console.log(res.rows[0])
// console.log(await client.query('SELECT * from company'))
 
await client.end()