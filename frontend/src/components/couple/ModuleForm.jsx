import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../GlassCard.jsx';
const moodOptions = [
  { name: "In Love", emoji: "🥰", color: "#FF6BAA" },
  { name: "Happy", emoji: "😊", color: "#FDBA74" },
  { name: "Excited", emoji: "🤩", color: "#A855F7" },
  { name: "Peaceful", emoji: "😌", color: "#7DD3FC" },
  { name: "Dreamy", emoji: "🌸", color: "#F9A8D4" },
  { name: "Missing You", emoji: "🥺", color: "#C084FC" },
  { name: "Sleepy", emoji: "😴", color: "#94A3B8" },
  { name: "Emotional", emoji: "😭", color: "#60A5FA" },
  { name: "Romantic", emoji: "❤️", color: "#EC4899" },
  { name: "Shy", emoji: "☺️", color: "#F472B6" },
  { name: "Angry", emoji: "😤", color: "#FB7185" },
  { name: "Lucky", emoji: "🍀", color: "#4ADE80" }
];

const weatherOptions = [
  "☀️ Sunny",
  "🌧️ Rainy",
  "☁️ Cloudy",
  "🌙 Night",
  "🌈 Rainbow",
  "🌬️ Windy"
];
export default function ModuleForm({ resource, kind, onClose, onSaved }) {
  const [form, setForm] = useState({
    mood: "In Love",
    emoji: "🥰",
    note: "",
    weather: "☀️ Sunny",
    color: "#FF6BAA",
    date: new Date().toISOString().split("T")[0]
  });
  const [saving, setSaving] = useState(false);
  const fields = {
    gift: [['title', 'Title'], ['description', 'Personal note'], ['giftImage', 'Gift image URL'], ['budget', 'Budget'], ['revealDate', 'Reveal date'], ['giftType', 'Gift type'], ['giftStatus', 'Status'], ['shoppingLink', 'Shopping link']],
    song: [['title', 'Song title'], ['artist', 'Artist'], ['coverImage', 'Cover image URL'], ['spotifyUrl', 'Spotify URL'], ['youtubeUrl', 'YouTube URL'], ['album', 'Album']],
    movie: [['title', 'Movie title'], ['poster', 'Poster URL'], ['rating', 'Rating (1-5)'], ['review', 'Review'], ['watchDate', 'Watched date'], ['streamingPlatform', 'Streaming platform']],
    food: [['restaurant', 'Restaurant'], ['dish', 'Dish'], ['photo', 'Photo URL'], ['location', 'Location'], ['rating', 'Rating (1-5)'], ['visitDate', 'Visit date'], ['notes', 'Notes']],
    mood: [['emoji', 'Emoji'], ['note', 'Note'], ['date', 'Date'], ['weather', 'Weather'], ['color', 'Color']],
    bucket: [['title', 'Dream title'], ['description', 'Description'], ['image', 'Image URL'], ['category', 'Category'], ['targetDate', 'Target date']]
  }[kind] || [];
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let payload = { ...form };

      if (resource === "moods") {
        payload = {
          mood: form.mood,
          emoji: form.emoji,
          note: form.note,
          weather: form.weather,
          color: form.color,
          date: form.date
        };
      }

      await onSaved(payload);

      toast.success(`${kind} saved successfully 💖`);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save this item."
      );
    } finally {
      setSaving(false);
    }
  }; return <div className="modal-backdrop" onMouseDown={onClose}><GlassCard className="memory-modal" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><span className="eyebrow">A new shared chapter</span><h2>Add {kind}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><form className="auth-form" onSubmit={submit}>{resource === "moods" ? (
    <>
      {/* Premium Hero */}
      <div
        className="mood-preview-card"
        style={{
          background: `linear-gradient(135deg, ${form.color}, #8B5CF6)`
        }}
      >
        <div>
          <span className="eyebrow">Today's Feeling</span>

          <h2>
            {form.emoji} {form.mood}
          </h2>

          <p>{form.note || "Every feeling deserves a place in your love story."}</p>

          <span className="weather-preview">{form.weather}</span>
        </div>

        <div className="preview-emoji">{form.emoji}</div>
      </div>

      <label>Choose Your Mood</label>

      <div className="emoji-mood-grid">
        {moodOptions.map((mood) => (
          <button
            key={mood.name}
            type="button"
            className={`emoji-card ${form.mood === mood.name ? "active" : ""
              }`}
            style={{
              borderColor:
                form.mood === mood.name ? mood.color : "#FAD1E4",
              background:
                form.mood === mood.name ? mood.color + "20" : "#fff"
            }}
            onClick={() =>
              setForm({
                ...form,
                mood: mood.name,
                emoji: mood.emoji,
                color: mood.color
              })
            }
          >
            <span className="emoji-big">{mood.emoji}</span>
            <small>{mood.name}</small>
          </button>
        ))}
      </div>

      <label>Write Today's Feelings 💌</label>

      <textarea
        rows={4}
        placeholder="Tell your partner how you're feeling today..."
        value={form.note}
        onChange={(e) =>
          setForm({
            ...form,
            note: e.target.value
          })
        }
      />

      <label>Memory Date</label>

      <input
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({
            ...form,
            date: e.target.value
          })
        }
      />

      <label>Weather Around You</label>

      <div className="weather-picker">
        {weatherOptions.map((weather) => (
          <button
            key={weather}
            type="button"
            className={`weather-chip ${form.weather === weather ? "active" : ""
              }`}
            onClick={() =>
              setForm({
                ...form,
                weather
              })
            }
          >
            {weather}
          </button>
        ))}
      </div>

      <label>Choose Mood Theme Color</label>

      <div className="color-picker-row">
        {[
          "#FF6BAA",
          "#EC4899",
          "#A855F7",
          "#7DD3FC",
          "#FDBA74",
          "#4ADE80",
          "#60A5FA",
          "#FB7185"
        ].map((clr) => (
          <button
            key={clr}
            type="button"
            className={`color-circle ${form.color === clr ? "selected" : ""
              }`}
            style={{ background: clr }}
            onClick={() =>
              setForm({
                ...form,
                color: clr
              })
            }
          />
        ))}
      </div>

      <input
        type="color"
        value={form.color}
        onChange={(e) =>
          setForm({
            ...form,
            color: e.target.value
          })
        }
      />
    </>
  ) : (
    fields.map(([key, label]) => (
      <label key={key}>
        {label}

        {key === "description" ||
          key === "review" ||
          key === "notes" ||
          key === "note" ? (
          <textarea
            value={form[key] || ""}
            onChange={(event) =>
              setForm({
                ...form,
                [key]: event.target.value
              })
            }
          />
        ) : (
          <input
            type={
              key.toLowerCase().includes("date")
                ? "date"
                : key === "rating" || key === "budget"
                  ? "number"
                  : "text"
            }
            value={form[key] || ""}
            onChange={(event) =>
              setForm({
                ...form,
                [key]: event.target.value
              })
            }
            required={
              key === "title" ||
              key === "restaurant" ||
              key === "dish"
            }
          />
        )}
      </label>
    ))
  )}<button className="primary-button full" disabled={saving}>{saving ? 'Saving…' : `Save ${kind}`}</button></form></GlassCard></div>;
}
