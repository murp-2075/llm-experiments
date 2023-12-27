import { Database } from 'bun:sqlite';

// Function to hash password
async function hashPassword(password: string) {
    return await Bun.password.hash(password);
}

// Function to insert user data into the database
async function updatePassword(email: string, hashedPassword: string) {
    const db = new Database('./database.db');
    //get user from db
    const getUserSQL = db.query('SELECT * FROM users WHERE email = ?');
    const user = getUserSQL.get(email);
    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    const updateQuery = db.query('UPDATE users SET password = ? WHERE email = ?')
    updateQuery.run(hashedPassword, email);
    console.log('Password updated successfully!');
    db.close();
}

// Main function to handle the process
async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: bun updatePassword.js <email> <password>');
        process.exit(1);
    }

    const [email, password] = args;
    const hashedPassword = await hashPassword(password);
    await updatePassword(email, hashedPassword);
}

// Run the main function
main();
