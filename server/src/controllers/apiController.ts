import { Request, Response } from 'express';
import { chatAsync, getChatTitle, transcribeAudio, getTTS } from '../utils/openai';
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
        const audioFileId = Number(req.params.audioFileId);
        const audioFile = AudioFiles.getAudioFileById(audioFileId);
        if (!audioFile) {
            res.status(404).send('Audio file not found');
            return;
        }
        const message = Message.getMessageById(audioFile.messageId);
        if (!message) {
            res.status(404).send('Message not found');
            return;
        }
        const thread = Thread.getThreadById(message.threadId);
        if (!req.session.user || thread.userId !== req.session.user.id) {
            res.status(403).send('Forbidden');
            return;
        }
        // res.set('Content-Type', 'audio/mpeg');
        res.set('Content-Type', 'audio/aac');

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

    static async deleteMessage(req: Request, res: Response) {
        const messageId = Number(req.body.messageId);
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
        Message.deleteMessage(messageId);
        res.status(204).send();
    }

    private static async processMessage(threadId: number, role: string, content: string, name: string, speakResponses: boolean, req: Request, res: Response) {
        // console.time('processMessage')
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
        const userMessages: ChatCompletionMessageParam[] = [...cleanedMessages, { role, content, name }];
        const userMessage = Message.addMessage(threadId, role, content, '');
        // console.time("chat")
        const chatResponseStream = await chatAsync(userMessages);
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        res.write(JSON.stringify({ data: { userMessageId: userMessage.id } }) + '\n\n');

        const assisstantMessage = Message.addMessage(threadId, 'assistant', '', '');

        let assisstantMessageText: string = '';
        for await (const chunk of chatResponseStream) {
            const obj = { data: { id: assisstantMessage.id, c: chunk.choices[0]?.delta?.content || '' } }
            res.write(JSON.stringify(obj) + '\n');
            // process.stdout.write(chunk.choices[0]?.delta?.content || '' + "\n");
            assisstantMessageText += chunk.choices[0]?.delta?.content || ''
        }
        Message.updateMessage(assisstantMessage.id, 'assistant', assisstantMessageText);
        res.end();
        // console.timeEnd("chat")
        // console.log("assisstantMessageText", assisstantMessageText)
    }

    static async createMessage(req: Request, res: Response) {
        const { threadId, role, content, name, speakResponses } = req.body;
        await APIController.processMessage(Number(threadId), role, content, name, !!speakResponses, req, res);
        return;
    }

    static async updateMessage(req: Request, res: Response) {
        const { messageId, content } = req.body;
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
        Message.updateMessage(messageId, message.role, content);
        message.content = content;
        res.json(message);
    }

    static async transcribeAudio(req: Request, res: Response) {
        let content: any = req.file;
        const transcription: any = await transcribeAudio(content);
        res.json(transcription);
    }

    // static async createMessageFromAudio(req: Request, res: Response) {
    //     const { threadId, role, name, speakResponses } = req.body;
    //     let content: any = req.file;
    //     const transcription: any = await transcribeAudio(content);
    //     content = transcription.text;
    //     req.body.content = transcription;
    //     await APIController.processMessage(Number(threadId), role, content, name, !!speakResponses, req, res);
    // }

    static async getAudioFileIdsFromMessage(req: Request, res: Response) {
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
        const audioFiles = AudioFiles.getAudioFilesByMessageId(messageId);
        if (audioFiles.length === 0) {
            //create the audio files
            const audioFiles = await getTTS(message.content);
            // console.log("mp3Files", audioFiles)
            const audioFilesIds: number[] = [];
            for (let i = 0; i < audioFiles.length; i++) {
                const audioFile = audioFiles[i];
                // console.log("About to add audioFile with mesasge id ", message.id, "and mp3File", audioFile, "to database")
                const audioFileInstance = AudioFiles.addAudioFile(message.id, audioFile);
                // console.log("audioFile id", audioFileInstance.id)
                audioFilesIds.push(audioFileInstance.id);
            }
            return res.json(audioFilesIds);
        }
        const audioFileIds = audioFiles.map(audioFile => audioFile.id);
        res.json(audioFileIds);
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
        // console.log("thread renmaed as: ", thread)
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