import { useState } from 'react';
import { CloudSun, Frown, Heart, Meh, Smile, Sun } from 'lucide-react';
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { usePermissions } from "../../context/PermissionContext.jsx";
import PageHeader from '../components/PageHeader.jsx';
import GlassCard from '../components/GlassCard.jsx';
import { useContent } from '../hooks/useContent.js';

const moods = [
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
  { name: "Lucky", emoji: "🍀", color: "#4ADE80" },
];

const weatherOptions = [
  "☀️ Sunny",
  "🌧️ Rainy",
  "☁️ Cloudy",
  "🌙 Night",
  "🌈 Rainbow",
  "🌬️ Windy",
];
export default function Moods() {
  const { items } = useContent("notification");
  const { permissions } = usePermissions();

  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [savedMood, setSavedMood] = useState(null);
  const [note, setNote] = useState("");
  const [weather, setWeather] = useState("☀️ Sunny");
  const [color, setColor] = useState("#FF6BAA");
  const [saving, setSaving] = useState(false);

  return <><PageHeader eyebrow="Check in with yourself" title="Moods" subtitle="There is room for every feeling here." action={<span className="date-chip">September 6, 2026</span>} /><GlassCard className="today-mood-hero">
    <div>
      <span className="eyebrow">Today's Feeling</span>

      <h1>
        {selectedMood.emoji} {selectedMood.name}
      </h1>

      <p>Every feeling deserves a beautiful place in your love story.</p>

      <span className="weather-pill">{weather}</span>
    </div>

    <div
      className="today-mood-circle"
      style={{ background: color }}
    >
      {selectedMood.emoji}
    </div>
  </GlassCard><div className="mood-layout"><GlassCard className="mood-picker"><div className="card-heading"><div><span className="eyebrow">How are you feeling?</span><h2>Pick your color</h2></div><span className="mood-heart">♥</span></div><div className="emoji-mood-grid">
    {moods.map((mood) => (
      <button
        key={mood.name}
        className={
          selectedMood.name === mood.name
            ? "emoji-card active"
            : "emoji-card"
        }
        style={{
          borderColor:
            selectedMood.name === mood.name
              ? mood.color
              : "transparent",
        }}
        onClick={() => {
          setSelectedMood(mood);
          setColor(mood.color);
        }}
      >
        <span className="emoji-big">{mood.emoji}</span>

        <small>{mood.name}</small>
      </button>
    ))}
  </div><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a little note about today (optional)…" /><div className="weather-picker">
      {weatherOptions.map((item) => (
        <button
          key={item}
          className={
            weather === item
              ? "weather-chip active"
              : "weather-chip"
          }
          onClick={() => setWeather(item)}
        >
          {item}
        </button>
      ))}
    </div>

    <label>Mood Color</label>

    <input
      inputType="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
    />{permissions?.canAddMood && (
      <button
        className="primary-button"
        disabled={saving}
        onClick={async () => {
          try {
            setSaving(true);

            const { data } = await client.post("/moods", {
              mood: selectedMood.name,
              emoji: selectedMood.emoji,
              note,
              weather,
              color,
              date: new Date(),
            });

            setSavedMood(data.item);
            toast.success("Today's mood saved 💖");

            setNote("");
          } catch (err) {
            toast.error(
              err.response?.data?.message ||
              "Couldn't save mood."
            ); {
              savedMood && (
                <GlassCard className="today-mood-saved">
                  <span className="eyebrow">Today's Mood Saved</span>

                  <h2>
                    {savedMood.emoji} {savedMood.mood}
                  </h2>

                  <p>{savedMood.note}</p>

                  <div className="weather-pill">{savedMood.weather}</div>
                </GlassCard>
              )
            }
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving..." : "Save Today's Mood ❤️"}
      </button>
    )}</GlassCard><GlassCard className="mood-summary"><span className="eyebrow">Your mood garden</span><h2>A lovely little pattern</h2><p>You've been choosing soft, hopeful colors this week.</p><div className="weekly-mood-chart">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
        <div key={day} className="chart-column">
          <div
            className="chart-fill"
            style={{
              height: `${45 + i * 8}px`,
              background: moods[i % moods.length].color,
            }}
          />
          <small>{day}</small>
        </div>
      ))}
    </div><div className="mood-insight"><Heart size={17} /><span>Feeling <strong>{selectedMood.name}</strong> is worth celebrating.</span></div></GlassCard></div><div className="section-heading"><div><span className="eyebrow">Tiny reminders</span><h2>Kind notes for today</h2></div></div><div className="content-grid compact">{items.slice(0, 3).map((item) => <GlassCard key={item._id} className="quote-card"><span>{item.emoji}</span><p>{item.description}</p></GlassCard>)}</div></>;
}
