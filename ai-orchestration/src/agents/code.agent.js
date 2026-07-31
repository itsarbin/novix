import "dotenv/config";
import {ChatMistralAI} from '@langchain/mistralai';
import {listFiles, readFiles, updateFiles} from './tool.js';
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apikey: process.env.MISTRAL_API_KEY,
})

const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updateFiles]
})

await agent.invoke({
    messages: [
        {
            role: 'user',
            content: "Read src/App.jsx, src/App.css, and src/index.css, then replace the current page with a minimal responsive calculator built using only React, vanilla JavaScript, and CSS (no external libraries or npm packages), supporting digits 0-9, +, -, ×, ÷, ., =, AC, and backspace, while modifying only the necessary files."
        }
    ]
})
    