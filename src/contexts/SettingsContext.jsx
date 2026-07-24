import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSettings,
  saveSettings as persistSettings,
} from "../services/settingsService";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    function handleChange(event) {
      setSettings(event.detail || getSettings());
    }

    window.addEventListener("app-settings-changed", handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("app-settings-changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      saveSettings(nextSettings) {
        const saved = persistSettings(nextSettings);
        setSettings(saved);
        return saved;
      },
      reloadSettings() {
        setSettings(getSettings());
      },
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const value = useContext(SettingsContext);

  if (!value) {
    throw new Error("useSettings 必須在 SettingsProvider 內使用");
  }

  return value;
}
