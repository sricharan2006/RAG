import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Bookmark,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { extractCitations } from '../utils/citationParser';
import MarkdownWithCitations from '../components/MarkdownWithCitations';
import ClearConfirmModal from '../components/ClearConfirmModal';

export default function CompareView({
  papers,
  comparePaperA,
  setComparePaperA,
  comparePaperB,
  setComparePaperB,
  onCompare,
  isComparing,
  comparisonResult,
  onSelectCitation,
  setActiveCitations,
  onShowToast,
  onClearComparison
}) {
  const [focus, setFocus] = useState('');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const focusSuggestions = [
    "Core methodology, novel architecture, and model design",
    "Datasets, evaluation benchmarks, and quantitative performance",
    "Computational efficiency, training complexity, and parameter count",
    "Key limitations, trade-offs, and authors' assumptions"
  ];

  const handleSwap = () => {
    const temp = comparePaperA;
    setComparePaperA(comparePaperB);
    setComparePaperB(temp);
  };

  const handleRunComparison = () => {
    if (!comparePaperA || !comparePaperB) {
      onShowToast?.("Please select both Paper A and Paper B.", "error");
      return;
    }
    if (comparePaperA === comparePaperB) {
      onShowToast?.("Please select two distinct research papers to compare.", "error");
      return;
    }
    if (!focus.trim()) {
      onShowToast?.("Please specify what you would like to compare.", "info");
      return;
    }

    onCompare(comparePaperA, comparePaperB, focus.trim());
  };

  const copyToClipboard = () => {
    if (!comparisonResult?.comparison) return;
    navigator.clipboard.writeText(comparisonResult.comparison);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const citations = comparisonResult?.comparison
    ? extractCitations(comparisonResult.comparison)
    : [];

  // Sync citations panel with the active comparison result to avoid stale citations
  React.useEffect(() => {
    if (comparisonResult?.comparison) {
      setActiveCitations(extractCitations(comparisonResult.comparison));
    } else {
      setActiveCitations([]);
    }
  }, [comparisonResult, setActiveCitations]);

  return (
    <div className="compare-workspace">
      {/* Comparison Setup Panel */}
      <div className="compare-config-panel">
        <div className="compare-selectors-row">
          {/* Paper A */}
          <div className="compare-paper-select-box">
            <span className="compare-box-label label-a">Document A</span>
            <div className="select-wrapper">
              <FileText size={15} className="select-icon" />
              <select
                value={comparePaperA || ''}
                onChange={(e) => setComparePaperA(e.target.value)}
                className="paper-select"
                disabled={isComparing || papers.length === 0}
              >
                <option value="">Select first paper...</option>
                {papers.map((p) => (
                  <option key={p} value={p} disabled={p === comparePaperB}>
                    {p} {p === comparePaperB ? '(Selected as B)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            className="btn-swap-papers"
            onClick={handleSwap}
            disabled={!comparePaperA || !comparePaperB || isComparing}
            title="Swap Paper A and Paper B"
          >
            <ArrowRightLeft size={16} />
          </button>

          {/* Paper B */}
          <div className="compare-paper-select-box">
            <span className="compare-box-label label-b">Document B</span>
            <div className="select-wrapper">
              <FileText size={15} className="select-icon" />
              <select
                value={comparePaperB || ''}
                onChange={(e) => setComparePaperB(e.target.value)}
                className="paper-select"
                disabled={isComparing || papers.length === 0}
              >
                <option value="">Select second paper...</option>
                {papers.map((p) => (
                  <option key={p} value={p} disabled={p === comparePaperA}>
                    {p} {p === comparePaperA ? '(Selected as A)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Focus Input */}
        <div className="compare-focus-row">
          <div className="focus-input-group">
            <label className="focus-label">Comparison Focus & Criteria:</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Compare methodology, model architecture, training compute, and benchmarks..."
              className="focus-text-input"
              disabled={isComparing}
              onKeyDown={(e) => e.key === 'Enter' && handleRunComparison()}
            />
          </div>

          <button
            className="btn-primary-action btn-run-compare"
            onClick={handleRunComparison}
            disabled={!comparePaperA || !comparePaperB || !focus.trim() || isComparing}
            id="btn-run-compare"
          >
            {isComparing ? (
              <>
                <Loader2 size={16} className="spinning" />
                <span>Comparing Documents...</span>
              </>
            ) : (
              <>
                <GitCompare size={16} />
                <span>Run Comparison</span>
              </>
            )}
          </button>

          {comparisonResult && (
            <button
              className="btn-clear-chat"
              onClick={() => setShowClearConfirm(true)}
              title="Clear comparison result and citations"
              id="btn-clear-compare"
            >
              <RotateCcw size={13} />
              <span>Clear Comparison</span>
            </button>
          )}
        </div>

        {/* Preset Suggestions */}
        <div className="compare-presets-row">
          <span className="presets-label">Quick Criteria:</span>
          <div className="preset-buttons">
            {focusSuggestions.map((item, idx) => (
              <button
                key={idx}
                className="preset-btn"
                onClick={() => setFocus(item)}
                disabled={isComparing}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Results Area */}
      {(isComparing || comparisonResult) && (
        <div className="compare-results-container">
          {isComparing ? (
            <div className="compare-loading-state animate-fade-in">
              <Loader2 size={36} className="spinning text-primary" />
              <h3>Comparing Research Papers</h3>
              <p>
                Finding the key similarities and differences between two research papers, with supporting evidence...
              </p>
            </div>
          ) : (
            <div className="compare-result-card animate-fade-in">
              {/* Header */}
              <div className="compare-card-header">
                <div className="compare-card-meta">
                  <span className="compare-tag">Cross-Document Comparative Analysis</span>
                  <div className="compared-papers-row">
                    <span className="pill-paper pill-paper-a">
                      <strong>A:</strong> {comparisonResult.source_a}
                    </span>
                    <span className="vs-badge">VS</span>
                    <span className="pill-paper pill-paper-b">
                      <strong>B:</strong> {comparisonResult.source_b}
                    </span>
                  </div>
                  <p className="active-focus-text">
                    <strong>Focus:</strong> "{comparisonResult.comparison_focus}"
                  </p>
                </div>

                <div className="compare-card-actions">
                  {citations.length > 0 && (
                    <button
                      className="summary-citations-badge"
                      onClick={() => setActiveCitations(citations)}
                      title="View citations in side panel"
                    >
                      <Bookmark size={13} />
                      <span>{citations.length} Citations</span>
                    </button>
                  )}
                  <button
                    className="icon-action-btn"
                    onClick={copyToClipboard}
                    title="Copy comparison"
                  >
                    {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Color-Coded Markdown Body */}
              <MarkdownWithCitations
                content={comparisonResult.comparison}
                onSelectCitation={(cit) => {
                  setActiveCitations(citations);
                  onSelectCitation(cit);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Clear Comparison Confirmation Modal */}
      <ClearConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearComparison?.();
          setShowClearConfirm(false);
        }}
        title="Clear Comparison Results?"
        description="This will clear the comparative analysis and cross-document citations. Your uploaded research papers, embeddings, and library will remain completely safe."
        confirmText="Clear Comparison"
      />
    </div>
  );
}
