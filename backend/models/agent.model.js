import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    knowledgeBase: {
        type: String,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    tools: [
        {
            type: String,
            trim: true
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;