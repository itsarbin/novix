import {Router} from "express";
import passport from "passport";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {sendAuthNotification} from "../config/mq.js"

const authRouter = Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        let user = await User.findOne({ googleId: id });

        await sendAuthNotification({
            userId: user ? user._id : null,
            action: 'google_login',
            email: emails[0].value,
            timestamp: new Date()
        })
        if (!user) {
            user = await User.create({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });

        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while processing the request.");
    }
});

export default authRouter;