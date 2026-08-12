import '../css/Header.css';
import KpiCards from './KpiCards';

interface HeaderProps {
  activeTab?: 'dashboard' | 'source-code';
  setActiveTab?: (tab: 'dashboard' | 'source-code') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo-title">
          <img src="./favicon.svg" alt="logo" className="header-logo" />
          <h1>
            Online Judge 解題統計
          </h1>
        </div>

        {setActiveTab && activeTab && (
          <div className="segmented-control" style={{ marginTop: '4px' }}>
            <button
              className={`segmented-control-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('dashboard'); }}
            >
              Dashboard
            </button>
            <button
              className={`segmented-control-btn ${activeTab === 'source-code' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('source-code'); }}
            >
              Source Code
            </button>
          </div>
        )}
      </div>

      <div className="header-center">
        <KpiCards />
      </div>

      <div className="header-right">
        <a href="https://github.com/ImMasterSam/OJ-Dashboard" target="_blank" rel="noopener noreferrer" className="github-link">
          <img src="./github.svg" alt="GitHub Repo" width={50} height={50} className="github-icon" />
        </a>
      </div>
    </header>
  );
}
