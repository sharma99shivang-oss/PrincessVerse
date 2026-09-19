import { useEffect, useState } from 'react';
import { Camera, Heart, ListChecks, Mail, MessageCircle, Music2, Save, UserRound, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

const definitions = [
    ["canUploadPhotos", "Upload photos", "Allow your partner to add new gallery memories.", Camera],

    ["canReplyLetters", "Reply to letters", "Show the reply composer on shared letters.", Mail],

    ["canCommentMemories", "Comment on memories", "Allow notes and reactions on memory details.", MessageCircle],

    [
        "canUseChat",
        "Use Princess Chat",
        "Allow your partner to send and receive private chat messages.",
        MessageCircle,
    ],

    ["canAddMood", "Add moods", "Let your partner share daily feelings.", Heart],

    ["canAddBucketList", "Create bucket dreams", "Allow adding shared goals and adventures.", ListChecks],

    ["canEditOwnProfile", "Edit profile", "Allow the partner to update their own profile.", UserRound],

    ["canCreatePlaylist", "Create playlists", "Allow adding songs to your shared soundtrack.", Music2],
];
const moduleDefinitions = [
    ["gallery", "Gallery", "Show Gallery module to partner."],
    ["letters", "Love Letters", "Show Letters module."],
    ["chat", "Princess Chat", "Show Princess Chat module to partner."],
    ["timeline", "Timeline", "Show Timeline page."],
    ["music", "Music", "Show Songs section."],
    ["movies", "Movies", "Show Movies section."],
    ["foods", "Foods", "Show Foods section."],
    ["gifts", "Gift Wishlist", "Show Gifts module."],
    ["moods", "Mood Tracker", "Show Mood Tracker module."],
    ["bucketList", "Bucket List", "Show shared dreams module."],
    ["calendar", "Calendar", "Show Calendar page."],
    ["notifications", "Notifications", "Show Notification page."],
    ["relationshipAnalytics", "Relationship Analytics", "Show analytics module."],
];
export default function Permissions() {
    const [permissions, setPermissions] = useState({});
    const [modules, setModules] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        loadPermissions();
        loadModules();
    }, []);

    const loadPermissions = async () => {
        try {
            const { data } = await client.get("/couples/permissions");
            setPermissions(data.permissions || {});
        } catch {
            toast.error("Couldn't load partner permissions.");
        }
    };
    const loadModules = async () => {
        const { data } = await client.get("/couples/modules");
        setModules(data.modules || {});
    };
    const save = async () => {
        setSaving(true);

        try {
            await client.patch("/couples/permissions", permissions);

            await client.patch("/couples/modules", modules);

            toast.success("Partner permissions updated ❤️");

            loadPermissions();
            loadModules();
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't save settings.");
        } finally {
            setSaving(false);
        }
    };
    return <>
        {/* ================= PERMISSIONS ================= */}
        <PageHeader
            eyebrow="A softer kind of control"
            title="Partner Permissions"
            subtitle="Choose what your partner is allowed to do."
            action={
                <button
                    className="primary-button"
                    onClick={save}
                    disabled={saving}
                >
                    <Save size={15} />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            }
        />

        <div className="permission-grid">
            {definitions.map(([key, title, description, Icon]) => (
                <GlassCard className="permission-card" key={key}>
                    <span className="setting-icon">
                        <Icon size={18} />
                    </span>

                    <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>

                    <button
                        className={`toggle ${permissions[key] ? "on" : ""}`}
                        onClick={() =>
                            setPermissions((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                            }))
                        }
                    >
                        <span />
                    </button>
                </GlassCard>
            ))}
        </div>

        {/* ================= MODULE VISIBILITY ================= */}
        <PageHeader
            eyebrow="What Partner Can See"
            title="Visible Modules"
            subtitle="Hide or show complete sections of PrincessVerse for your partner."
        />

        <div className="permission-grid">
            {moduleDefinitions.map(([key, title, description]) => (
                <GlassCard className="permission-card" key={key}>
                    <span className="setting-icon">
                        <Eye size={18} />
                    </span>

                    <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>

                    <button
                        className={`toggle ${modules[key] ? "on" : ""}`}
                        onClick={() =>
                            setModules((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                            }))
                        }
                    >
                        <span />
                    </button>
                </GlassCard>
            ))}
        </div>
    </>;
}
