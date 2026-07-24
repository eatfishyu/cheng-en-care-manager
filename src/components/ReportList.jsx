import { useState } from "react";
import { useParams } from "react-router-dom";
import ReportModal from "./ReportModal";
import {
  getReports,
  addReport,
  updateReport,
  deleteReport,
} from "../services/reportService";

export default function ReportList() {
  const { id } = useParams();

  const [reports, setReports] = useState(getReports(id));
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  function refresh() {
    setReports(getReports(id));
  }

  function handleSave(report) {
    if (editingReport) {
      updateReport(id, report);
    } else {
      addReport(id, report);
    }

    refresh();
    setEditingReport(null);
  }

  function handleEdit(report) {
    setEditingReport(report);
    setOpen(true);
  }

  function handleDelete(reportId) {
    if (!window.confirm("確定刪除此工作報表？")) return;

    deleteReport(id, reportId);
    refresh();
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-bold">
            工作報表
          </h2>

          <button
            onClick={() => {
              setEditingReport(null);
              setOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            ＋新增
          </button>

        </div>

        <input
          type="text"
          placeholder="搜尋工作內容..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-5 mb-5 w-full border rounded-lg px-4 py-3"
        />

        {reports.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-slate-400">
            尚無工作報表
          </div>
        ) : (
          <div className="space-y-4">

            {reports
              .filter((report) => {
                const keyword = search.trim().toLowerCase();

                if (!keyword) return true;

                return (
                  report.content.toLowerCase().includes(keyword) ||
                  (report.note || "").toLowerCase().includes(keyword) ||
                  report.date.includes(keyword)
                );
              })
              .map((report) => (

                <div
                  key={report.id}
                  className="border rounded-xl p-5"
                >

                  <div className="flex justify-between items-center">

                    <div className="flex-1">

                      <div className="font-bold text-blue-600">
                        {report.date}
                      </div>

                      <div className="mt-2 whitespace-pre-wrap">
                        {report.content}
                      </div>

                      {report.note && (
                        <div className="mt-2 text-slate-500">
                          備註：{report.note}
                        </div>
                      )}

                    </div>

                    <div className="flex gap-2 ml-4">

                      <button
                        onClick={() => handleEdit(report)}
                        className="px-3 py-2 rounded bg-amber-500 text-white"
                      >
                        編輯
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        className="px-3 py-2 rounded bg-red-500 text-white"
                      >
                        刪除
                      </button>

                    </div>

                  </div>

                </div>

              ))}

          </div>
        )}

      </div>

      <ReportModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSave}
        editingReport={editingReport}
      />

    </>
  );
}