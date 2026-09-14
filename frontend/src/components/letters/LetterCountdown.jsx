import { useEffect, useState } from "react";

export default function LetterCountdown({ unlockDate }) {
    const getTimeLeft = () => {
        const diff = new Date(unlockDate) - new Date();

        if (diff <= 0) return null;

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, [unlockDate]);

    if (!timeLeft) {
        return (
            <div className="unlock-ready">
                💖 It's time to open your love letter.
            </div>
        );
    }

    return (
        <div className="countdown-card">
            <span>⏳ Opens In</span>

            <h2>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </h2>

            <small>
                Unlocks on{" "}
                {new Date(unlockDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
            </small>
        </div>
    );
}