import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CitationsPanel from './components/CitationsPanel';
import Toast from './components/Toast';
import AskView from './views/AskView';
import SummaryView from './views/SummaryView';
import CompareView from './views/CompareView';
import { api } from './services/api';
import { extractCitations } from './utils/citationParser';
import './App.css';

const loadStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
};

const saveStorage = (key, val) => {
  try {
    if (val === null || val === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState(() => loadStorage('papermind_active_tab', 'ask'));
  const [isCitationsOpen, setIsCitationsOpen] = useState(() => loadStorage('papermind_citations_open', true));

  // Papers State
  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(() => loadStorage('papermind_selected_paper', null));

  // Compare Target Papers
  const [comparePaperA, setComparePaperA] = useState(() => loadStorage('papermind_compare_a', ''));
  const [comparePaperB, setComparePaperB] = useState(() => loadStorage('papermind_compare_b', ''));

  // Upload & Delete States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Q&A State
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => loadStorage('papermind_chat_history', []));

  // Summary State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaries, setSummaries] = useState(() => loadStorage('papermind_summaries', {}));

  // Comparison State
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(() => loadStorage('papermind_comparison_result', null));

  // Citations State
  const [activeCitations, setActiveCitations] = useState(() => loadStorage('papermind_active_citations', []));
  const [highlightedCitation, setHighlightedCitation] = useState(() => loadStorage('papermind_highlighted_cit', null));

  // Backend Health
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'checking' | 'offline'

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Health Check
  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await api.checkHealth();
      setBackendStatus('online');
    } catch (err) {
      console.warn('Backend check failed:', err);
      setBackendStatus('offline');
    }
  }, []);

  // Fetch Papers
  const fetchPapers = useCallback(async () => {
    setLoadingPapers(true);
    try {
      const data = await api.getPapers();
      const list = data.papers || [];
      setPapers(list);
      // Auto-assign comparison defaults if available
      if (list.length >= 2) {
        setComparePaperA((prev) => prev || list[0]);
        setComparePaperB((prev) => prev || list[1]);
      } else if (list.length === 1) {
        setComparePaperA((prev) => prev || list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch papers:', err);
      showToast('Could not reach backend API to load papers.', 'error');
    } finally {
      setLoadingPapers(false);
    }
  }, [showToast]);

  useEffect(() => {
    checkBackendStatus();
    fetchPapers();
  }, [checkBackendStatus, fetchPapers]);

  // Persist State Changes to LocalStorage
  useEffect(() => {
    saveStorage('papermind_chat_history', chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    saveStorage('papermind_selected_paper', selectedPaper);
  }, [selectedPaper]);

  useEffect(() => {
    saveStorage('papermind_summaries', summaries);
  }, [summaries]);

  useEffect(() => {
    saveStorage('papermind_comparison_result', comparisonResult);
  }, [comparisonResult]);

  useEffect(() => {
    saveStorage('papermind_compare_a', comparePaperA);
  }, [comparePaperA]);

  useEffect(() => {
    saveStorage('papermind_compare_b', comparePaperB);
  }, [comparePaperB]);

  useEffect(() => {
    saveStorage('papermind_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    saveStorage('papermind_active_citations', activeCitations);
  }, [activeCitations]);

  useEffect(() => {
    saveStorage('papermind_highlighted_cit', highlightedCitation);
  }, [highlightedCitation]);

  useEffect(() => {
    saveStorage('papermind_citations_open', isCitationsOpen);
  }, [isCitationsOpen]);

  // Multiple PDF Upload Handler
  const handleUploadPaper = async (incomingFiles) => {
    const fileList = Array.isArray(incomingFiles) 
      ? incomingFiles 
      : (incomingFiles instanceof FileList ? Array.from(incomingFiles) : [incomingFiles]);

    if (!fileList || fileList.length === 0) {
      showToast('No files selected for upload.', 'error');
      return;
    }

    const pdfFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    const invalidFiles = fileList.filter(f => !f.name.toLowerCase().endsWith('.pdf'));

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(f => {
        showToast(`Skipped '${f.name}': Only PDF files are supported.`, 'error');
      });
      if (pdfFiles.length === 0) return;
    }

    setIsUploading(true);
    setUploadProgress(`Processing ${pdfFiles.length} PDF${pdfFiles.length > 1 ? 's' : ''}...`);

    try {
      const progressTimer = setTimeout(() => {
        setUploadProgress('Extracting text, chunking sections & indexing into ChromaDB...');
      }, 1500);

      const res = await api.uploadPaper(pdfFiles);
      clearTimeout(progressTimer);

      if (res.error && (!res.results || res.results.length === 0)) {
        showToast(res.error, 'error');
      } else if (res.results && res.results.length > 0) {
        let successCount = 0;
        res.results.forEach((r) => {
          if (r.status === 'success') {
            successCount++;
            showToast(r.message || `'${r.filename}' uploaded and indexed successfully!`, 'success');
          } else {
            showToast(r.error || `Failed to process '${r.filename}'`, 'error');
          }
        });

        await fetchPapers();
        const firstSuccess = res.results.find(r => r.status === 'success');
        if (firstSuccess) {
          setSelectedPaper(firstSuccess.filename);
        }
      } else {
        showToast(res.message || 'Upload completed successfully!', 'success');
        await fetchPapers();
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // Clear Chat Handler
  const handleClearChat = useCallback(() => {
    setChatHistory([]);
    try {
      localStorage.removeItem('papermind_chat_history');
      if (activeTab === 'ask') {
        setActiveCitations([]);
        setHighlightedCitation(null);
        localStorage.removeItem('papermind_active_citations');
        localStorage.removeItem('papermind_highlighted_cit');
      }
    } catch (e) {
      console.warn('Failed to clear chat from localStorage:', e);
    }
    showToast('Conversation history cleared.', 'info');
  }, [activeTab, showToast]);

  // Clear Summary Handler
  const handleClearSummary = useCallback((targetPaper) => {
    setSummaries((prev) => {
      const next = { ...prev };
      if (targetPaper) {
        delete next[targetPaper];
      } else {
        return {};
      }
      try {
        localStorage.setItem('papermind_summaries', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to update summaries in localStorage:', e);
      }
      return next;
    });

    if (activeTab === 'summary') {
      setActiveCitations([]);
      setHighlightedCitation(null);
      try {
        localStorage.removeItem('papermind_active_citations');
        localStorage.removeItem('papermind_highlighted_cit');
      } catch (e) {
        console.warn('Failed to clear citations from localStorage:', e);
      }
    }
    showToast(targetPaper ? `Summary cleared for ${targetPaper}.` : 'Summary cleared.', 'info');
  }, [activeTab, showToast]);

  // Clear Comparison Handler
  const handleClearComparison = useCallback(() => {
    setComparisonResult(null);
    try {
      localStorage.removeItem('papermind_comparison_result');
      if (activeTab === 'compare') {
        setActiveCitations([]);
        setHighlightedCitation(null);
        localStorage.removeItem('papermind_active_citations');
        localStorage.removeItem('papermind_highlighted_cit');
      }
    } catch (e) {
      console.warn('Failed to clear comparison from localStorage:', e);
    }
    showToast('Comparison results cleared.', 'info');
  }, [activeTab, showToast]);

  // Delete Paper Handler
  const handleDeletePaper = async (filename) => {
    try {
      const res = await api.deletePaper(filename);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(res.message || `${filename} deleted.`, 'success');
        if (selectedPaper === filename) setSelectedPaper(null);
        if (comparePaperA === filename) setComparePaperA('');
        if (comparePaperB === filename) setComparePaperB('');
        // Clean from summaries
        setSummaries((prev) => {
          const next = { ...prev };
          delete next[filename];
          return next;
        });
        await fetchPapers();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  // Synchronize Citations Panel with the active view to avoid stale citations
  useEffect(() => {
    if (activeTab === 'ask') {
      if (chatHistory.length > 0) {
        const latest = chatHistory[chatHistory.length - 1];
        setActiveCitations(extractCitations(latest.answer, latest.source));
      } else {
        setActiveCitations([]);
      }
    } else if (activeTab === 'summary') {
      const currentPaper = selectedPaper || (papers.length > 0 ? papers[0] : null);
      if (currentPaper && summaries[currentPaper]) {
        setActiveCitations(extractCitations(summaries[currentPaper], currentPaper));
      } else {
        setActiveCitations([]);
      }
    } else if (activeTab === 'compare') {
      if (comparisonResult?.comparison) {
        setActiveCitations(extractCitations(comparisonResult.comparison));
      } else {
        setActiveCitations([]);
      }
    }
  }, [activeTab]);

  // Ask Question Handler
  const handleAskQuestion = async (question, source) => {
    setIsAsking(true);
    try {
      const res = await api.askQuestion(question, source);
      const newEntry = {
        question: res.question,
        source: res.source,
        answer: res.answer,
      };

      setChatHistory((prev) => [...prev, newEntry]);
      // Immediately display grounded citations in CitationsPanel
      const citations = extractCitations(res.answer, res.source);
      setActiveCitations(citations);
    } catch (err) {
      console.error('Ask error:', err);
      showToast(`Failed to answer question: ${err.message}`, 'error');
    } finally {
      setIsAsking(false);
    }
  };

  // Summarize Handler
  const handleSummarize = async (source) => {
    setIsSummarizing(true);
    try {
      const res = await api.summarizePaper(source);
      setSummaries((prev) => ({
        ...prev,
        [res.source]: res.summary,
      }));
      // Immediately display citations in CitationsPanel
      const citations = extractCitations(res.summary, res.source);
      setActiveCitations(citations);
      showToast(`Summary generated for ${source}`, 'success');
    } catch (err) {
      console.error('Summarize error:', err);
      showToast(`Failed to summarize: ${err.message}`, 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Compare Handler
  const handleCompare = async (sourceA, sourceB, focus) => {
    setIsComparing(true);
    try {
      const res = await api.comparePapers(sourceA, sourceB, focus);
      setComparisonResult(res);
      // Immediately display citations in CitationsPanel
      const citations = extractCitations(res.comparison);
      setActiveCitations(citations);
      showToast('Comparison completed successfully!', 'success');
    } catch (err) {
      console.error('Compare error:', err);
      showToast(`Comparison failed: ${err.message}`, 'error');
    } finally {
      setIsComparing(false);
    }
  };

  // Quick Action: Summarize from sidebar
  const handleQuickSummarize = (paper) => {
    setSelectedPaper(paper);
    setActiveTab('summary');
    if (!summaries[paper]) {
      handleSummarize(paper);
    }
  };

  // Quick Action: Add paper to compare
  const handleSetComparePaper = (paper) => {
    if (!comparePaperA) {
      setComparePaperA(paper);
      showToast(`Set as Paper A: ${paper}`, 'info');
    } else if (comparePaperA !== paper && !comparePaperB) {
      setComparePaperB(paper);
      showToast(`Set as Paper B: ${paper}`, 'info');
    } else {
      setComparePaperA(paper);
      showToast(`Set as Paper A: ${paper}`, 'info');
    }
    setActiveTab('compare');
  };

  // Citation Selection (Opens sidebar, matches citation, scrolls to card)
  const handleSelectCitation = (cit) => {
    setIsCitationsOpen(true);
    const match = activeCitations.find(c => 
      (cit.id && c.id === cit.id) ||
      (c.source === cit.source && c.page === cit.page && (!cit.section || !c.section || c.section === cit.section))
    );
    setHighlightedCitation(match || cit);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        checkBackendStatus={checkBackendStatus}
        citationCount={activeCitations.length}
        isCitationsOpen={isCitationsOpen}
        setIsCitationsOpen={setIsCitationsOpen}
        totalPapers={papers.length}
      />

      {/* Main Body */}
      <div className="app-body">
        {/* Left Sidebar: Paper Library & Uploads */}
        <Sidebar
          papers={papers}
          loadingPapers={loadingPapers}
          onUploadPaper={handleUploadPaper}
          onDeletePaper={handleDeletePaper}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          selectedPaper={selectedPaper}
          setSelectedPaper={setSelectedPaper}
          onQuickSummarize={handleQuickSummarize}
          onSetComparePaper={handleSetComparePaper}
          comparePaperA={comparePaperA}
          comparePaperB={comparePaperB}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Central Workspace */}
        <main className="app-main-workspace">
          {activeTab === 'ask' && (
            <AskView
              papers={papers}
              selectedPaper={selectedPaper}
              setSelectedPaper={setSelectedPaper}
              onAskQuestion={handleAskQuestion}
              isAsking={isAsking}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              onClearChat={handleClearChat}
              onSelectCitation={handleSelectCitation}
              setActiveCitations={setActiveCitations}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryView
              papers={papers}
              selectedPaper={selectedPaper}
              setSelectedPaper={setSelectedPaper}
              onSummarize={handleSummarize}
              isSummarizing={isSummarizing}
              summaries={summaries}
              onSelectCitation={handleSelectCitation}
              setActiveCitations={setActiveCitations}
              onClearSummary={handleClearSummary}
            />
          )}

          {activeTab === 'compare' && (
            <CompareView
              papers={papers}
              comparePaperA={comparePaperA}
              setComparePaperA={setComparePaperA}
              comparePaperB={comparePaperB}
              setComparePaperB={setComparePaperB}
              onCompare={handleCompare}
              isComparing={isComparing}
              comparisonResult={comparisonResult}
              onSelectCitation={handleSelectCitation}
              setActiveCitations={setActiveCitations}
              onShowToast={showToast}
              onClearComparison={handleClearComparison}
            />
          )}
        </main>

        {/* Right Panel: Sources & Citations */}
        <CitationsPanel
          citations={activeCitations}
          isOpen={isCitationsOpen}
          onClose={() => setIsCitationsOpen(false)}
          highlightedCitation={highlightedCitation}
          onClearHighlight={() => setHighlightedCitation(null)}
          onSelectCitation={(cit) => setHighlightedCitation(cit)}
        />
      </div>

      {/* Floating Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
