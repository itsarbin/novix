import express from 'express';
import morgan from 'morgan';

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


export default app;