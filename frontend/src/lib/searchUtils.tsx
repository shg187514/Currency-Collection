import React from 'react';
import { NodeModel } from './api';

export interface SearchResult {
  nodeId: string;
  nodeTitle: string;
  matchType: 'title' | 'description' | 'content' | 'attachment';
  snippet: string;
  path: string[];
  breadcrumbs: string[];
  itemId?: string;
}

// Flattens the tree and recursively builds the path of node IDs and titles for breadcrumbs
export const flattenTreeWithPaths = (nodes: NodeModel[], currentPath: string[] = [], currentBreadcrumbs: string[] = []): { node: NodeModel; path: string[]; breadcrumbs: string[] }[] => {
  let flatList: { node: NodeModel; path: string[]; breadcrumbs: string[] }[] = [];
  
  for (const node of nodes) {
    const newPath = [...currentPath, node.id];
    // Include node title in breadcrumb (or 'Untitled Node') but don't include the current node itself in its own breadcrumbs, only its ancestors.
    flatList.push({ node, path: newPath, breadcrumbs: currentBreadcrumbs });
    if (node.children && node.children.length > 0) {
      const newBreadcrumbs = [...currentBreadcrumbs, node.title || 'Untitled Node'];
      flatList = flatList.concat(flattenTreeWithPaths(node.children, newPath, newBreadcrumbs));
    }
  }
  
  return flatList;
};

// Generates a context snippet around the matched keyword
const extractSnippet = (text: string, query: string, padding: number = 40): string => {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  
  if (matchIndex === -1) return text.substring(0, padding * 2) + '...';
  
  const start = Math.max(0, matchIndex - padding);
  const end = Math.min(text.length, matchIndex + query.length + padding);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
};

export type SearchFilter = 'all' | 'title' | 'description' | 'attachment';

export const searchTree = (nodes: NodeModel[], query: string, filter: SearchFilter = 'all'): SearchResult[] => {
  if (!query.trim()) return [];
  
  const flatNodes = flattenTreeWithPaths(nodes);
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const { node, path, breadcrumbs } of flatNodes) {
    // Check title
    if ((filter === 'all' || filter === 'title') && node.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        nodeId: node.id,
        nodeTitle: node.title,
        matchType: 'title',
        snippet: node.title,
        path,
        breadcrumbs
      });
      if (filter === 'all' || filter === 'title') continue; // Only continue if we found our primary match for 'all'
    }

    // Check description
    if ((filter === 'all' || filter === 'description') && node.description && node.description.toLowerCase().includes(lowerQuery)) {
      results.push({
        nodeId: node.id,
        nodeTitle: node.title,
        matchType: 'description',
        snippet: extractSnippet(node.description, query),
        path,
        breadcrumbs
      });
      if (filter === 'all' || filter === 'description') continue;
    }

    // Check attachments
    if ((filter === 'all' || filter === 'attachment') && node.attachments && node.attachments.length > 0) {
      const matchedAttachment = node.attachments.find(a => a.filename.toLowerCase().includes(lowerQuery));
      if (matchedAttachment) {
        results.push({
          nodeId: node.id,
          nodeTitle: node.title,
          matchType: 'attachment',
          snippet: `Attachment: ${matchedAttachment.filename}`,
          path,
          breadcrumbs,
          itemId: matchedAttachment.id
        });
      }
    }
  }

  return results;
};

export const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  // Split text on highlight term, case-insensitive, including the term in the split
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-gray-100 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};
