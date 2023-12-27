import { Request, Response } from 'express';
import chat, { getChatTitle, transcribeAudio, getTTS } from '../utils/openai';
import { Thread, Message, AudioFiles } from '../models/openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import fs from 'fs';

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

    public static async getAudioFile(req: Request, res: Response) {
        const messageId = Number(req.params.messageId);
        const message = Message.getMessageById(messageId);
        if (!message) {
            res.status(404).send('Message not found');
            return;
        }
        const thread = Thread.getThreadById(message.threadId);
        if (!req.session.user || thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        const audioFile = AudioFiles.getAudioFileByMessageId(messageId);
        if (!audioFile) {
            res.status(404).send('Audio file not found');
            return;
        }
        res.set('Content-Type', 'audio/mpeg');

        // Stream file to client
        const filePath = audioFile.filePath;
        const readStream = fs.createReadStream(filePath);

        // Pipe the read stream to the response
        readStream.on('open', function () {
            readStream.pipe(res);
        });

        // Handle errors during streaming
        readStream.on('error', function (err) {
            res.status(500).send('Error streaming the file');
        });

    }

    private static async processMessage(threadId: number, role: string, content: string, name: string, speakResponses: boolean, req: Request, res: Response) {
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
        const cleanedMessages = messages.map(({ role, content, name }) => ({ role, content, name }));
        const newMessages: ChatCompletionMessageParam[] = [...cleanedMessages, { role, content, name }];
        const chatResponse = await chat(newMessages);
        const newMessage = Message.addMessage(threadId, role, content, '');
        Message.addMessage(threadId, chatResponse.role, chatResponse.content as string, '');
        const returnObject = {
            audioMessage: { id: 0, hasFile: false },
            messages: [
                { role, content, name: '' },
                { role: chatResponse.role, content: chatResponse.content, name: '' }]
        }
        if (speakResponses) {
            const buffer = await getTTS(chatResponse.content as string);
            AudioFiles.addAudioFile(newMessage.id, buffer);
            returnObject.audioMessage.hasFile = true;
            returnObject.audioMessage.id = newMessage.id;
        }
        res.json(returnObject);
    }

    static async createMessage(req: Request, res: Response) {
        const { threadId, role, content, name, speakResponses } = req.body;
        await APIController.processMessage(Number(threadId), role, content, name, !!speakResponses, req, res);
        return;
    }

    static async createMessageFromAudio(req: Request, res: Response) {
        const { threadId, role, name, speakResponses } = req.body;
        let content: any = req.file;
        const transcription: any = await transcribeAudio(content);
        content = transcription.text;
        req.body.content = transcription;
        await APIController.processMessage(Number(threadId), role, content, name, !!speakResponses, req, res);
    }

    static async autoNameThread(req: Request, res: Response) {
        if (!req.session.user) {
            res.status(403).send('Forbidden');
            return;
        }
        const threadId = Number(req.query.threadId); // Convert threadId to number
        const thread = Thread.getThreadById(threadId);
        if (!thread) {
            res.status(404).send('Thread not found');
            return;
        }
        if (thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        const messages = Message.getMessagesByThreadId(threadId);
        const cleanedMessages = messages.map(({ role, content, name }) => ({ role, content, name }));
        const newMessages: ChatCompletionMessageParam[] = [...cleanedMessages as ChatCompletionMessageParam[]];
        const chatResponse = await getChatTitle(newMessages);
        Thread.updateThread(threadId, chatResponse);
        thread.title = chatResponse;
        res.json(thread);
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
        thread.title = title;
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