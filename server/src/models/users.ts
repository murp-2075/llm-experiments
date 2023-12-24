import db from "../utils/db";

(() => {
    const createQuery = db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, firstName TEXT, lastName TEXT, password TEXT)');
    createQuery.run();
})();

class User {
    // Constructor for User model
    public id: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public isAdmin: boolean;

    constructor(id: number, email: string, isAdmin: boolean, firstName: string, lastName: string) {
        this.id = id;
        this.email = email;
        this.isAdmin = isAdmin;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Method to find a user by ID
    static findById(id: number) {
        const sql = db.query('SELECT * FROM users WHERE id = ?');
        const row: any = sql.get(id)
        if (row) {
            return new User(row.id, row.email, row.isAdmin, row.firstName, row.lastName);
        }
        return null;
    }

    static findByEmail(email: string): User | null {
        const sql = db.query('SELECT * FROM users WHERE email = ?');
        const row: any = sql.get(email)
        if (row) {
            return new User(row.id, row.email, row.isAdmin, row.firstName, row.lastName);
        }
        return null;
    }

    async validatePassword(password: string): Promise<boolean> {
        const sql = db.query('SELECT * FROM users WHERE id = ?');
        const row: any = sql.get(this.id)
        if (row) {
            return await Bun.password.verify(password, row.password);
        } else {
            return false;
        }
    }

    // Other methods like create, update, delete can be added here
}
export default User;