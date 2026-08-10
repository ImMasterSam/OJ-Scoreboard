import '../css/Header.css';

export default function Header() {
  return (
    <header className="header">
      <h1>
        OJ 解題統計
      </h1>
      
      {/* Placeholder for Date Slider */}
      <div className="date-slider">
        <span className="date-label">2021/1/12</span>
        <div className="slider-track">
          <div className="slider-thumb-left"></div>
          <div className="slider-thumb-right"></div>
        </div>
        <span className="date-label">2025/1/14</span>
      </div>
    </header>
  );
}
