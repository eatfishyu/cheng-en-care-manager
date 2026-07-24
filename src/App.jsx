import { Routes, Route } from "react-router-dom";
import CaseDetail from "./pages/CaseDetail";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Report from "./pages/Report";
import PhoneCall from "./pages/PhoneCall";
import HomeVisit from "./pages/HomeVisit";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/report" element={<Report />} />
        <Route path="/phone" element={<PhoneCall />} />
        <Route path="/visit" element={<HomeVisit />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
