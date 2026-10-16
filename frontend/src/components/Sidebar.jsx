import React, { useState, useRef } from 'react';
import {
  FileUp,
  Trash2,
  Search,
  FileText,
  MessageSquare,
  Layers,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  GitCompare,
  Plus
} from 'lucide-react';

export default function Sidebar({
  papers,
  loadingPapers,
  onUploadPaper,
  onDeletePaper,
  isUploading,
  uploadProgress,
  selectedPaper,
  setSelectedPaper,
  onQuickSummarize,
  onSetComparePaper,
  comparePaperA,
  comparePaperB,
  activeTab,
  setActiveTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paperToDelete, setPaperToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Filter papers based on search
  const filteredPapers = papers.filter(p =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onUploadPaper(files);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      onUploadPaper(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const confirmDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    await onDeletePaper(paperToDelete);
    setIsDeleting(false);
    setPaperToDelete(null);
  };

  return (
    <aside className="app-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-title-group">
            <Layers size={17} className="sidebar-icon-accent" />
            <span className="sidebar-title">Paper Library</span>
          </div>
          <span className="paper-count-badge" title="Total processed papers">
            {papers.length}
          </span>
        </div>

        {/* Global Paper Focus Pill */}
        <div className="global-scope-selector">
          <button
            className={`scope-pill ${!selectedPaper ? 'active' : ''}`}
            onClick={() => setSelectedPaper(null)}
            title="Ask questions across all indexed research papers"
          >
            {/* <Sparkles size={13} /> */}
            <span>All Papers (Global RAG)</span>
          </button>
        </div>
      </div>

      {/* PDF Upload Drop Zone */}
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          multiple
          style={{ display: 'none' }}
          id="pdf-file-input"
        />

        <div
          className={`dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="dropzone-loading">
              <Loader2 size={24} className="spinning text-primary" />
              <div className="dropzone-text-group">
                <p className="dropzone-primary-text">Processing Papers...</p>
                <p className="dropzone-sub-text">{uploadProgress || 'Extracting text & generating embeddings'}</p>
              </div>
            </div>
          ) : (
            <div className="dropzone-content">
              <div className="dropzone-icon-wrap">
                <FileUp size={20} />
              </div>
              <div className="dropzone-text-group">
                <p className="dropzone-primary-text">Upload Research PDFs</p>
                <p className="dropzone-sub-text">Drag & drop or click (select multiple)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Filter */}
      {papers.length > 0 && (
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search-input"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      )}

      {/* Papers List */}
      <div className="papers-list-container">
        {loadingPapers ? (
          <div className="sidebar-loading">
            <Loader2 size={20} className="spinning" />
            <span>Loading library...</span>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="sidebar-empty">
            {papers.length === 0 ? (
              <>
                <FileText size={32} className="empty-icon" />
                <p className="empty-title">No papers yet</p>
                <p className="empty-desc">Upload your first PDF to begin semantic analysis and question answering.</p>
              </>
            ) : (
              <p className="empty-desc">No papers matching "{searchQuery}"</p>
            )}
          </div>
        ) : (
          <div className="papers-list">
            {filteredPapers.map((paper) => {
              const isSelected = selectedPaper === paper;
              const isCompA = comparePaperA === paper;
              const isCompB = comparePaperB === paper;

              return (
                <div
                  key={paper}
                  className={`paper-card ${isSelected ? 'selected' : ''}`}
                >
                  <div
                    className="paper-info-area"
                    onClick={() => setSelectedPaper(isSelected ? null : paper)}
                    title={`Click to ${isSelected ? 'unselect' : 'focus Q&A on this paper'}`}
                  >
                    <div className="paper-icon-wrapper">
                      <FileText size={16} />
                    </div>
                    <div className="paper-details">
                      <span className="paper-name" title={paper}>
                        {paper}
                      </span>
                      <div className="paper-badges">
                        {isSelected && (
                          <span className="badge-focus">Focused for Q&A</span>
                        )}
                        {isCompA && (
                          <span className="badge-compare badge-comp-a">Comp A</span>
                        )}
                        {isCompB && (
                          <span className="badge-compare badge-comp-b">Comp B</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="paper-actions">
                    <button
                      className="paper-action-btn"
                      onClick={() => onQuickSummarize(paper)}
                      title="Summarize this paper"
                    >
                      <Sparkles size={13} />
                    </button>

                    <button
                      className="paper-action-btn"
                      onClick={() => onSetComparePaper(paper)}
                      title="Add to comparison (Paper A or B)"
                    >
                      <GitCompare size={13} />
                    </button>

                    <button
                      className="paper-action-btn btn-delete"
                      onClick={() => setPaperToDelete(paper)}
                      title="Delete paper"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {paperToDelete && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-icon danger">
                <AlertTriangle size={20} />
              </div>
              <h3 className="modal-title">Delete Research Paper?</h3>
            </div>
            <p className="modal-body">
              Are you sure you want to delete <strong className="text-highlight">{paperToDelete}</strong>?
              This will remove the file and all associated embeddings from the vector database.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setPaperToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-confirm-delete"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={15} className="spinning" /> : <Trash2 size={15} />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Paper'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
