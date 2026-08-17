import express from "express";
import morgan from "morgan";
import { sendEmail } from "./email.js"
import channel from './mq.js'

const app = express();
app.use(morgan("dev"));

app.get('/status/healthz',(req,res) => {
    res.status(200).json({
        status: 'ok',
        message: 'notification server'
    })
})

channel.consume('auth_notification_queue', async(msg)=>{
    if(msg != null){
        const messageContent = msg.content.toString();

        console.log('recived message from queue:', messageContent)

        try{
            const {uerId, action , email, timestamp} = JSON.parse(messageContent)

            const subject = 'New Login Notification'
            const text = `A new login was detected for your account at ${timestamp}. If this was  not you, please secure your account immdietly`
            const html = `<p> A new login was detected for your account at ${timestamp}. If this was  not you, please secure your account immdietly <p>`

            await sendEmail(email, subject, text ,html)
            channel.ack(msg)
        }catch (err) {
            console.error('error processing message:', error)
        }
    }else {
        console.log('recived null message')
    }
})


export default app;