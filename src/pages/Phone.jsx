import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCases } from "../services/caseService";

import {
  addPhoneMonths,
  finishPhone,
  formatPhonePeriod,
  getCurrentPhonePeriod,
  getPhoneSchedule,
  undoPhone,
} from "../services/phoneService";

const HISTORY_MONTH_COUNT = 12;

export default function Phone() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const currentPeriod =
    getCurrentPhonePeriod();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const caseData = await getCases();
        const phoneData =
          getPhoneSchedule(caseData);

        setCases(phoneData);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleFinish(caseId) {
    finishPhone(caseId, currentPeriod);

    setCases((previousCases) =>
      previousCases.map((person) => {
        if (
          String(person.id) !== String(caseId)
        ) {
          return person;
        }

        return {
          ...person,
          completedPhonePeriods: Array.from(
            new Set([
              ...(person.completedPhonePeriods || []),
              currentPeriod,
            ])
          ),
        };
      })
    );
  }

  function handleUndo(caseId) {
    undoPhone(caseId, currentPeriod);

    setCases((previousCases) =>
      previousCases.map((person) => {
        if (
          String(person.id) !== String(caseId)
        ) {
          return person;
        }

        return {
          ...person,
          completedPhonePeriods: (
            person.completedPhonePeriods || []
          ).filter(
            (period) =>
              period !== currentPeriod
          ),
        };
      })
    );
  }

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  function matchesSearch(person) {
    if (!normalizedSearch) return true;

    return getPersonName(person)
      .toLowerCase()
      .includes(normalizedSearch);
  }

  const waitingCases = useMemo(() => {
    return cases
      .filter(matchesSearch)
      .filter(
        (person) =>
          !person.completedPhonePeriods?.includes(
            currentPeriod
          )
      )
      .sort(sortByName);
  }, [
    cases,
    normalizedSearch,
    currentPeriod,
  ]);

  const completedCases = useMemo(() => {
    return cases
      .filter(matchesSearch)
      .filter((person) =>
        person.completedPhonePeriods?.includes(
          currentPeriod
        )
      )
      .sort(sortByName);
  }, [
    cases,
    normalizedSearch,
    currentPeriod,
  ]);

  const historyGroups = useMemo(() => {
    return Array.from(
      { length: HISTORY_MONTH_COUNT },
      (_, index) => {
        const period = addPhoneMonths(
          currentPeriod,
          -(index + 1)
        );

        const people = cases
          .filter(matchesSearch)
          .filter((person) =>
            person.completedPhonePeriods?.includes(
              period
            )
          )
          .sort(sortByName);

        return {
          period,
          people,
        };
      }
    ).filter(
      (group) => group.people.length > 0
    );
  }, [
    cases,
    normalizedSearch,
    currentPeriod,
  ]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        電訪名單載入中...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            電訪管理
          </h1>

          <p className="mt-2 text-slate-500">
            {formatPhonePeriod(
              currentPeriod
            )}
          </p>
        </div>

        <div className="flex gap-3">

          <div className="rounded-xl bg-amber-50 px-5 py-3">
            <div className="text-sm text-amber-700">
              待完成
            </div>

            <div className="text-2xl font-bold text-amber-700">
              {waitingCases.length}
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 px-5 py-3">
            <div className="text-sm text-emerald-700">
              已完成
            </div>

            <div className="text-2xl font-bold text-emerald-700">
              {completedCases.length}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 px-5 py-3">
            <div className="text-sm text-blue-700">
              總個案
            </div>

            <div className="text-2xl font-bold text-blue-700">
              {cases.length}
            </div>
          </div>

        </div>

      </div>

      <input
        type="text"
        placeholder="搜尋電訪個案..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <MonthSection
        title={`${formatPhonePeriod(
          currentPeriod
        )}｜本月待電訪`}
        count={waitingCases.length}
        emptyText="本月沒有待電訪個案"
      >
        {waitingCases.map((person) => (
          <button
            type="button"
            key={person.id}
            onClick={() =>
              handleFinish(person.id)
            }
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-lg font-semibold text-slate-800">
              {getPersonName(person)}
            </div>

            <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              完成
            </span>
          </button>
        ))}
      </MonthSection>

      <MonthSection
        title={`${formatPhonePeriod(
          currentPeriod
        )}｜本月已完成`}
        count={completedCases.length}
        emptyText="本月尚無已完成個案"
        muted
      >
        {completedCases.map((person) => (
          <div
            key={person.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-400"
          >
            <div>
              <div className="text-lg font-semibold">
                {getPersonName(person)}
              </div>

              <div className="mt-1 text-sm">
                下個月會自動重新列入待完成
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleUndo(person.id)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              復原
            </button>
          </div>
        ))}
      </MonthSection>

      {historyGroups.length > 0 && (
        <div className="space-y-6">

          <div className="border-b-2 border-slate-400 pb-3">
            <h2 className="text-2xl font-bold text-slate-700">
              歷史完成紀錄
            </h2>
          </div>

          {historyGroups.map((group) => (
            <MonthSection
              key={group.period}
              title={formatPhonePeriod(
                group.period
              )}
              count={group.people.length}
              emptyText=""
              muted
            >
              {group.people.map((person) => (
                <div
                  key={person.id}
                  className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-400"
                >
                  <div className="text-lg font-semibold">
                    {getPersonName(person)}
                  </div>
                </div>
              ))}
            </MonthSection>
          ))}

        </div>
      )}

    </div>
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

function sortByName(a, b) {
  return getPersonName(a).localeCompare(
    getPersonName(b),
    "zh-Hant"
  );
}

function MonthSection({
  title,
  count,
  emptyText,
  muted = false,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow">

      <div
        className={`flex items-center justify-between border-b px-6 py-5 ${
          muted
            ? "bg-slate-100"
            : "bg-slate-50"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            muted
              ? "text-slate-500"
              : "text-slate-800"
          }`}
        >
          {title}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            muted
              ? "bg-slate-200 text-slate-500"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {count} 人
        </span>
      </div>

      <div className="space-y-3 p-6">
        {count === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>

    </section>
  );
}