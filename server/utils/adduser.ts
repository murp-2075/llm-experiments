import {Database} from 'bun:sqlite';

// Function to hash password
async function hashPassword(password: string) {
    return await Bun.password.hash(password);
}

// Function to insert user data into the database
async function insertUser(email: string, hashedPassword: string) {
    const db = new Database('./database.db');
    // const db = sqlite.open('./users.db');
    const createQuery = db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, firstName TEXT, lastName TEXT, password TEXT)');
    createQuery.run();
    const insertQuery =  db.query('INSERT INTO users (email, password) VALUES (?, ?)')
    insertQuery.run(email, hashedPassword);
    console.log('User added successfully!');
    db.close();
}

// Main function to handle the process
async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: bun addUser.js <email> <password>');
        process.exit(1);
    }

    const [email, password] = args;
    const hashedPassword = await hashPassword(password);
    await insertUser(email, hashedPassword);
}

// Run the main function
main();
