import ReportList from "../components/ReportList";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteCase,
  getCaseById,
  updateCase,
} from "../services/caseService";

import {
  removeVisitRecord,
  updateNextVisitPeriod,
} from "../services/visitService";

import {
  removePhoneRecord,
} from "../services/phoneService";

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getCaseById(id);

      if (!data) {
        setPerson(null);
        setForm(null);
        return;
      }

      setPerson(data);
      setForm(createForm(data));
    }

    loadData();
  }, [id]);

  if (!person || !form) {
    return (
      <div className="p-8 text-slate-500">
        找不到個案或資料載入中...
      </div>
    );
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert("請輸入個案姓名");
      return;
    }

    try {
      setSaving(true);

      const nextVisitPeriod =
        form.firstVisitDate
          ? form.firstVisitDate.slice(0, 7)
          : form.nextVisitPeriod;

      const updated = await updateCase({
        ...person,

        name: form.name,
        gender: form.gender,
        age: form.age,
        phone: form.phone,
        address: form.address,
        manager: form.manager,
        firstVisitDate: form.firstVisitDate,
        nextVisitPeriod,

        "個案名稱": form.name,
        "姓名": form.name,
        "性別": form.gender,
        "年齡": form.age,
        "電話": form.phone,
        "地址": form.address,
        "負責人": form.manager,
        "首次家訪日期":
          form.firstVisitDate,
      });

      updateNextVisitPeriod(
        updated.id,
        nextVisitPeriod
      );

      setPerson(updated);
      setForm(createForm(updated));

      window.alert("個案資料已儲存");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `確定要刪除「${form.name}」嗎？\n\n刪除後將無法從個案清單中復原。`
    );

    if (!confirmed) return;

    await deleteCase(person.id);

    removeVisitRecord(person.id);
    removePhoneRecord(person.id);

    navigate("/cases");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            個案詳細資料
          </h1>

          <p className="mt-2 text-slate-500">
            可修改個案資料與家訪安排
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
        >
          刪除個案
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-white p-8 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
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
            options={[
              "",
              "男",
              "女",
              "其他",
            ]}
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

          <FormField
            label="下次家訪月份"
            type="month"
            value={form.nextVisitPeriod}
            onChange={(value) =>
              updateField(
                "nextVisitPeriod",
                value
              )
            }
          />

          <div className="rounded-xl bg-emerald-50 p-5">
            <div className="text-sm font-medium text-emerald-700">
              目前下次家訪
            </div>

            <div className="mt-2 text-xl font-bold text-emerald-800">
              {formatPeriod(
                form.nextVisitPeriod
              )}
            </div>
          </div>

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

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
          完成家訪後，系統會依照設定頁的家訪週期，自動安排下一次家訪月份。
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-7 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "儲存中..."
              : "儲存修改"}
          </button>
        </div>
      </form>

      <ReportList />
    </div>
  );
}

function createForm(person) {
  return {
    name:
      person.name ||
      person["個案名稱"] ||
      person["姓名"] ||
      "",

    gender:
      person.gender ||
      person["性別"] ||
      "",

    age:
      person.age ??
      person["年齡"] ??
      "",

    phone:
      person.phone ||
      person["電話"] ||
      "",

    address:
      person.address ||
      person["地址"] ||
      "",

    manager:
      person.manager ||
      person["負責人"] ||
      "",

    firstVisitDate:
      person.firstVisitDate ||
      person["首次家訪日期"] ||
      "",

    nextVisitPeriod:
      person.nextVisitPeriod ||
      getCurrentPeriod(),
  };
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