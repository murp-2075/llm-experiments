import db from "../utils/db";
import fs from 'fs';

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

    const createQuery3 = db.query(`CREATE TABLE IF NOT EXISTS audioFiles
        (id INTEGER PRIMARY KEY, messageId INTEGER, filePath string, createdAt TEXT)
    `);
    createQuery3.run();
    const indexQuery3 = db.query(`
        CREATE INDEX IF NOT EXISTS messageId_index ON audioFiles (messageId)
    `);
    indexQuery3.run();

})();


class AudioFiles {
    // Constructor for AudioFiles model
    public id: number;
    public messageId: number;
    public filePath: string;
    public createdAt: string;

    constructor(id: number, messageId: number, filePath: string, createdAt: string) {
        this.id = id;
        this.messageId = messageId;
        this.filePath = filePath;
        this.createdAt = createdAt;
    }

    // Method to find a message by ID
    static getAudioFilesByMessageId(messageId: number) {
        const sql = db.query('SELECT * FROM audioFiles WHERE messageId = ? order by id');
        const row: any = sql.all(messageId)
        const audioFiles: AudioFiles[] = [];
        row.forEach((row: any) => {
            audioFiles.push(new AudioFiles(row.id, row.messageId, row.filePath, row.createdAt));
        })
        return audioFiles;
    }

    static getAudioFileById(id: number) {
        const sql = db.query('SELECT * FROM audioFiles WHERE id = ?');
        const row: any = sql.get(id)
        return new AudioFiles(row.id, row.messageId, row.filePath, row.createdAt);
    }

    static addAudioFile(messageId: number, filePath: string) {
        const sql = db.query('INSERT INTO audioFiles (messageId, filePath, createdAt) VALUES (?, ?, ?)');
        const date = new Date();
        const createdAt = date.toISOString();
        sql.run(messageId, filePath, createdAt);
        //Return the id of the audioFile
        const lastIDSQL = db.query('SELECT last_insert_rowid() as lastID');
        const lastIDRow: any = lastIDSQL.get();
        const audioFileId = lastIDRow.lastID;
        const audioFile = new AudioFiles(audioFileId, messageId, filePath, createdAt);
        // console.log("audioFileId added", audioFile)
        return audioFile;
    }

    static deleteAudioFileByMessageId(messageId: number) {
        //get the audioFile
        try {
            // console.log("trying to delete audioFile for messageId", messageId)
            const audioFile = AudioFiles.getAudioFilesByMessageId(messageId);
            // console.log("audioFile", audioFile)
            //Loop through audioFiles and delete them
            audioFile.forEach((audioFile: any) => {
                // console.log("deleting audioFile", audioFile)
                fs.unlinkSync(audioFile.filePath);
            });
            //delete the audioFile
            //delete the row in the database
            const sql = db.query('DELETE FROM audioFiles WHERE messageId = ?');
            sql.run(messageId);
        } catch (err) {
            // console.log("error deleting audioFile", err)
            //do nothing
        }
    }
}

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

    static getMessageById(id: number) {
        if (!id) {
            return null;
        }
        const sql = db.query('SELECT * FROM messages WHERE id = ?');
        const row: any = sql.get(id)
        return new Message(row.id, row.threadId, row.role, row.content, row.name, row.createdAt);
    }

    static addMessage(threadId: number, role: string, content: string, name: string): Message {
        const sql = db.query('INSERT INTO messages (threadId, role, content, name, createdAt) VALUES (?, ?, ?, ?, ?)');
        const date = new Date();
        const createdAt = date.toISOString();
        sql.run(threadId, role, content, name, createdAt);
        //get last inserted row id
        const lastIDSQL = db.query('SELECT last_insert_rowid() as lastID');
        const lastIDRow: any = lastIDSQL.get();
        const messageId = lastIDRow.lastID;
        return new Message(messageId, threadId, role, content, name, createdAt);
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
        //get All audioFiles for messages in thread
        const messages = Message.getMessagesByThreadId(id);
        //delete audioFiles
        // console.log("deleteing messages", messages)
        messages.forEach((message: any) => {
            AudioFiles.deleteAudioFileByMessageId(message.id);
        });

        const messageSql = db.query('DELETE FROM messages WHERE threadId = ?');
        messageSql.run(id);
        const threadSql = db.query('DELETE FROM threads WHERE id = ?');
        threadSql.run(id);
    }

}

export { AudioFiles, Message, Thread };
