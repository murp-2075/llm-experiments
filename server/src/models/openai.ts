import db from "../utils/db";

(() => {
    const createQuery = db.query(`
    CREATE TABLE IF NOT EXISTS threads 
        (id INTEGER PRIMARY KEY, userId INTEGER, title TEXT, createdAt TEXT, updatedAt TEXT)
    `);
    createQuery.run();
    //create index on userId
    const indexQuery = db.query(`
        CREATE INDEX IF NOT EXISTS userId_index ON threads (userId)
    `);
    indexQuery.run();
    const createQuery2 = db.query(`CREATE TABLE IF NOT EXISTS messages 
        (id INTEGER PRIMARY KEY, threadId INTEGER, role TEXT, name TEXT, content TEXT, createdAt TEXT)
    `);
    createQuery2.run();
    //create index on threadId
    const indexQuery2 = db.query(`
        CREATE INDEX IF NOT EXISTS threadId_index ON messages (threadId)
    `);
    indexQuery2.run();
})();

class Message {
    // Constructor for Message model
    public id: number;
    public threadId: number;
    public role: string;
    public content: string;
    public name: string;
    public createdAt: string;

    constructor(id: number, threadId: number, role: string, content: string, name: string, createdAt: string) {
        this.id = id;
        this.threadId = threadId;
        this.role = role;
        this.content = content;
        this.name = name;
        this.createdAt = createdAt;
    }

    // Method to find a message by ID
    static getMessagesByThreadId(threadId: number) {
        //select messages order by id, in order
        const sql = db.query('SELECT * FROM messages WHERE threadId = ? order by id');
        const row: any = sql.all(threadId)
        const messages: Message[] = [];
        row.forEach((row: any) => {
            messages.push(new Message(row.id, row.threadId, row.role, row.content, row.name, row.createdAt));
        })
        return messages;
    }

    static addMessage(threadId: number, role: string, content: string, name: string) {
        const sql = db.query('INSERT INTO messages (threadId, role, content, name, createdAt) VALUES (?, ?, ?, ?, ?)');
        const date = new Date();
        const createdAt = date.toISOString();
        sql.run(threadId, role, content, name, createdAt);
    }

    static updateMessage(id: number, role: string, content: string) {
        const sql = db.query('UPDATE messages SET role = ?, content = ? WHERE id = ?');
        const date = new Date();
        const updatedAt = date.toISOString();
        sql.run(role, content, id);
    }

    static deleteMessage(id: number) {
        const sql = db.query('DELETE FROM messages WHERE id = ?');
        sql.run(id);
    }

}

class Thread {
    // Constructor for Thread model
    public id: number;
    public userId: number;
    public title: string;
    public createdAt: string;
    public updatedAt: string;

    constructor(id: number, userId: number, title: string, createdAt: string, updatedAt: string) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Method to find a thread by ID
    static getThreadsByUserId(userId: number) {
        const threads: Thread[] = [];
        const sql = db.query('SELECT * FROM threads WHERE userId = ? order by updatedAt DESC');
        const row: any = sql.all(userId)
        row.forEach((row: any) => {
            threads.push(new Thread(row.id, row.userId, row.title, row.createdAt, row.updatedAt));
        })
        return threads;
    }

    static getThreadById(id: number) {
        const sql = db.query('SELECT * FROM threads WHERE id = ?');
        const row: any = sql.get(id)
        return new Thread(row.id, row.userId, row.title, row.createdAt, row.updatedAt);
    }

    static addThread(userId: number, title: string): Thread {
        const sql = db.query('INSERT INTO threads (userId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)');
        const date = new Date();
        const createdAt = date.toISOString();
        const updatedAt = date.toISOString();
        sql.run(userId, title, createdAt, updatedAt);
        const lastIDSQL = db.query('SELECT last_insert_rowid() as lastID');
        const lastIDRow: any = lastIDSQL.get();
        const threadId = lastIDRow.lastID; 
        return new Thread(threadId, userId, title, createdAt, updatedAt);
    }

    static updateThread(id: number, title: string) {
        const date = new Date();
        const updatedAt = date.toISOString();
        if (title == null) {
            const sql = db.query('UPDATE threads SET updatedAt = ? WHERE id = ?');
            sql.run(updatedAt, id);
        } else {
            const sql = db.query('UPDATE threads SET title = ?, updatedAt = ? WHERE id = ?');
            sql.run(title, updatedAt, id);
        }
    }

    static deleteThread(id: number) {
        const messageSql = db.query('DELETE FROM messages WHERE threadId = ?');
        messageSql.run(id);
        const threadSql = db.query('DELETE FROM threads WHERE id = ?');
        threadSql.run(id);
    }

}

export { Message, Thread };
