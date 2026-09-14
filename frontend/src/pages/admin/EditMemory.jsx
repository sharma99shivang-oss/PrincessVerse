import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';

export default function EditMemory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [memory, setMemory] = useState(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');

    const [newImages, setNewImages] = useState([]);

    useEffect(() => {
        loadMemory();
    }, []);

    const loadMemory = async () => {
        try {
            const { data } = await client.get(`/memories/${id}`);

            setMemory(data.memory);
            setTitle(data.memory.title || '');
            setDescription(data.memory.description || '');
            setLocation(data.memory.location || '');
            setTags((data.memory.tags || []).join(', '));
        } catch {
            toast.error('Memory load failed');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const saveMemory = async () => {
        setSaving(true);

        try {
            const formData = new FormData();

            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);

            tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .forEach((tag) => formData.append('tags', tag));

            newImages.forEach((file) => {
                formData.append('images', file);
            });

            await client.patch(`/memories/${id}`, formData);

            toast.success('Memory updated ❤️');
            navigate(`/memories/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="app-loading">Loading...</div>;
    }

    return (
        <div className="edit-memory-page">
            <button className="soft-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>

            <h1>Edit Memory ❤️</h1>
            <p className="edit-subtitle">Change your story, place, hashtags or add more photos.</p>

            <div className="edit-section">
                <label>Memory Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="First Date ❤️"
                />
            </div>

            <div className="edit-section">
                <label>Your Story</label>
                <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write your beautiful memory..."
                />
            </div>

            <div className="edit-section">
                <label>Location</label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cafe Coffee Day, Bareilly"
                />
            </div>

            <div className="edit-section">
                <label>Hashtags</label>
                <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="#firstdate, #love, #princess"
                />
            </div>

            <div className="edit-section">
                <label>Current Photos</label>

                <div className="edit-photo-grid">
                    {memory.images?.map((img, index) => (
                        <div key={index} className="edit-photo-card">
                            <img src={img} alt="memory" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="edit-section">
                <label>Add More Photos</label>

                <label className="upload-more-btn">
                    <ImagePlus size={18} /> Choose Photos
                    <input
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewImages(Array.from(e.target.files))}
                    />
                </label>

                <div className="preview-grid">
                    {newImages.map((file, index) => (
                        <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt="preview"
                        />
                    ))}
                </div>
            </div>

            <button
                className="primary-button save-memory-btn"
                disabled={saving}
                onClick={saveMemory}
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}