import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  House,
  Phone,
  Search,
  Users,
} from "lucide-react";

import { useSettings } from "../contexts/SettingsContext";
import { getCases } from "../services/caseService";
import { getReports } from "../services/reportService";
import {
  getCurrentPhonePeriod,
  getPhoneSchedule,
} from "../services/phoneService";
import {
  getCurrentPeriod,
  getVisitSchedule,
} from "../services/visitService";

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [cases, setCases] = useState([]);
  const [phoneCases, setPhoneCases] = useState([]);
  const [visitCases, setVisitCases] = useState([]);
  const [reportCompletedIds, setReportCompletedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const currentPhonePeriod = getCurrentPhonePeriod();
  const currentVisitPeriod = getCurrentPeriod();
  const currentReportMonth = getCurrentYearMonth();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const caseData = await getCases();

        setCases(caseData);
        setPhoneCases(getPhoneSchedule(caseData));
        setVisitCases(getVisitSchedule(caseData));

        const completedIds = [];

        for (const person of caseData) {
          const reports = await Promise.resolve(getReports(person.id));
          const completed = (reports || []).some((report) =>
            String(report.date || "").startsWith(currentReportMonth)
          );

          if (completed) completedIds.push(String(person.id));
        }

        setReportCompletedIds(completedIds);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [currentReportMonth]);

  const waitingPhoneCases = useMemo(
    () =>
      phoneCases.filter(
        (person) =>
          !person.completedPhonePeriods?.includes(currentPhonePeriod)
      ),
    [phoneCases, currentPhonePeriod]
  );

  const completedPhoneCases = useMemo(
    () =>
      phoneCases.filter((person) =>
        person.completedPhonePeriods?.includes(currentPhonePeriod)
      ),
    [phoneCases, currentPhonePeriod]
  );

  const waitingVisitCases = useMemo(
    () =>
      visitCases.filter((person) => {
        const completed = person.completedPeriods?.includes(currentVisitPeriod);
        return !completed && person.nextVisitPeriod <= currentVisitPeriod;
      }),
    [visitCases, currentVisitPeriod]
  );

  const completedVisitCases = useMemo(
    () =>
      visitCases.filter((person) =>
        person.completedPeriods?.includes(currentVisitPeriod)
      ),
    [visitCases, currentVisitPeriod]
  );

  const reportWaitingCases = useMemo(
    () =>
      cases.filter(
        (person) => !reportCompletedIds.includes(String(person.id))
      ),
    [cases, reportCompletedIds]
  );

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];

    return cases
      .filter((person) => {
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
      })
      .slice(0, 8);
  }, [cases, search]);

  const phoneRate = percentage(completedPhoneCases.length, phoneCases.length);
  const visitTotal = waitingVisitCases.length + completedVisitCases.length;
  const visitRate = percentage(completedVisitCases.length, visitTotal);

  if (loading) {
    return <div className="p-8 text-slate-500">首頁資料載入中...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-7 shadow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">今日工作總覽</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-800">
              👋 {settings.supervisorName || "督導"}，{getGreeting()}！
            </h1>

            {settings.home.showToday && (
              <p className="mt-2 text-slate-500">{formatToday()}</p>
            )}
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              size={19}
              className="absolute left-4 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜尋個案姓名、地址或電話..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {search.trim() && (
              <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {searchResults.length === 0 ? (
                  <div className="p-5 text-center text-slate-400">
                    找不到符合的個案
                  </div>
                ) : (
                  searchResults.map((person) => (
                    <button
                      type="button"
                      key={person.id}
                      onClick={() => navigate(`/case/${person.id}`)}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left last:border-0 hover:bg-blue-50"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {getPersonName(person)}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {person.address || person["地址"] || "未填寫地址"}
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {settings.home.showReminder && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="font-bold text-amber-800">本月工作提醒</div>
          <div className="mt-2 text-amber-700">
            每位個案每月需完成一次電訪，並依設定週期完成家訪。
            目前尚有 {waitingPhoneCases.length} 位待電訪、
            {waitingVisitCases.length} 位待家訪。
          </div>
        </section>
      )}

      {settings.home.showDashboardCards && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="總個案"
            value={cases.length}
            subtitle="目前管理中的個案"
            icon={Users}
            onClick={() => navigate("/cases")}
          />

          {settings.home.showPhone && (
            <DashboardCard
              title="本月待電訪"
              value={waitingPhoneCases.length}
              subtitle={`已完成 ${completedPhoneCases.length} 人`}
              icon={Phone}
              onClick={() => navigate("/phone")}
            />
          )}

          {settings.home.showVisit && (
            <DashboardCard
              title="本月待家訪"
              value={waitingVisitCases.length}
              subtitle={`已完成 ${completedVisitCases.length} 人`}
              icon={House}
              onClick={() => navigate("/visit")}
            />
          )}

          <DashboardCard
            title="待工作報表"
            value={reportWaitingCases.length}
            subtitle={`本月已有 ${reportCompletedIds.length} 人`}
            icon={FileText}
            onClick={() => navigate("/cases")}
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        {settings.home.showPhone && (
          <TaskList
            title="本月待電訪"
            people={waitingPhoneCases}
            emptyText="本月電訪皆已完成"
            onViewAll={() => navigate("/phone")}
            onPersonClick={(person) => navigate(`/case/${person.id}`)}
          />
        )}

        {settings.home.showVisit && (
          <TaskList
            title="本月待家訪"
            people={waitingVisitCases}
            emptyText="本月家訪皆已完成"
            onViewAll={() => navigate("/visit")}
            onPersonClick={(person) => navigate(`/case/${person.id}`)}
            showVisitPeriod
          />
        )}
      </section>

      {settings.home.showCompletionRate && (
        <section className="grid gap-6 xl:grid-cols-2">
          {settings.home.showPhone && (
            <ProgressPanel
              title="本月電訪完成率"
              completed={completedPhoneCases.length}
              total={phoneCases.length}
              rate={phoneRate}
              onClick={() => navigate("/phone")}
            />
          )}

          {settings.home.showVisit && (
            <ProgressPanel
              title="本月家訪完成率"
              completed={completedVisitCases.length}
              total={visitTotal}
              rate={visitRate}
              onClick={() => navigate("/visit")}
            />
          )}
        </section>
      )}
    </div>
  );
}

function DashboardCard({ title, value, subtitle, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-slate-600">{title}</p>
          <div className="mt-3 text-4xl font-bold text-blue-700">{value}</div>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-blue-600 p-3 text-white">
          <Icon size={23} />
        </div>
      </div>
    </button>
  );
}

function TaskList({
  title,
  people,
  emptyText,
  onViewAll,
  onPersonClick,
  showVisitPeriod = false,
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {people.length} 人
        </span>
      </div>

      <div className="space-y-3 p-6">
        {people.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            {emptyText}
          </div>
        ) : (
          people.slice(0, 6).map((person) => (
            <button
              type="button"
              key={person.id}
              onClick={() => onPersonClick(person)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50"
            >
              <div>
                <div className="font-semibold text-slate-800">
                  {getPersonName(person)}
                </div>
                {showVisitPeriod && (
                  <div className="mt-1 text-sm text-slate-500">
                    原訂：{formatPeriod(person.nextVisitPeriod)}
                  </div>
                )}
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>
          ))
        )}

        <button
          type="button"
          onClick={onViewAll}
          className="w-full rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-700 hover:bg-slate-200"
        >
          查看全部
        </button>
      </div>
    </section>
  );
}

function ProgressPanel({ title, completed, total, rate, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-white p-6 text-left shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <span className="text-2xl font-bold text-blue-700">{rate}%</span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${rate}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        已完成 {completed}／{total} 人
      </p>
    </button>
  );
}

function getPersonName(person) {
  return (
    person.name ||
    person["個案名稱"] ||
    person["姓名"] ||
    "未命名個案"
  );
}

function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatToday() {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

function percentage(completed, total) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

function formatPeriod(period) {
  if (!period) return "未設定";
  const [year, month] = period.split("-").map(Number);
  return `${year - 1911}年${month}月`;
}
