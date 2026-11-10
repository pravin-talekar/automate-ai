import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
dotenv.config()
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import agentRouter from './routes/agent.routes.js';
import chatRouter from './routes/chat.route.js';
import { getMcpTools } from './mcp/langgraph-mcp.js';

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));

const allowedOrigins = [
    "http://localhost:5173",
    "https://automate-ai-client.onrender.com"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);
app.use("/api/chat", chatRouter);


app.listen(port, () => {
    connectDB()
    console.log(`server listening on ${port}`);
})