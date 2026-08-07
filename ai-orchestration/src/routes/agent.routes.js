import { Router } from "express"
import { agent } from "../agents/code.agent.js"

const agentRouter = Router()

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message, projectId } = req.body


        if (!message) {
            return res.status(400).json({
                status: "error",
                message: "Message is required"
            })
        }
        if (!projectId) {
            return res.status(400).json({
                status: "error",
                message: "Project ID is required"
            })
        }


        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

       

        res.flushHeaders(); // Send the headers now and keep the connection open

        const writer = (message) => {
            res.write(`data: ${message}`)
        }


        const stream = await agent.stream(
            {
                messages: [
                    {
                        role: "user",
                        content: message
                    }

                ]
            },
            {
                context: {
                    projectId
                },
                streamMode: "custom"
            }
        )

        for await (const chunk of stream) {
            console.log("=====================================");
            console.log("chunk from agent stream", chunk);
            writer(`data: ${chunk}\n\n`);
            console.log("=====================================");
        }

        writer("Done!")
        res.end()

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to invoke agent",
            error: err.message
        })
    }
})

export default agentRouter