import ReportList from "../components/ReportList";
import InfoCard from "../components/InfoCard";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCaseById } from "../services/caseService";

export default function CaseDetail() {
  const { id } = useParams();

  const [person, setPerson] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getCaseById(id);
      setPerson(data);
    }

    loadData();
  }, [id]);

  if (!person) return <div className="p-8">載入中...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        個案詳細資料
      </h1>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="grid grid-cols-2 gap-6">

          <InfoCard
            title="個案姓名"
            value={person["個案名稱"]}
          />

          <InfoCard
            title="負責人"
            value={person["負責人"]}
          />

          <InfoCard
            title="家訪月份"
            value={person["家訪"]}
          />

          <InfoCard
            title="地址"
            value={person["地址"]}
          />

        </div>

      </div>

      <ReportList />

    </div>
  );
}