import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { readCases } from "../utils/readExcel";

export default function Cases() {
      const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const data = await readCases();
      console.log(data); // 先保留
      setCases(data);
    }

    loadData();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const name = String(Object.values(item)[0] ?? "");

      return name.includes(search);
    });
  }, [cases, search]);

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        個案管理
      </h1>

      <input
        type="text"
        placeholder="搜尋個案..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 shadow"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">姓名</th>
              <th className="text-left p-4">查看</th>
            </tr>
          </thead>

          <tbody>

            {filteredCases.map((item, index) => {

              const name = Object.values(item)[0];

              return (
                <tr key={index} className="border-t">

                  <td className="p-4">
                    {name}
                  </td>

                  <td className="p-4">
<button
  onClick={() => navigate(`/case/${index}`)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  查看
</button>
                  </td>

                </tr>
              );

            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}