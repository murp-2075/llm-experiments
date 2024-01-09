import db from "../utils/db";
import type express from "express";

(() => {
    db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, firstName TEXT, lastName TEXT, password TEXT)').run();
    db.query(`
        CREATE TABLE IF NOT EXISTS logins 
        (id INTEGER PRIMARY KEY, userId INTEGER, ipAddress TEXT, success BOOLEAN, timestamp TEXT)
    `).run();
    db.query(`
        CREATE TABLE IF NOT EXISTS failedLoginAttempts 
        (id INTEGER PRIMARY KEY, userId INTEGER, failedAttempts INTEGER)
    `).run();
    db.query(`
        CREATE TABLE IF NOT EXISTS logs
        (id INTEGER PRIMARY KEY, userId INTEGER, ipAddress TEXT, route TEXT, message TEXT, timestamp TEXT)
    `).run();
    //Now create indexes for the tables
    db.query('CREATE INDEX IF NOT EXISTS userIdIndex ON logins (userId)').run();
    db.query('CREATE INDEX IF NOT EXISTS userIdIndex ON failedLoginAttempts (userId)').run();
    db.query('CREATE INDEX IF NOT EXISTS userIdIndex ON logs (userId)').run();
    db.query('CREATE INDEX IF NOT EXISTS ipAddressIndex ON logins (ipAddress)').run();
    db.query('CREATE INDEX IF NOT EXISTS ipAddressIndex ON logs (ipAddress)').run();
    db.query('CREATE INDEX IF NOT EXISTS routeIndex ON logs (route)').run();
    db.query('CREATE INDEX IF NOT EXISTS timestampIndex ON logs (timestamp)').run();
    db.query('CREATE INDEX IF NOT EXISTS timestampIndex ON logins (timestamp)').run();
})();

setInterval(() => {
    // Delete old logs default to 1 year
    const deleteOldLogs = parseInt(Bun.env.DELETE_OLD_LOGS || '0') || 365 * 24 * 60 * 60 * 1000;
    if (deleteOldLogs) {
        const deleteOldLogsQuery = db.query('DELETE FROM logs WHERE timestamp < ?');
        deleteOldLogsQuery.run(new Date(Date.now() - deleteOldLogs).toISOString());
    }
}, 24 * 60 * 60 * 1000);


class User {
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

    static async findByEmail(email: string): Promise<User | null> {
        const row: any = db.query('SELECT * FROM users WHERE email = ?').get(email);
        if (row) {
            return new User(row.id, row.email, row.isAdmin, row.firstName, row.lastName);
        }
        return null;
    }

    async getFailedLoginAttempts(): Promise<number> {
        const row: any = db.query('SELECT * FROM failedLoginAttempts WHERE userId = ?').get(this.id);
        if (row) {
            return row.failedAttempts;
        }
        return 0;
    }

    async incrementFailedLoginAttempts(): Promise<void> {
        const failedAttempts = await this.getFailedLoginAttempts();
        const updateQuery = db.query('UPDATE failedLoginAttempts SET failedAttempts = ? WHERE userId = ?');
        updateQuery.run(failedAttempts + 1, this.id);
    }

    async resetFailedLoginAttempts(): Promise<void> {
        const updateQuery = db.query('UPDATE failedLoginAttempts SET failedAttempts = ? WHERE userId = ?');
        updateQuery.run(0, this.id);
    }

    async insertLoginAttempt(ipAddress: string, success: boolean) {
        const insertQuery = db.query('INSERT INTO logins (userId, ipAddress, success, timestamp) VALUES (?, ?, ?, ?)');
        insertQuery.run(this.id, ipAddress, success, new Date().toISOString());
        if (success === false) {
            await this.incrementFailedLoginAttempts();
        } else {
            await this.resetFailedLoginAttempts();
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        const row: any = db.query('SELECT * FROM users WHERE id = ?').get(this.id);
        if (row) {
            return await Bun.password.verify(password, row.password);
        } else {
            return false;
        }
    }

    static async logRequest(req: express.Request) {
        const user = req.session.user;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        // const ipAddress = req.ip;
        const route = req.path;
        const message = req.method;
        const timestamp = new Date().toISOString();
        const insertQuery = db.query('INSERT INTO logs (userId, ipAddress, route, message, timestamp) VALUES (?, ?, ?, ?, ?)');
        insertQuery.run(user?.id, ipAddress, route, message, timestamp);
    }

}
export default User;