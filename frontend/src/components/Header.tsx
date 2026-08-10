import '../css/Header.css';
import KpiCards from './KpiCards';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src="./favicon.svg" alt="logo" className="header-logo" />
        <h1>
          Online Judge 解題統計
        </h1>
      </div>

      <div className="header-center">
        <KpiCards />
      </div>

      <div className="header-right">
        <a href="https://github.com/ImMasterSam/OJ-Scoreboard" target="_blank" rel="noopener noreferrer" className="github-link">
          <img src="./github.svg" alt="GitHub Repo" width={50} height={50} className="github-icon" />
        </a>
      </div>
    </header>
  );
}
