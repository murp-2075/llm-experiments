import { Request, Response } from 'express';
import chat from '../utils/openai';
import { Thread, Message } from '../models/openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

class APIController {

    static async getMessages(req: Request, res: Response) {
        try {
            const threadId = Number(req.query.threadId); // Convert threadId to number
            const thread = Thread.getThreadById(threadId);
            if (!thread) {
                res.status(404).send('Thread not found');
                return;
            }
            if (!req.session.user || thread.userId !== req.session.user.id) {
                res.status(403).send('Forbidden');
                return;
            }
            const messages = Message.getMessagesByThreadId(threadId);
            res.json(messages);
        } catch (err) {
            console.log(err)
        }
    }

    static async createMessage(req: Request, res: Response) {
        //get threadId, role, content from json post request
        const threadId = Number(req.body.threadId);
        const thread = Thread.getThreadById(threadId);
        if (!thread) {
            res.status(404).send('Thread not found');
            return;
        }
        if (!req.session.user || thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        const role = req.body.role;
        const content = req.body.content;
        const name = req.body.name;
        const messages = Message.getMessagesByThreadId(threadId)
        const cleanedMessages = messages.map(({ role, content, name }) => ({ role, content, name }));
        const newMessages: ChatCompletionMessageParam[] = [...cleanedMessages as ChatCompletionMessageParam[], { role, content, name }];
        const chatResponse = await chat(newMessages);
        newMessages.push({ role, content, name: '' });
        Message.addMessage(threadId, role, content, '');
        Message.addMessage(threadId, chatResponse.role, chatResponse.content as string, '');
        res.json([
            { role, content, name: '' },
            { role: chatResponse.role, content: chatResponse.content, name: '' }]);
    }

    static async getThreads(req: Request, res: Response) {
        try {
            if (!req.session.user) {
                res.status(403).send('Forbidden');
                return;
            }
            const threads = Thread.getThreadsByUserId(req.session.user.id);
            res.json(threads);
        } catch (err) {
            console.log(err)
        }
    }

    static async createThread(req: Request, res: Response) {
        if (!req.session.user) {
            res.status(403).send('Forbidden');
            return;
        }
        const title = req.body.title;
        const thread = Thread.addThread(req.session.user.id, title);
        res.json(thread);
    }

    static async updateThread(req: Request, res: Response) {
        if (!req.session.user) {
            res.status(403).send('Forbidden');
            return;
        }
        const threadId = Number(req.body.threadId);
        const thread = Thread.getThreadById(threadId);
        if (!thread) {
            res.status(404).send('Thread not found');
            return;
        }
        if (thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        const title = req.body.title;
        Thread.updateThread(threadId, title);
        res.json(thread);
    }

    static async deleteThread(req: Request, res: Response) {
        if (!req.session.user) {
            res.status(403).send('Forbidden');
            return;
        }
        const threadId = Number(req.body.threadId);
        const thread = Thread.getThreadById(threadId);
        if (!thread) {
            res.status(404).send('Thread not found');
            return;
        }
        if (thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        Thread.deleteThread(threadId);
        res.status(204).send();
    }

    static async getUser(req: Request, res: Response) {
        if (!req.session.user) {
            res.status(403).send('Forbidden');
            return;
        }
        res.json(req.session.user);
    }
}



export default APIController;