import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    Heart,
    Camera,
    Mail,
    Music2,
    Gift,
    CalendarDays,
    CheckCheck,
    Trash2,
    Sparkles,
    Filter,
    Clock3,
    MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../api/client";
import GlassCard from "../../components/GlassCard";
import PageHeader from "../../components/PageHeader";

const ICONS = {
    chat: MessageCircle,
    letter: Mail,
    gallery: Camera,
    memory: Camera,
    gift: Gift,
    mood: Heart,
    playlist: Music2,
    music: Music2,
    anniversary: CalendarDays,
    default: Bell,
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await client.get("/notifications");
            setNotifications(data.notifications || data.items || []);
        } catch {
            toast.error("Couldn't load notifications.");
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        if (filter === "unread")
            return notifications.filter((n) => !n.isRead);

        if (filter === "read")
            return notifications.filter((n) => n.isRead);

        return notifications;
    }, [notifications, filter]);

    const markAsRead = async (id) => {
        try {
            await client.patch(`/notifications/${id}`, {
                isRead: true,
            });

            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === id ? { ...item, isRead: true } : item
                )
            );
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await client.patch("/notifications/read-all");

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );

            toast.success("Everything is read now 💖");
        } catch {
            toast.error("Couldn't update notifications.");
        }
    };

    const removeNotification = async (id) => {
        try {
            await client.delete(`/notifications/${id}`);

            setNotifications((prev) =>
                prev.filter((item) => item._id !== id)
            );

            toast.success("Notification deleted 🗑");
        } catch {
            toast.error("Delete failed.");
        }
    };

    const getTime = (date) =>
        new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="premium-notification-page">

            <PageHeader
                eyebrow="PrincessVerse Premium"
                title="Notifications 💖"
                subtitle="Everything your partner shares appears here instantly."
            />

            {/* TOP CARD */}

            <GlassCard className="notification-summary-card">
                <div className="notification-summary-left">
                    <div className="notification-bell">
                        <Bell size={28} />
                    </div>

                    <div>
                        <h2>{notifications.length}</h2>
                        <p>Total Notifications</p>
                    </div>
                </div>

                <div className="notification-summary-right">
                    <div className="pink-pill">
                        {unreadCount} Unread
                    </div>

                    <button
                        className="primary-button"
                        onClick={markAllRead}
                    >
                        <CheckCheck size={17} />
                        Mark All Read
                    </button>
                </div>
            </GlassCard>

            {/* FILTERS */}

            <div className="notification-filter-row">

                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                >
                    <Filter size={15} />
                    All
                </button>

                <button
                    className={filter === "unread" ? "active" : ""}
                    onClick={() => setFilter("unread")}
                >
                    💌 Unread
                </button>

                <button
                    className={filter === "read" ? "active" : ""}
                    onClick={() => setFilter("read")}
                >
                    ✔ Read
                </button>

            </div>

            {/* LIST */}

            {loading ? (
                <div className="notification-empty">
                    Loading...
                </div>
            ) : filteredNotifications.length === 0 ? (
                <GlassCard className="notification-empty">
                    <Sparkles size={42} />
                    <h3>No Notifications Yet 💖</h3>
                    <p>Your love story will start filling this page soon.</p>
                </GlassCard>
            ) : (
                <div className="notification-list">

                    {filteredNotifications.map((item) => {

                        const Icon = ICONS[item.type] || ICONS.default;

                        return (
                            <GlassCard
                                key={item._id}
                                className={`notification-card ${!item.isRead ? "unread" : ""
                                    }`}
                            >

                                <div className="notification-icon">
                                    <Icon size={20} />
                                </div>

                                <div className="notification-content">

                                    <div className="notification-top-row">
                                        <h4>{item.title}</h4>

                                        {!item.isRead && (
                                            <span className="unread-dot" />
                                        )}
                                    </div>

                                    <p>{item.message}</p>

                                    <div className="notification-footer">

                                        <span>
                                            <Clock3 size={13} />
                                            {getTime(item.createdAt)}
                                        </span>

                                        <div className="notification-actions">

                                            {!item.isRead && (
                                                <button
                                                    onClick={() => markAsRead(item._id)}
                                                >
                                                    <CheckCheck size={15} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    removeNotification(item._id)
                                                }
                                            >
                                                <Trash2 size={15} />
                                            </button>

                                        </div>
                                    </div>
                                </div>

                            </GlassCard>
                        );
                    })}

                </div>
            )}

        </div>
    );
}