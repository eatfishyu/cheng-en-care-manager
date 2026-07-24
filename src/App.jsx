import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { SettingsProvider } from "./contexts/SettingsContext";

import Home from "./pages/Home";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Report from "./pages/Report";
import Phone from "./pages/Phone";
import HomeVisit from "./pages/HomeVisit";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/report" element={<Report />} />
        <Route path="/phone" element={<Phone />} />
        <Route path="/visit" element={<HomeVisit />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      </Routes>
    </SettingsProvider>
  );
}