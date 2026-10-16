import React, { useState } from 'react';
import {
  Bookmark,
  X,
  FileText,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Search,
  BookOpen
} from 'lucide-react';
import { getSourceColorPalette } from '../utils/sourceColors';

export default function CitationsPanel({
  citations,
  isOpen,
  onClose,
  highlightedCitation,
  onClearHighlight,
  onSelectCitation
}) {
  const [filterSource, setFilterSource] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  // Extract unique sources in citations
  const uniqueSources = Array.from(new Set(citations.map(c => c.source)));

  // Reset filter if active filter source is no longer present in current citations
  React.useEffect(() => {
    if (filterSource !== 'ALL' && !uniqueSources.includes(filterSource)) {
      setFilterSource('ALL');
    }
  }, [uniqueSources, filterSource]);

  // If highlighted citation belongs to another source than currently filtered, switch filter to ALL so it is visible and scroll to card
  React.useEffect(() => {
    if (highlightedCitation) {
      if (filterSource !== 'ALL' && highlightedCitation.source && highlightedCitation.source !== filterSource) {
        setFilterSource('ALL');
      }

      const cardId = highlightedCitation.id ? `citation-card-${highlightedCitation.id}` : null;
      const timer = setTimeout(() => {
        let cardEl = cardId ? document.getElementById(cardId) : null;
        if (!cardEl && highlightedCitation.source && highlightedCitation.page) {
          cardEl = document.querySelector(`[data-cit-source="${highlightedCitation.source}"][data-cit-page="${highlightedCitation.page}"]`);
        }
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 70);

      return () => clearTimeout(timer);
    }
  }, [highlightedCitation, filterSource]);

  const filteredCitations = filterSource === 'ALL'
    ? citations
    : citations.filter(c => c.source === filterSource);

  const isCitationMatch = (c, target) => {
    if (!target) return false;
    if (target.id && c.id && target.id === c.id) return true;
    return (
      c.source === target.source &&
      c.page === target.page &&
      (!target.section || !c.section || target.section === c.section)
    );
  };

  const handleCopyCitation = (cit) => {
    navigator.clipboard.writeText(cit.raw);
    setCopiedId(cit.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <aside className="citations-panel animate-fade-in" id="panel-citations">
      {/* Panel Header */}
      <div className="citations-header">
        <div className="citations-title-wrap">
          <Bookmark size={18} className="text-primary-light" />
          <h2 className="citations-title">Sources & Citations</h2>
          <span className="citations-badge">{citations.length}</span>
        </div>
        <button
          className="citations-close-btn"
          onClick={onClose}
          title="Close citations panel"
        >
          <X size={16} />
        </button>
      </div>

      <p className="citations-subtitle">
        Grounded citations extracted from vector chunks and LLM synthesis.
      </p>

      {/* Filter by Paper (if multiple papers cited) */}
      {uniqueSources.length > 1 && (
        <div className="citations-filter-row">
          <button
            className={`filter-source-btn ${filterSource === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterSource('ALL')}
          >
            All ({citations.length})
          </button>
          {uniqueSources.map(src => (
            <button
              key={src}
              className={`filter-source-btn ${filterSource === src ? 'active' : ''}`}
              onClick={() => setFilterSource(src)}
              title={src}
            >
              {src.length > 16 ? src.slice(0, 14) + '...' : src}
            </button>
          ))}
        </div>
      )}

      {/* Citations List */}
      <div className="citations-body">
        {citations.length === 0 ? (
          <div className="citations-empty">
            <BookOpen size={32} className="empty-icon" />
            <p className="empty-title">No Citations Yet</p>
            <p className="empty-desc">
              When you ask questions, generate summaries, or compare documents,
              referenced pages and sections will be cataloged here.
            </p>
          </div>
        ) : (
          <div className="citations-cards-list">
            {filteredCitations.map((cit) => {
              const isHighlighted = isCitationMatch(cit, highlightedCitation);
              const palette = getSourceColorPalette(cit.source);

              return (
                <div
                  key={cit.id}
                  id={`citation-card-${cit.id}`}
                  data-cit-source={cit.source}
                  data-cit-page={cit.page}
                  className={`citation-card ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={() => {
                    if (isHighlighted) {
                      onClearHighlight?.();
                    } else if (onSelectCitation) {
                      onSelectCitation(cit);
                    }
                  }}
                >
                  <div className="citation-card-top">
                    <span className={`citation-source-badge palette-${palette.id}`}>
                      <FileText size={14} />
                      <span className="source-truncate" title={cit.source}>{cit.source}</span>
                    </span>

                    <button
                      className="citation-copy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCitation(cit);
                      }}
                      title="Copy citation format"
                    >
                      {copiedId === cit.id ? (
                        <Check size={13} className="text-success" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <div className="citation-meta-tags">
                    <span className="citation-tag tag-page">
                      Page {cit.page}
                    </span>
                    {cit.section && (
                      <span className="citation-tag tag-section" title={cit.section}>
                        Section: {cit.section}
                      </span>
                    )}
                    {cit.occurrences > 1 && (
                      <span className="citation-tag tag-occurrences">
                        {cit.occurrences}× cited
                      </span>
                    )}
                  </div>

                  <div className="citation-raw-text">
                    <code>{cit.raw}</code>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
