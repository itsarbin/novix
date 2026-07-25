import express from 'express';
import morgan from 'morgan';
import {v7 as uuid} from 'uuid';
import {createPod} from './kubernetes/pod.js';
import {createService} from './kubernetes/service.js';

const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/sandbox/healthz', (req,res)=>{
    res.status(200).json({
        message:'Sandbox API is healthy',
        status:'ok'
    })
})

app.get('/api/sandbox/hello', (req,res)=>{
    res.status(200).json({
        message:'Hello from Sandbox API',
        status:'ok'
    })
})

app.post('/api/sandbox/start', async (req,res)=>{
  
   try{ const sandboxId = uuid();

    await Promise.all([
        createPod(sandboxId),
        createService(sandboxId)
    ]);

    return res.status(200).json({
        message:'Sandbox started successfully',
        sandboxId:sandboxId,    
        previewUrl:`http://${sandboxId}.preview.localhost`
    })}catch(err){
        console.error(err);
        return res.status(500).json({
            message:'Failed to start sandbox',
            error:err.message
        })
   }
})


export default app;