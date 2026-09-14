import { CalendarPlus, Camera, Gift, Music2, PenLine } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <Link to="/gallery" className="quick-action">
        <Camera size={17} />
        <span>Upload memory</span>
      </Link>

      <Link
        to="/letters"
        state={{ openComposer: true }}
        className="quick-action"
      >
        <PenLine size={17} />
        <span>Write a letter</span>
      </Link>

      <Link to="/gifts" className="quick-action">
        <Gift size={17} />
        <span>Create a gift</span>
      </Link>

      <Link to="/timeline" className="quick-action">
        <CalendarPlus size={17} />
        <span>Add timeline event</span>
      </Link>

      <Link to="/music" className="quick-action">
        <Music2 size={17} />
        <span>Add a song</span>
      </Link>
    </div>
  );
}