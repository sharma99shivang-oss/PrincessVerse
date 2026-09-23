import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';

function SelectedMediaPreview({ file }) {
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (file.type.startsWith('video/')) {
        return (
            <video
                src={previewUrl}
                controls
                muted
                playsInline
                preload="metadata"
                aria-label={`${file.name} preview`}
            />
        );
    }

    return <img src={previewUrl} alt="preview" />;
}

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

    // Keep one selection for both photos and videos so the existing upload
    // control can replace/add either media type without changing its styling.
    const [newMedia, setNewMedia] = useState([]);

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

            newMedia.forEach((file) => {
                formData.append(file.type.startsWith('video/') ? 'videos' : 'images', file);
            });

            const { data } = await client.patch(`/memories/${id}`, formData);

            toast.success('Memory updated ❤️');
            // Use the returned memory immediately when opening the details
            // view, avoiding a full page refresh after the upload completes.
            navigate(`/memories/${id}`, {
                state: { updatedMemory: data.memory || data.item },
            });
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
                    {memory.videos?.map((video, index) => (
                        <div key={`video-${index}`} className="edit-photo-card">
                            <video
                                src={video}
                                controls
                                muted
                                playsInline
                                preload="metadata"
                                aria-label="Current memory video"
                            />
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
                        accept="image/*,video/*"
                        onChange={(e) => setNewMedia(Array.from(e.target.files || []))}
                    />
                </label>

                <div className="preview-grid">
                    {newMedia.map((file) => (
                        <SelectedMediaPreview
                            key={`${file.name}-${file.lastModified}`}
                            file={file}
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