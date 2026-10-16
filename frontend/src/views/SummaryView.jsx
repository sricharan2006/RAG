import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Bookmark,
  Clock,
  Download,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { extractCitations } from '../utils/citationParser';
import MarkdownWithCitations from '../components/MarkdownWithCitations';
import ClearConfirmModal from '../components/ClearConfirmModal';

export default function SummaryView({
  papers,
  selectedPaper,
  setSelectedPaper,
  onSummarize,
  isSummarizing,
  summaries,
  onSelectCitation,
  setActiveCitations,
  onClearSummary
}) {
  const [activePaper, setActivePaper] = useState(selectedPaper || (papers[0] || ''));
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync if selectedPaper changes externally
  React.useEffect(() => {
    if (selectedPaper) {
      setActivePaper(selectedPaper);
    } else if (!activePaper && papers.length > 0) {
      setActivePaper(papers[0]);
    }
  }, [selectedPaper, papers]);

  const currentSummary = summaries[activePaper];

  // Sync citations panel with the active paper summary to avoid stale citations
  React.useEffect(() => {
    if (currentSummary) {
      setActiveCitations(extractCitations(currentSummary, activePaper));
    } else {
      setActiveCitations([]);
    }
  }, [activePaper, currentSummary, setActiveCitations]);

  const handleGenerate = () => {
    if (!activePaper || isSummarizing) return;
    onSummarize(activePaper);
  };

  const copyToClipboard = () => {
    if (!currentSummary) return;
    navigator.clipboard.writeText(currentSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    if (!currentSummary) return;
    const blob = new Blob([`# Summary: ${activePaper}\n\n${currentSummary}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePaper.replace('.pdf', '')}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const citations = currentSummary ? extractCitations(currentSummary, activePaper) : [];

  return (
    <div className="summary-workspace">
      {/* Header Controls */}
      <div className="workspace-subbar">
        <div className="summary-controls-row">
          <div className="control-group">
            <span className="control-label">Select Paper:</span>
            <select
              value={activePaper}
              onChange={(e) => {
                setActivePaper(e.target.value);
                setSelectedPaper(e.target.value);
              }}
              className="paper-select summary-select"
              disabled={isSummarizing || papers.length === 0}
            >
              {papers.length === 0 ? (
                <option value="">No papers available</option>
              ) : (
                papers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            className="btn-primary-action"
            onClick={handleGenerate}
            disabled={!activePaper || isSummarizing}
            id="btn-generate-summary"
          >
            {isSummarizing ? (
              <>
                <Loader2 size={16} className="spinning" />
                <span>Synthesizing Document...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{currentSummary ? 'Regenerate Summary' : 'Generate Paper Summary'}</span>
              </>
            )}
          </button>

          {currentSummary && (
            <button
              className="btn-clear-chat"
              onClick={() => setShowClearConfirm(true)}
              title="Clear summary and citations for this document"
              id="btn-clear-summary"
            >
              <RotateCcw size={13} />
              <span>Clear Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Summary Confirmation Modal */}
      <ClearConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearSummary?.(activePaper);
          setShowClearConfirm(false);
        }}
        title="Clear Paper Summary?"
        description="This will clear the generated summary and citations for this document. Your uploaded research papers, embeddings, and library will remain completely safe."
        confirmText="Clear Summary"
      />

      {/* Main Content Area */}
      <div className="summary-content-container">
        {isSummarizing ? (
          <div className="summary-loading-state animate-fade-in">
            <div className="loading-card">
              <Loader2 size={40} className="spinning text-primary" />
              <h3>Analyzing Complete Research Paper</h3>
              <p>
                Extracting core problem statement, novel methodology, experimental benchmarks,
                and author conclusions with verified page citations...
              </p>
            </div>
          </div>
        ) : !currentSummary ? (
          <div className="summary-empty-state">
            <div className="empty-hero-icon">
              <FileText size={38} className="text-primary-light" />
            </div>
            <h2>Summarizing Document</h2>
            <p>
              Get a clear summary of a research paper, including the main problem, the approach used, key findings, and conclusions, with page citations
            </p>
            {papers.length > 0 && activePaper && (
              <button
                className="btn-hero-action"
                onClick={handleGenerate}
              >
                <Sparkles size={16} />
                <span>Summarize {activePaper}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="summary-display-card animate-fade-in">
            {/* Summary Card Header */}
            <div className="summary-card-header">
              <div className="summary-meta-group">
                <span className="summary-tag">Synthesized Research Document</span>
                <h2 className="summary-paper-title">{activePaper}</h2>
              </div>

              <div className="summary-card-actions">
                {citations.length > 0 && (
                  <button
                    className="summary-citations-badge"
                    onClick={() => setActiveCitations(citations)}
                    title="View all citations in side panel"
                  >
                    <Bookmark size={13} />
                    <span>{citations.length} Citations</span>
                  </button>
                )}
                <button
                  className="icon-action-btn"
                  onClick={copyToClipboard}
                  title="Copy markdown summary"
                >
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
                <button
                  className="icon-action-btn"
                  onClick={downloadSummary}
                  title="Download as Markdown"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Color-Coded Markdown Summary Content */}
            <MarkdownWithCitations
              content={currentSummary}
              defaultSource={activePaper}
              onSelectCitation={(cit) => {
                setActiveCitations(citations);
                onSelectCitation(cit);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
