import {Router} from 'express';
import agent from '../agents/code.agent.js';

const agentRouter = Router()

agentRouter.post('/invoke',async (req,res)=>{
    const {message}= req.body;
    try{
        const response = await agent.invoke({
            messages: [
                {
                    role: 'user',
                    content: message,
                }
            ]
        });
        res.status(200).json({
            message: 'Agent invoked successfully',
            response,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error invoking agent',
            error: error.message,
        });
    }
})

export default agentRouter;