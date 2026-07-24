import { FileText, Phone, House, FolderOpen } from "lucide-react";

const cards = [
  {
    title: "今月工作報表",
    value: "0 / 43",
    color: "bg-blue-500",
    icon: FileText,
  },
  {
    title: "今月電訪",
    value: "0 / 43",
    color: "bg-red-500",
    icon: Phone,
  },
  {
    title: "今月家訪",
    value: "0 / 14",
    color: "bg-green-500",
    icon: House,
  },
  {
    title: "今月歸檔",
    value: "0 / 43",
    color: "bg-amber-500",
    icon: FolderOpen,
  },
];

export default function Home() {
  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="text-4xl font-bold mt-3">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`${card.color} rounded-xl p-4 text-white`}
                >
                  <Icon size={28} />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-bold mb-5">
          📌 今日待辦
        </h2>

        <div className="space-y-3">

          <div className="border rounded-lg p-4 flex justify-between">
            <span>洪春福</span>
            <span className="text-red-500">家訪</span>
          </div>

          <div className="border rounded-lg p-4 flex justify-between">
            <span>曾林金雀</span>
            <span className="text-blue-500">工作報表</span>
          </div>

          <div className="border rounded-lg p-4 flex justify-between">
            <span>洪淑真</span>
            <span className="text-green-500">電訪</span>
          </div>

        </div>

      </div>

    </div>
  );
}