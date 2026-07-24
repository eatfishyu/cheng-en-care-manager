import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";

import {
  addCase,
  getCases,
} from "../services/caseService";

export default function Cases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getCases();
      setCases(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCases = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return cases;

    return cases.filter((person) => {
      const text = [
        getPersonName(person),
        person.address,
        person["地址"],
        person.phone,
        person["電話"],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [cases, search]);

  async function handleAdd(form) {
    const newCase = await addCase(form);

    setCases((previous) => [
      ...previous,
      newCase,
    ]);

    setOpen(false);
    navigate(`/case/${newCase.id}`);
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        個案資料載入中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            個案管理
          </h1>

          <p className="mt-2 text-slate-500">
            目前共 {cases.length} 位個案
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={19} />
          新增個案
        </button>
      </div>

      <div className="relative">
        <Search
          size={19}
          className="absolute left-4 top-3.5 text-slate-400"
        />

        <input
          type="text"
          placeholder="搜尋姓名、地址或電話..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                姓名
              </th>

              <th className="p-4 text-left">
                性別
              </th>

              <th className="p-4 text-left">
                年齡
              </th>

              <th className="p-4 text-left">
                電話
              </th>

              <th className="p-4 text-left">
                下次家訪
              </th>

              <th className="p-4 text-right">
                操作
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredCases.map((person) => (
              <tr
                key={person.id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-4 font-semibold text-slate-800">
                  {getPersonName(person)}
                </td>

                <td className="p-4 text-slate-600">
                  {person.gender ||
                    person["性別"] ||
                    "未設定"}
                </td>

                <td className="p-4 text-slate-600">
                  {person.age ||
                    person["年齡"] ||
                    "未設定"}
                </td>

                <td className="p-4 text-slate-600">
                  {person.phone ||
                    person["電話"] ||
                    "未設定"}
                </td>

                <td className="p-4 text-slate-600">
                  {formatPeriod(
                    person.nextVisitPeriod
                  )}
                </td>

                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/case/${person.id}`
                      )
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    查看／編輯
                  </button>
                </td>
              </tr>
            ))}

            {filteredCases.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-slate-400"
                >
                  找不到符合的個案
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CaseFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}

function CaseFormModal({
  open,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    createEmptyForm()
  );

  useEffect(() => {
    if (open) {
      setForm(createEmptyForm());
    }
  }, [open]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert("請輸入個案姓名");
      return;
    }

    onSave({
      ...form,
      nextVisitPeriod:
        form.firstVisitDate.slice(0, 7) ||
        getCurrentPeriod(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-7 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            新增個案
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField
            label="個案姓名"
            required
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
          />

          <SelectField
            label="性別"
            value={form.gender}
            onChange={(value) =>
              updateField("gender", value)
            }
            options={["", "男", "女", "其他"]}
          />

          <FormField
            label="年齡"
            type="number"
            min="0"
            max="150"
            value={form.age}
            onChange={(value) =>
              updateField("age", value)
            }
          />

          <FormField
            label="電話"
            value={form.phone}
            onChange={(value) =>
              updateField("phone", value)
            }
          />

          <FormField
            label="負責人"
            value={form.manager}
            onChange={(value) =>
              updateField("manager", value)
            }
          />

          <FormField
            label="首次家訪日期"
            type="date"
            value={form.firstVisitDate}
            onChange={(value) =>
              updateField(
                "firstVisitDate",
                value
              )
            }
          />

          <div className="md:col-span-2">
            <FormField
              label="地址"
              value={form.address}
              onChange={(value) =>
                updateField("address", value)
              }
            />
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          首次家訪日期設定後，完成家訪時會依照設定頁的家訪週期自動安排下次月份。
        </p>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            儲存個案
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  ...inputProps
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...inputProps}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={option || "empty"}
            value={option}
          >
            {option || "請選擇"}
          </option>
        ))}
      </select>
    </label>
  );
}

function createEmptyForm() {
  return {
    name: "",
    gender: "",
    age: "",
    phone: "",
    address: "",
    manager: "",
    firstVisitDate: "",
  };
}

function getCurrentPeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatPeriod(period) {
  if (!period) return "未設定";

  const [year, month] = period
    .split("-")
    .map(Number);

  return `${year - 1911}年${month}月`;
}

function getPersonName(person) {
  return (
    person.name ||
    person["個案名稱"] ||
    person["姓名"] ||
    "未命名個案"
  );
}