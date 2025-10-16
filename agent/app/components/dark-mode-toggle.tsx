import { Switch } from "@components/ui/switch";
import { useDarkMode } from "~/hooks/use-dark-mode";
import { SunIcon, MoonIcon } from "lucide-react"; // You can use any icon set or shadcn/ui icons

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center space-x-2">
      <SunIcon
        className={`h-5 w-5 ${!darkMode ? "text-yellow-500" : "text-muted-foreground"}`}
        aria-label="Light mode"
      />
      <Switch
        checked={darkMode}
        onCheckedChange={toggleDarkMode}
        aria-label="Toggle dark mode"
      />
      <MoonIcon
        className={`h-5 w-5 ${darkMode ? "text-blue-500" : "text-muted-foreground"}`}
        aria-label="Dark mode"
      />
    </div>
  );
}