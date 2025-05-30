import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

const protectRoute = async (req, res, next) => {
    try {
        //get token
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({message: "Access denied!"});

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user = await User.findById(decode.userId).select("-password");
        if (!user) return res.status(401).json({message: "Invalid authentication."});

        req.user = user;
        next();
    } catch (error) {
        console.log("error in protect route middleware route", error);
        res.status(500).json({message: error.message});
    }
};

export default protectRoute;