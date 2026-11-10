import { app } from "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
    try{
        const {token: firebaseToken} = req.body;
        if(!firebaseToken){
            return res.status(400).json({
                message: "token not found"
            });
        }

        const decoded = await getAuth(app).verifyIdToken(firebaseToken);

        const user = await User.findOneAndUpdate(
            {firebaseUid: decoded.uid},
            {
                $set: {
                    name: decoded.name,
                    email: decoded.email,
                    profilePicture: decoded.picture
                },
                $setOnInsert: {
                    firebaseUid: decoded.uid
                }
            },
            {
                upsert: true,
                returnDocument: "after"
            }
        );

        const token = jwt.sign(
            {userId: user._id}, 
            process.env.JWT_SECRET, 
            {expiresIn: "7d"}
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7*24*60*60*1000,
            path: "/"
        });

        res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            message: `login error ${error}`
        });
    }
}

// export const logout = async (req, res) => {
//     try{
//         res.clearCookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "strict",
//             maxAge: 7*24*60*60*1000
//         });

//         return res.status(200).json({
//             message: "logout successfuly"
//         });
//     }catch(error){
//         return res.status(200).json({
//             message: `logout error ${error}`
//         });
//     }
// }


export const logout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/"
        });

        return res.status(200).json({
            message: "Logout successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Logout failed"
        });
    }
};


export const me = async (req, res) => {
    try{
        const user = req.user;

        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            message: `me error ${error}`
        });
    }
}