import OpenAI from 'openai';
import { ChatCompletionTool } from 'openai/resources/index.mjs';
import { chunkText } from './textUtils';
import { Stream } from 'openai/streaming.mjs';

const model = 'gpt-4-1106-preview'
// const model = 'gpt-3.5-turbo-1106'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const chat = async function (messages: any): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    //If name is empty, delete the property, OpenAI hates extra strings
    messages.forEach((message: any) => {
        if (message.name === '' || message.content === '') {
            delete message.name;
        }
    });
    const chatCompletion = await openai.chat.completions.create({
        messages,
        model,
    });
    return chatCompletion.choices[0].message;
}

const chatAsync = async function (messages: any): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    //If name is empty, delete the property, OpenAI hates extra strings
    messages.forEach((message: any) => {
        if (message.name === '' || message.content === '') {
            delete message.name;
        }
    });
    const stream = await openai.chat.completions.create({
        messages,
        model,
        stream: true
    });
    return stream;
}

const getChatTitle = async function (messages: any): Promise<string> {
    const tools: ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "handle_chat_title",
                description: "A fun short sentence title, can even be a few words.",
                parameters: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "The title of the chat",
                        }
                    },
                    required: ["title"],
                },
            }
        }]
    messages.forEach((message: any) => {
        if (message.name === '') {
            delete message.name;
        }
    });
    
    const chatCompletion = await openai.chat.completions.create({
        messages,
        model,
        tools,
        tool_choice: {"type": "function", "function": {"name": "handle_chat_title"}}
    });
    const tool_call = chatCompletion.choices[0]?.message?.tool_calls?.[0];
    const results = JSON.parse(tool_call?.function?.arguments || '{}');
    console.log("tool_call", tool_call)
    console.log("results", results)
    return results.title;
    // return chatCompletion.choices[0].message;
}

const createGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line no-mixed-operators
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}

const getTTS = async function (text: string): Promise<string[]> {
    // const texts = chunkText(text, 1024);
    const texts = chunkText(text, 3072);
    const ttsPromises: Promise<any>[] = [];

    texts.forEach(async (text) => {
        ttsPromises.push(openai.audio.speech.create({
            model: "tts-1-hd",
            // voice: "nova",
            voice: "onyx",
            input: text,
            response_format: "aac"
        }));
    })
    const mp3s = await Promise.all(ttsPromises);
    const speechFiles: string[] = [];
    for (let i = 0; i < mp3s.length; i++) {
        const mp3 = mp3s[i];
        // const speechFile = `./audioFiles/${createGuid()}.mp3`
        const speechFile = `./audioFiles/${createGuid()}.aac`
        const buffer = Buffer.from(await mp3.arrayBuffer());
        console.log("buffer size", buffer.length)
        await fs.promises.writeFile(speechFile, buffer);
        console.log("speechFile", speechFile)
        speechFiles.push(speechFile);
    }
    return speechFiles;
}

// const { Readable } = require('stream');
// function bufferToStream(buffer: any) {
//     const stream = new Readable();
//     stream.push(buffer);
//     stream.push(null); // Signifies the end of the stream
//     return stream;
// }


const checkFileReady = (filePath: string, maxAttempts = 10, interval = 300) => {
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            fs.access(filePath, fs.constants.R_OK, (err) => {
                attempts++;
                if (!err) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('File not ready within time limit'));
                }
                // Otherwise, the loop will continue
            });
        }, interval);
    });
};

import fs from 'fs';
import path from 'path';
import os from 'os';
const transcribeAudio = async function (audio: any, format = 'mp3') {
    // const fileStream = bufferToStream(audio.buffer);

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, audio.originalname);

    // Write the buffer to a temporary file
    return new Promise((resolve, reject) => {
        fs.writeFile(tempFilePath, audio.buffer, async (err) => {
            await checkFileReady(tempFilePath);
            if (err) {
                console.error(err);
                return reject(err);
            }
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1"
            });
            resolve(transcription);
        })
    })
}

export { chat, chatAsync, getChatTitle, transcribeAudio, getTTS };

export default chat;