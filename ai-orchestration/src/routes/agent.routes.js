import { Router } from "express";
import { agent } from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    if (!message) {
        return res.status(400).json({
            status: "error",
            message: "Message is required",
        });
    }

    if (!projectId) {
        return res.status(400).json({
            status: "error",
            message: "Project ID is required",
        });
    }

    // -----------------------------
    // SSE headers
    // -----------------------------

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    // -----------------------------
    // Writer
    // -----------------------------

    const writer = (message) => {
        res.write(`data: ${message}\n\n`);
    };

    try {
        // -----------------------------
        // Run the agent
        // -----------------------------

        const stream = await agent.stream(
            {
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            },
            {
                context: {
                    projectId,
                    writer,
                },
                streamMode: "custom",
            }
        );

        // -----------------------------
        // Stream agent output
        // -----------------------------

        for await (const chunk of stream) {
            console.log("=====================================");
            console.log("chunk from agent stream:", chunk);
            console.log("=====================================");

            writer(chunk);
        }

        // -----------------------------
        // Agent finished
        // -----------------------------

        writer("Done!");

        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);

        // If SSE has already started,
        // don't try to send a second JSON response.
        if (res.headersSent) {
            res.end();
        } else {
            res.status(500).json({
                status: "error",
                message: "Failed to invoke agent",
            });
        }
    }
});

export default agentRouter;