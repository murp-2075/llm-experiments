import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const chat = async function(messages: any): Promise <OpenAI.Chat.Completions.ChatCompletionMessage> {
    //If name is empty, delete the property, OpenAI hates extra strings
    messages.forEach((message: any) => {
        if (message.name === '') {
            delete message.name;
        }
    });
    console.log("about to send, ", messages)
    const chatCompletion = await openai.chat.completions.create({
        messages,
        // model: 'gpt-4-1106-preview',
        model: 'gpt-3.5-turbo-1106',
    });
    return chatCompletion.choices[0].message;
}

export default chat;