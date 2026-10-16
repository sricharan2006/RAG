import React from 'react';
import {
  MessageSquare,
  FileText,
  GitCompare,
  Bookmark,
  Server,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  backendStatus,
  checkBackendStatus,
  citationCount,
  isCitationsOpen,
  setIsCitationsOpen,
  totalPapers
}) {
  return (
    <header className="app-header">
      {/* Brand */}
      <div className="header-brand">
        <div className="brand-logo-wrap">
          <img src="/logo.svg" alt="PaperMind AI Logo" className="brand-logo" />
        </div>
        <div className="brand-info">
          <div className="brand-title-row">
            <h1 className="brand-name">ResearchMate</h1>
            {/* <span className="brand-badge">RAG AI</span> */}
          </div>
          <p className="brand-subtitle">Research Paper Analyst</p>
        </div>
      </div>

      {/* Main Mode Navigation */}
      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveTab('ask')}
          id="nav-tab-ask"
        >
          <MessageSquare size={16} />
          <span>Q&A Assistant</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          id="nav-tab-summary"
        >
          <FileText size={16} />
          <span>Summarization</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
          id="nav-tab-compare"
        >
          <GitCompare size={16} />
          <span>Paper Compare</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="header-actions">
        {/* Backend Server Status */}
        <div className={`status-pill status-${backendStatus}`}>
          <span className="status-dot"></span>
          <span className="status-label">
            {backendStatus === 'online' ? 'API Online' : backendStatus === 'checking' ? 'Connecting...' : 'API Offline'}
          </span>
          {backendStatus !== 'online' && (
            <button
              className="status-retry-btn"
              onClick={checkBackendStatus}
              title="Retry connection"
            >
              <RefreshCw size={12} className={backendStatus === 'checking' ? 'spinning' : ''} />
            </button>
          )}
        </div>

        {/* Citations Drawer Toggle */}
        <button
          className={`citations-toggle-btn ${isCitationsOpen ? 'active' : ''}`}
          onClick={() => setIsCitationsOpen(!isCitationsOpen)}
          title="Toggle Citations Panel"
          id="btn-toggle-citations"
        >
          <Bookmark size={16} />
          <span className="citations-toggle-text">Citations</span>
          {citationCount > 0 && (
            <span className="citation-counter-pill">{citationCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
