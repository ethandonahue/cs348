require("dotenv").config();
const { Pool } = require("pg");
const { Sequelize } = require("sequelize");
const pg = require("pg");

const database = process.env.PGDATABASE;

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${database}`;

const pool = new Pool({
  connectionString: connectionString,
});

const sequelize = new Sequelize({
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  dialect: "postgres",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
  sequelize
};
