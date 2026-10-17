import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Bookmark, 
  RefreshCw, 
  Layers, 
  FileText,
  CornerDownLeft,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { extractCitations } from '../utils/citationParser';
import MarkdownWithCitations from '../components/MarkdownWithCitations';
import ClearConfirmModal from '../components/ClearConfirmModal';

export default function AskView({
  papers,
  selectedPaper,
  setSelectedPaper,
  onAskQuestion,
  isAsking,
  chatHistory,
  setChatHistory,
  onClearChat,
  onSelectCitation,
  setActiveCitations
}) {
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const samplePrompts = [
    "What is the primary contribution and core novelty of this paper?",
    "Explain the architecture, methodology, and experimental pipeline.",
    "What benchmarks, datasets, and baseline comparisons were evaluated?",
    "What limitations or weaknesses do the authors acknowledge?",
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAsking]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputQuestion.trim() || isAsking) return;

    const question = inputQuestion.trim();
    setInputQuestion('');
    onAskQuestion(question, selectedPaper);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePromptClick = (prompt) => {
    setInputQuestion(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="ask-workspace">
      {/* Scope Bar */}
      <div className="workspace-subbar">
        <div className="scope-indicator">
          <span className="scope-label">Query Target:</span>
          {selectedPaper ? (
            <div className="scope-current-badge">
              <FileText size={13} className="text-primary-light" />
              <span className="scope-paper-name">{selectedPaper}</span>
              <button 
                className="scope-reset-btn" 
                onClick={() => setSelectedPaper(null)}
                title="Switch back to searching all papers"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="scope-current-badge scope-global">
              <Layers size={13} />
              <span>All Uploaded Papers (Multi-Document Search)</span>
            </div>
          )}
        </div>

        <div className="subbar-actions">
          {papers.length > 0 && (
            <div className="scope-selector-dropdown">
              <select
                value={selectedPaper || ''}
                onChange={(e) => setSelectedPaper(e.target.value || null)}
                className="paper-select"
              >
                <option value="">Search across all papers</option>
                {papers.map((p) => (
                  <option key={p} value={p}>
                    Filter: {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {chatHistory.length > 0 && (
            <button
              className="btn-clear-chat"
              onClick={() => setShowClearConfirm(true)}
              title="Clear all messages in current conversation"
            >
              <RotateCcw size={13} />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      <ClearConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={onClearChat}
        title="Clear Chat History?"
        description="This will reset the current conversation messages and citations. Your uploaded research papers, embeddings, and summaries will remain completely safe."
        confirmText="Clear Chat"
      />

      {/* Chat Area */}
      <div className="chat-messages-container">
        {chatHistory.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-hero-icon">
              <Sparkles size={36} className="text-primary-light" />
            </div>
            <h2 className="empty-hero-title">RAG Research Paper Intelligence</h2>
            <p className="empty-hero-subtitle">
              Ask questions backed by exact vector retrieval, grounded citations, and multi-document synthesis.
            </p>

            <div className="suggested-prompts-section">
              <span className="suggested-title">Suggested Inquiries:</span>
              <div className="suggested-grid">
                {samplePrompts.map((prompt, i) => (
                  <button 
                    key={i} 
                    className="suggested-prompt-card"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    <ArrowRight size={14} className="suggested-icon" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-thread">
            {chatHistory.map((item, idx) => {
              const citations = extractCitations(item.answer, item.source);

              return (
                <div key={idx} className="chat-exchange animate-fade-in">
                  {/* User Question */}
                  <div className="message-row message-user">
                    <div className="message-avatar user-avatar">
                      <User size={16} />
                    </div>
                    <div className="message-bubble user-bubble">
                      <div className="user-message-header">
                        <span className="message-sender">You</span>
                        {item.source && (
                          <span className="source-tag">Target: {item.source}</span>
                        )}
                      </div>
                      <p className="user-message-text">{item.question}</p>
                    </div>
                  </div>

                  {/* Assistant Answer */}
                  <div className="message-row message-assistant">
                    <div className="message-avatar bot-avatar">
                      <Bot size={18} />
                    </div>
                    <div className="message-bubble assistant-bubble">
                      <div className="assistant-bubble-header">
                        <div className="assistant-meta">
                          <span className="message-sender">PaperMind AI</span>
                          {citations.length > 0 && (
                            <span 
                              className="bubble-citation-count"
                              onClick={() => {
                                setActiveCitations(citations);
                                if (citations.length > 0) {
                                  onSelectCitation?.(citations[0]);
                                }
                              }}
                              title="Click to view detailed citations"
                            >
                              <Bookmark size={11} />
                              {citations.length} citation{citations.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="bubble-actions">
                          <button 
                            className="bubble-action-btn"
                            onClick={() => copyToClipboard(item.answer, idx)}
                            title="Copy answer"
                          >
                            {copiedIndex === idx ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Color-Coded Answer Body with Structured Citations */}
                      <MarkdownWithCitations
                        content={item.answer}
                        defaultSource={item.source}
                        onSelectCitation={(cit) => {
                          setActiveCitations(citations);
                          onSelectCitation(cit);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isAsking && (
              <div className="message-row message-assistant animate-fade-in">
                <div className="message-avatar bot-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-bubble assistant-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span className="loading-caption">
                    Retrieving vector chunks and synthesizing answer with citations...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="workspace-input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            ref={inputRef}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedPaper 
                ? `Ask anything about ${selectedPaper}... (Press Enter to submit)`
                : "Ask anything across all indexed research papers... (Press Enter to submit)"
            }
            rows={2}
            className="chat-textarea"
            disabled={isAsking}
          />
          <button 
            type="submit" 
            className="btn-send"
            disabled={!inputQuestion.trim() || isAsking}
            title="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
