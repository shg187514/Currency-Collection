import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, FileText, AlignLeft, Paperclip, Hash, Filter } from 'lucide-react';
import { useTreeStore } from '../../store/useTreeStore';
import { fetchTree } from '../../lib/api';
import { searchTree, SearchResult, HighlightedText, SearchFilter } from '../../lib/searchUtils';
import { useDebounce } from 'use-debounce';
import { useNavigate } from 'react-router-dom';

export function GlobalSearchModal() {
  const { isSearchModalOpen, setIsSearchModalOpen, expandToNode } = useTreeStore();
  const { data: treeData } = useQuery({ queryKey: ['nodes-tree'], queryFn: fetchTree });
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isSearchModalOpen]);

  // Perform search
  useEffect(() => {
    if (!treeData || !debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const res = searchTree(treeData, debouncedQuery, searchFilter);
    setResults(res);
    setSelectedIndex(0);
  }, [debouncedQuery, treeData, searchFilter]);

  const handleSelectResult = React.useCallback((result: SearchResult) => {
    expandToNode(result.path);
    setIsSearchModalOpen(false);
    
    // Pass focus state to the node view to trigger highlighting/scrolling
    navigate(`/node/${result.nodeId}`, { 
      state: { 
        searchFocus: { 
          type: result.matchType, 
          query: debouncedQuery,
          itemId: result.itemId
        } 
      } 
    });
  }, [expandToNode, setIsSearchModalOpen, navigate, debouncedQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchModalOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, results, selectedIndex, handleSelectResult, setIsSearchModalOpen]);

  const getMatchIcon = (type: SearchResult['matchType']) => {
    switch (type) {
      case 'title': return <Hash className="w-4 h-4 text-blue-500" />;
      case 'description': return <AlignLeft className="w-4 h-4 text-purple-500" />;
      case 'content': return <FileText className="w-4 h-4 text-green-500" />;
      case 'attachment': return <Paperclip className="w-4 h-4 text-orange-500" />;
    }
  };

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setIsSearchModalOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800 relative">
          <Search className="w-6 h-6 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none border-none focus:ring-0 p-0"
            placeholder="Search nodes, markdown, attachments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center ml-3 shrink-0">
            <div className="relative group flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors mr-2">
              <Filter className="w-4 h-4 text-gray-500 mr-1.5 ml-1" />
              <select 
                value={searchFilter} 
                onChange={(e) => setSearchFilter(e.target.value as SearchFilter)}
                className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 outline-none border-none focus:ring-0 cursor-pointer appearance-none pr-4"
              >
                <option value="all">All</option>
                <option value="title">Node Titles</option>
                <option value="description">Descriptions</option>
                <option value="attachment">Attachments</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-gray-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSearchModalOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {debouncedQuery.trim() === '' ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Type to start searching across your workspace...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "<span className="font-medium text-gray-900 dark:text-gray-100">{debouncedQuery}</span>"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${result.nodeId}-${result.matchType}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelectResult(result)}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/30' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5 mr-3">
                      {getMatchIcon(result.matchType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                        <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 truncate uppercase tracking-wider">
                          {result.breadcrumbs.join(' / ')}
                        </div>
                      )}
                      <div className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                        {result.matchType === 'title' ? (
                          <HighlightedText text={result.nodeTitle} highlight={debouncedQuery} />
                        ) : (
                          result.nodeTitle
                        )}
                      </div>
                      
                      {result.matchType !== 'title' && (
                        <div className={`text-sm mt-1 line-clamp-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          <HighlightedText text={result.snippet} highlight={debouncedQuery} />
                        </div>
                      )}
                      
                      {/* Breadcrumbs for context (optional, just showing depth or node parent if we wanted) */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-sans">&uarr;&darr;</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-sans">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-sans">Esc</kbd> to close
            </span>
          </div>
          <div>
            {results.length} result{results.length !== 1 && 's'}
          </div>
        </div>
        
      </div>
    </div>
  );
}
