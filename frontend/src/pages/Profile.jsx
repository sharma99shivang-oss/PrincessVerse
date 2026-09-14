import { useState } from 'react';
import { Camera, Heart, MapPin, Pencil, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import client from '../api/client.js';
import GlassCard from '../components/GlassCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import toast from "react-hot-toast";
import { usePermissions } from "../context/PermissionContext.jsx";
const getImageUrl = (path) => {
  if (!path) return "/default-avatar.png";

  if (path.startsWith("http")) return path;

  // Agar slash nahi hai to add kar do
  const fixedPath = path.startsWith("/") ? path : `/uploads/profile/${path}`;

  return `http://localhost:5000${fixedPath}`;
};
export default function Profile() {
  const { user, setUser, role } = useAuth();
  const { permissions } = usePermissions();

  const canEditProfile =
    role === "ADMIN" || permissions?.canEditOwnProfile;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || '', coverPhoto: user?.coverPhoto || '', nickname: user?.nickname || '', relationshipQuote: user?.relationshipQuote || '', loveLanguage: user?.loveLanguage || '', favoriteSong: user?.favoriteSong || '', favoriteFood: user?.favoriteFood || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const save = async (e) => {
    e.preventDefault();

    if (!canEditProfile) {
      toast.error("Your partner has disabled profile editing 💗");
      return;
    }

    try {
      setUploading(true);
      let avatar = user?.avatar || "";
      let coverPhoto = user?.coverPhoto || "";

      // Upload images first
      if (avatarFile || coverFile) {
        const fd = new FormData();

        if (avatarFile) fd.append("avatar", avatarFile);
        if (coverFile) fd.append("coverPhoto", coverFile);

        const { data: uploadData } = await client.put(
          "/profile/upload-images",
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("UPLOAD RESPONSE:", uploadData);
        avatar = uploadData.avatar || avatar;
        coverPhoto = uploadData.coverPhoto || coverPhoto;
      }

      // Save profile
      const { data } = await client.patch("/profile", {
        ...form,
        avatar,
        coverPhoto,
      });
      console.log("PATCH RESPONSE:", data.user);
      setUser(data.user);

      setForm((prev) => ({
        ...prev,
        avatar: data.user.avatar,
        coverPhoto: data.user.coverPhoto,
      }));

      setAvatarFile(null);
      setCoverFile(null);
      setEditing(false);

      toast.success("Profile updated successfully 💖");

    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed.");
    } finally {
      setUploading(false);
    }
  };

  return <><PageHeader eyebrow="A little about you" title="Profile" subtitle="Your corner of the PrincessVerse."
    action={
      canEditProfile ? (
        <button
          className="soft-button"
          onClick={() => setEditing(!editing)}
        >
          <Pencil size={15} />
          {editing ? "Close editor" : "Edit profile"}
        </button>
      ) : (
        <button className="soft-button" disabled>
          🔒 Editing Disabled
        </button>
      )
    } /><GlassCard className="profile-hero" style={
      user?.coverPhoto
        ? {
          backgroundImage: `linear-gradient(120deg, rgba(255,255,255,.9), rgba(255,238,246,.78)), url(${getImageUrl(user.coverPhoto)})`,
        }
        : undefined
    }><div className="profile-avatar-wrap">
        <img
          src={getImageUrl(user?.avatar)}
          alt={user?.name}
          className="profile-avatar"
        />
        <span className="camera-badge"><Camera size={14} /></span></div><div className="profile-info"><span className="eyebrow">{user?.nickname || 'Member'} · since {new Date(user?.joinedAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span><h2>{user?.name}</h2><p>{user?.relationshipQuote || user?.bio}</p><div className="profile-tags"><span><Heart size={13} /> {user?.loveLanguage || 'Soft-hearted'}</span><span><MapPin size={13} /> {user?.location || 'Your happy place'}</span><span><Sparkles size={13} /> {user?.favoriteSong || 'Magic maker'}</span></div></div></GlassCard>{editing && <GlassCard className="form-card"><form onSubmit={save} className="auth-form"><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Nickname<input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} /></label><label>
          Profile Photo

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />

          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="Avatar Preview"
              className="profile-preview-image"
            />
          )}
        </label>

          <label>
            Cover Photo

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />

            {coverFile && (
              <img
                src={URL.createObjectURL(coverFile)}
                alt="Cover Preview"
                className="cover-preview-image"
              />
            )}
          </label><label>Love language<input value={form.loveLanguage} onChange={(e) => setForm({ ...form, loveLanguage: e.target.value })} /></label><label>Favorite song<input value={form.favoriteSong} onChange={(e) => setForm({ ...form, favoriteSong: e.target.value })} /></label><label>Favorite food<input value={form.favoriteFood} onChange={(e) => setForm({ ...form, favoriteFood: e.target.value })} /></label><label>Relationship quote<textarea value={form.relationshipQuote} onChange={(e) => setForm({ ...form, relationshipQuote: e.target.value })} /></label><label>Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label><button className="primary-button" disabled={uploading}>
            {uploading ? "Uploading..." : "Save Changes 💖"}
          </button></form></GlassCard>}</>;
}
