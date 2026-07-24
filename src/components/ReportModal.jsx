import { useEffect, useState } from "react";

export default function ReportModal({
  open,
  onClose,
  onSave,
  editingReport,
}) {
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (editingReport) {
      setDate(editingReport.date);
      setContent(editingReport.content);
      setNote(editingReport.note || "");
    } else {
      setDate("");
      setContent("");
      setNote("");
    }
  }, [editingReport, open]);

  if (!open) return null;

  function handleSave() {
    if (!date || !content) {
      alert("請填寫日期及工作內容");
      return;
    }

    onSave({
      id: editingReport?.id || Date.now(),
      date,
      content,
      note,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-[700px] p-8">

        <h2 className="text-2xl font-bold mb-6">
          {editingReport ? "編輯工作報表" : "新增工作報表"}
        </h2>

        <div className="space-y-5">

          <div>
            <label className="block mb-2 font-medium">
              日期
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              工作內容
            </label>

            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              備註
            </label>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border rounded-lg px-5 py-2"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white rounded-lg px-5 py-2"
          >
            儲存
          </button>

        </div>

      </div>

    </div>
  );
}