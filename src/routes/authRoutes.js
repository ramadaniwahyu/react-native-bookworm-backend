import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});
}

router.post("/register", async (req, res) => {
    try {
        const {email, username, password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({message: "All field is required!"})
        }

        if(password.length < 6) {
            return res.status(400).json({message: "Password should be at least 6 characters long."})
        }

        if(username.length < 3) {
            return res.status(400).json({message: "Username should be at least 3 characters long."})
        }

        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({message: "Email already exists"})
        }
        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res.status(400).json({message: "Username already exists"})
        }

        const profileImage = `https://robohash.org/${username}`;

        const user = new User({
            email, password, username, profileImage
        });

        await user.save();

        const accesstoken = generateToken(user._id);
        
        res.status(201).json({
            token: accesstoken,
            user: {
                id : user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });

    } catch (error) {
        console.log("error in register route", error);
        res.status(500).json({message: error.message});
    }
});

router.post("/login", async  (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({message: "All fields are required."});

        //check user if exist
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: "User does not exist."})

        //check password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials."});

        const accesstoken = generateToken(user._id);
        
        res.status(200).json({
            token: accesstoken,
            user: {
                id : user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.log("error in login route", error);
        res.status(500).json({message: error.message});
    }
});

export default router;