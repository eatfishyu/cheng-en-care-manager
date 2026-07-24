import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>🏠 承恩居督管理系統</h1>

      <div className="card">
        <h2>📋 今月工作報表</h2>
        <p>0 / 43</p>
      </div>

      <div className="card">
        <h2>📞 今月電訪</h2>
        <p>0 / 43</p>
      </div>

      <div className="card">
        <h2>🏠 今月家訪</h2>
        <p>0 / 14</p>
      </div>

      <div className="card">
        <h2>📂 今月歸檔</h2>
        <p>0 / 0</p>
      </div>

      <div className="card">
        <h2>🔍 搜尋個案</h2>
        <input type="text" placeholder="輸入個案姓名..." />
      </div>
    </div>
  );
}

export default App;