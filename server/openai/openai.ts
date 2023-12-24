import OpenAI from 'openai';
// import { CHAIN_OF_DENSITY, EVALUATION_OF_SUMMARY } from './templates_key';
import { CHAIN_OF_DENSITY, EVALUATION_OF_SUMMARY } from './templates_convo';
import { ChatCompletionMessageToolCall, ChatCompletionTool } from 'openai/resources/index.mjs';
import moby from './texts/moby_short.txt'
// import moby from './texts/moby1.txt'
// import moby from './texts/nuclear.txt'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "handle_summary_result",
            description: "Handle the result of a summary",
            parameters: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: "The summary of the article"
                    }
                },
                required: ["summary"],
            },
        }
    },
    {
        type: "function",
        function: {
            name: "handle_evaluation_result",
            description: "Handle the result of an evaluation",
            parameters: {
                type: "object",
                properties: {
                    informative: {
                        type: "number",
                        description: "The informativeness of the summary",
                    },
                    quality: {
                        type: "number",
                        description: "The quality of the summary",
                    },
                    coherence: {
                        type: "number",
                        description: "The coherence of the summary",
                    },
                    attributable: {
                        type: "number",
                        description: "The attributability of the summary",
                    },
                    keyphrases: {
                        type: "number",
                        description: "The inclusion of keyphrases in the summary",
                    },
                    keyphrase_examples: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: "An array of keyphrases",
                    },
                    overall_preference: {
                        type: "number",
                        description: "The overall preference of the summary",
                    },
                },
                required: ["informative", "quality", "coherence", "attributable", "keyphrases", "keyphrase_examples", "overall_preference"],
            },
        },
    }
];

function get_function_and_args(tool_call: ChatCompletionMessageToolCall) {
    const func = tool_call?.function;
    const functionName = func?.name;
    const functionArgs = JSON.parse(func?.arguments || '{}');
    return [functionName, functionArgs];
}

async function main() {
    const text = CHAIN_OF_DENSITY(moby);
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        // messages: [{ role: 'user', content: "Give me asummary of 'the cat jumped over the moon'" }],
        model: 'gpt-4-1106-preview',
        // tools: [tools[0]],
    });
    console.log(chatCompletion.choices[0].message.content)
    process.exit(0)
    const choice = chatCompletion?.choices[0];
    const tool_call = choice?.message?.tool_calls?.[0];
    const [functionName, functionArgs] = get_function_and_args(tool_call as ChatCompletionMessageToolCall);
    // const func = tool_call?.function;
    // const functionName = func?.name;
    // const functionArgs = JSON.parse(func?.arguments || '{}');
    console.log(functionName)
    console.log(functionArgs);
    const evaluationText = EVALUATION_OF_SUMMARY(moby, functionArgs.summary);
    const chatCompletion2 = await openai.chat.completions.create({
        messages: [{ role: 'user', content: evaluationText }],
        // messages: [{ role: 'user', content: "Give me a summary of 'the cat jumped over the moon'" }],
        model: 'gpt-4-1106-preview',
        tools: [tools[1]],
    });
    const choice2 = chatCompletion2?.choices[0];
    const tool_call2 = choice2?.message?.tool_calls?.[0];
    const [functionName2, functionArgs2] = get_function_and_args(tool_call2 as ChatCompletionMessageToolCall);
    console.log(functionName2)
    console.log(functionArgs2);

}

setTimeout(main, 100);
// main();