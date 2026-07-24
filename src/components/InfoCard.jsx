export default function InfoCard({ title, value }) {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <div className="text-gray-500 text-sm">
        {title}
      </div>

      <div className="text-xl font-semibold mt-2 break-words">
        {value || "-"}
      </div>
    </div>
  );
}