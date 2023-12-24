import { Database } from "bun:sqlite";


const db = new Database('./database.db');


export default db;