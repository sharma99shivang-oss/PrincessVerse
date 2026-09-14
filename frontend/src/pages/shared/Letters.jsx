import { LockKeyhole, MailOpen, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Letters({ admin = false }) {
  const [letters, setLetters] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [openComposer, setOpenComposer] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    emoji: "💌",
    isLocked: false,
    lockUntilDate: "",
  });
  useEffect(() => { setLoading(true); client.get('/letters', { params: { search } }).then(({ data }) => setLetters(data.letters || data.items || [])).finally(() => setLoading(false)); }, [search]);
  useEffect(() => {
    if (location.state?.openComposer) {
      setOpenComposer(true);
    }
  }, [location.state]);
  return <><PageHeader eyebrow={admin ? "Keeper's desk" : 'Written with love'} title={admin ? 'Letter manager' : 'Letters'} subtitle="Words worth keeping close." action={
    admin ? (
      <button
        className="primary-button"
        onClick={() => setOpenComposer(true)}
      >
        <Plus size={16} />
        Write a letter
      </button>
    ) : null
  } /><GlassCard className="gallery-toolbar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search letters…" /></div></GlassCard>{loading ? <div className="loading-grid">{[1, 2, 3].map((item) => <GlassCard className="skeleton-card" key={item} />)}</div> : <div className="letter-grid">{letters.map((letter) => <Link to={`/letters/${letter._id}`} key={letter._id}><GlassCard className={`letter-card theme-${letter.theme || 'pink'}`}><div className="envelope-mark">{letter.isLocked ? <LockKeyhole size={22} /> : <MailOpen size={22} />}</div><span className="eyebrow">{letter.isLocked ? 'Locked until ' + new Date(letter.lockUntilDate).toLocaleDateString() : 'A love note'}</span><h3>{letter.title}</h3><p>
    {letter.isLocked
      ? "A little surprise is waiting. 💌"
      : letter.content}
  </p><span className="letter-emoji">{letter.emoji || '💌'}</span></GlassCard></Link>)}</div>}
    {openComposer && (
      <div className="modal-overlay">
        <GlassCard className="letter-composer-modal">
          <div className="modal-header">
            <h2>Write a Love Letter 💌</h2>

            <button
              className="icon-button"
              onClick={() => setOpenComposer(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="auth-form">
            <label>
              Letter Title
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="My Sweet Princess..."
              />
            </label>

            <label>
              Message
              <textarea
                rows={8}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="Write something romantic..."
              />
            </label>

            <label>
              Emoji
              <input
                value={form.emoji}
                onChange={(e) =>
                  setForm({ ...form, emoji: e.target.value })
                }
              />
            </label>
            <div className="lock-letter-box">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.isLocked}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isLocked: e.target.checked,
                    })
                  }
                />

                <span>💝 Lock this letter until a special date</span>
              </label>

              {form.isLocked && (
                <label className="unlock-date-field">
                  Unlock Date

                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.lockUntilDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lockUntilDate: e.target.value,
                      })
                    }
                  />
                </label>
              )}
            </div>

            <button
              className="primary-button"
              onClick={async () => {
                if (!form.title.trim()) {
                  toast.error("Please enter letter title.");
                  return;
                }

                if (!form.message.trim()) {
                  toast.error("Please write your letter.");
                  return;
                }

                if (form.isLocked && !form.lockUntilDate) {
                  toast.error("Please choose unlock date.");
                  return;
                }
                try {
                  await client.post("/letters", {
                    title: form.title,
                    content: form.message,      // ✅ Backend ko content chahiye
                    emoji: form.emoji,
                    isLocked: form.isLocked,
                    lockUntilDate: form.isLocked
                      ? form.lockUntilDate
                      : null,
                  });

                  toast.success("Letter created successfully ❤️");

                  setOpenComposer(false);

                  setForm({
                    title: "",
                    message: "",
                    emoji: "💌",
                    isLocked: false,
                    lockUntilDate: "",
                  });

                  const { data } = await client.get("/letters");
                  setLetters(data.letters || data.items || []);
                } catch (err) {
                  toast.error(
                    err.response?.data?.message ||
                    "Could not create letter."
                  );
                }
              }}
            >
              Save Letter
            </button>
          </div>
        </GlassCard>
      </div>
    )}</>;
}
