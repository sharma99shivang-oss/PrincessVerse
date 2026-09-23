import { useEffect, useRef, useState } from "react";
import { Send, Mic, Image, Smile, Camera } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import client from "../../api/client";
import { useChat } from "../../context/useChat";
export default function ChatInput({ onSend }) {
    const [text, setText] = useState("");
    const { startTyping, stopTyping } = useChat();
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const galleryRef = useRef(null);
    const cameraRef = useRef(null);
    const recorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingStartedRef = useRef(0);

    useEffect(() => {
        if (!recording) return undefined;
        const timer = window.setInterval(() => {
            setRecordingSeconds(Math.floor((Date.now() - recordingStartedRef.current) / 1000));
        }, 500);
        return () => window.clearInterval(timer);
    }, [recording]);

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";
            const recorder = new MediaRecorder(stream, { mimeType });
            recorderRef.current = recorder;
            audioChunksRef.current = [];
            recordingStartedRef.current = Date.now();
            setRecordingSeconds(0);
            setRecording(true);

            recorder.ondataavailable = (event) => {
                if (event.data.size) audioChunksRef.current.push(event.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const duration = Math.max(1, Math.round((Date.now() - recordingStartedRef.current) / 1000));
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                const formData = new FormData();
                formData.append("audio", blob, `voice-${Date.now()}.webm`);
                formData.append("duration", String(duration));

                try {
                    setUploading(true);
                    await client.post("/chat/upload-audio", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                } catch (err) {
                    toast.error(err.response?.data?.message || "Voice message failed");
                } finally {
                    setUploading(false);
                    audioChunksRef.current = [];
                }
            };
            recorder.start();
        } catch (err) {
            toast.error(err.message || "Microphone permission is required");
        }
    };

    const stopRecording = () => {
        if (!recorderRef.current || recorderRef.current.state === "inactive") return;
        recorderRef.current.stop();
        recorderRef.current = null;
        setRecording(false);
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
                {recording ? (
                    <button
                        type="button"
                        className="send-button"
                        onClick={stopRecording}
                        disabled={uploading}
                        style={{ color: "#ef4d9a", minWidth: "110px" }}
                    >
                        <span style={{ animation: "pv-pulse 1s infinite" }}>●</span>
                        {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                        {String(recordingSeconds % 60).padStart(2, "0")}
                        <span aria-hidden="true">▂▅▃▇▂</span>
                    </button>
                ) : text.trim() ? (
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
                        onClick={startRecording}
                        disabled={uploading}
                    >
                        <Mic size={20} />
                    </button>
                )}
            </form>
        </div>
    );
}