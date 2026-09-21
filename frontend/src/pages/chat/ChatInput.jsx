import { useRef, useState } from "react";
import { Send, Mic, Image, Smile, Camera } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import client from "../../api/client";
import { useChat } from "../../context/ChatContext";
export default function ChatInput({ onSend }) {
    const [text, setText] = useState("");
    const { startTyping, stopTyping } = useChat();
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);

    const galleryRef = useRef(null);
    const cameraRef = useRef(null);

    // ===== Send Text =====
    const submit = (e) => {
        e.preventDefault();

        if (!text.trim()) return;

        onSend({
            text: text.trim(),
            media: null,
        });

        stopTyping();      // 👈 typing stop
        setText("");
        setShowEmoji(false);
    };

    // ===== Emoji =====
    const addEmoji = (emojiData) => {
        const newText = text + emojiData.emoji;
        setText(newText);

        if (newText.trim()) {
            startTyping();
        }
    };

    // ===== Upload Image / Video =====
    const uploadMedia = async (file) => {
        if (!file) return;

        try {
            setUploading(true);

            const fd = new FormData();
            fd.append("media", file);

            const { data } = await client.post("/chat/upload", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onSend({
                text: "",
                media: data.media,
            });

            toast.success("Sent successfully 💕");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);

            if (galleryRef.current) galleryRef.current.value = "";
            if (cameraRef.current) cameraRef.current.value = "";
        }
    };

    return (
        <div className="chat-input-wrapper">

            {/* Emoji Popup */}
            {showEmoji && (
                <div className="emoji-picker-box">
                    <EmojiPicker
                        onEmojiClick={addEmoji}
                        theme="light"
                        lazyLoadEmojis
                        skinTonesDisabled
                    />
                </div>
            )}

            <form className="chat-input-box" onSubmit={submit}>

                {/* Emoji */}
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                >
                    <Smile size={20} />
                </button>

                {/* Gallery */}
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => galleryRef.current.click()}
                >
                    <Image size={20} />
                </button>

                {/* Camera */}
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => cameraRef.current.click()}
                >
                    <Camera size={20} />
                </button>

                {/* Hidden Inputs */}

                <input
                    ref={galleryRef}
                    hidden
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => uploadMedia(e.target.files[0])}
                />

                <input
                    ref={cameraRef}
                    hidden
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => uploadMedia(e.target.files[0])}
                />

                {/* Text */}
                <input
                    value={text}
                    onChange={(e) => {
                        const value = e.target.value;
                        setText(value);

                        if (value.trim()) {
                            startTyping();
                        } else {
                            stopTyping();
                        }
                    }} placeholder={
                        uploading ? "Uploading..." : "Message your love... 💕"
                    }
                    disabled={uploading}
                />

                {/* Send / Mic */}
                {text.trim() ? (
                    <button
                        className="send-button"
                        type="submit"
                        disabled={uploading}
                    >
                        <Send size={20} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="send-button"
                        onClick={() => toast("Voice notes coming next 🎤")}
                        disabled={uploading}
                    >
                        <Mic size={20} />
                    </button>
                )}
            </form>
        </div>
    );
}