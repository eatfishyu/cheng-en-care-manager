import { useState } from "react";
import { useParams } from "react-router-dom";
import ReportModal from "./ReportModal";
import {
  getReports,
  addReport,
  deleteReport,
} from "../services/reportService";

export default function ReportList() {
  const { id } = useParams();

  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState(getReports(id));

  function refresh() {
    setReports([...getReports(id)]);
  }

  function handleSave(report) {
    addReport(id, report);
    refresh();
  }

  function handleDelete(reportId) {
    if (!confirm("確定刪除此工作報表？")) return;

    deleteReport(id, reportId);
    refresh();
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            工作報表
          </h2>

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            ＋新增
          </button>

        </div>

        {reports.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-slate-400">
            尚無工作報表
          </div>
        ) : (
          <div className="space-y-4">

            {reports.map((report) => (

              <div
                key={report.id}
                className="border rounded-xl p-5"
              >

                <div className="flex justify-between">

                  <div className="font-bold text-blue-600">
                    {report.date}
                  </div>

                  <button
                    onClick={() => handleDelete(report.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    刪除
                  </button>

                </div>

                <div className="mt-3 whitespace-pre-wrap">
                  {report.content}
                </div>

                {report.note && (
                  <div className="mt-3 text-slate-500">
                    備註：{report.note}
                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </div>

      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}