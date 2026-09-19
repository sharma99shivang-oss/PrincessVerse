import GlassCard from '../../components/GlassCard';
import { Heart, CalendarHeart, Image } from 'lucide-react';

export default function ChatSidebar() {

    return (

        <GlassCard className='chat-sidebar'>

            <img
                src='/default-avatar.png'
                alt='partner'
                className='sidebar-avatar'
            />

            <h2>Princess ❤️</h2>
            <p>Your forever favorite person.</p>

            <div className='sidebar-stat'>
                <Heart size={18} />
                <span>Love Streak: 256 Days</span>
            </div>

            <div className='sidebar-stat'>
                <CalendarHeart size={18} />
                <span>Together Since: 16 Jan 2025</span>
            </div>

            <div className='sidebar-stat'>
                <Image size={18} />
                <span>184 Shared Memories</span>
            </div>

        </GlassCard>

    )
}