import { Moon, Palette, Sparkles, Sun } from "lucide-react";
import { useTheme } from "../context/useTheme";

const labels = {
  light: "Light",
  dark: "Dark",
  lavender: "Lavender",
  midnight: "Midnight",
};

export default function ThemeSwitcher({ compact = false }) {
  const { theme, themes, setTheme } = useTheme();
  const icons = { light: Sun, dark: Moon, lavender: Sparkles, midnight: Palette };

  if (compact) {
    const Icon = icons[theme] || Sun;
    return (
      <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
        <Icon size={17} />
      </button>
    );
  }

  return (
    <div className="theme-switcher" role="group" aria-label="Theme selector">
      {themes.map((item) => {
        const Icon = icons[item];
        return (
          <button key={item} className={`theme-switcher-option ${theme === item ? "active" : ""}`} onClick={() => setTheme(item)}>
            <Icon size={16} />
            <span>{labels[item]}</span>
          </button>
        );
      })}
    </div>
  );
}
