import "dotenv/config"
import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";


import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use(passport.initialize());

app.get("/status/healthz", (req, res) => {
    res.status(200).json({ status: "OK" });
});

passport.use( new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // Handle the user profile and authentication logic here
    done(null, profile);
}));

export default app;

