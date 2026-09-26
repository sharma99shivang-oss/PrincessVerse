import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        coupleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Couple",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            trim: true,
            default: "",
        },

        media: {
            url: String,
            type: {
                type: String,
                enum: ["image", "video", "audio"],
            },
            duration: Number,
        },

        seen: {
            type: Boolean,
            default: false,
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        deletedForEveryone: {
            type: Boolean,
            default: false,
        },
        // ✅ Auto delete after 24 hours
        expireAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
            expires: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);