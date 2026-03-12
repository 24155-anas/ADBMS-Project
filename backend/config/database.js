//connecting to postgres database

const pg = require('pg');

//connection pool
const Pool = pg.Pool;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'rideshare_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,  //simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

//pool k beghair aik connection at a time and bar bar close hote which is not suitable

//text = sql string and params = vals array []
//basically a wrapper so controller write query() instead of pool.query()..
const query = (text, params) => pool.query(text, params);

//get a dedicated connection(helps in transactions part) otherwise query sends whioever is free thar breaks transactions logic
const getClient = () => pool.connect();

const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('PostgreSQL connected at', res.rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, query, getClient, testConnection };