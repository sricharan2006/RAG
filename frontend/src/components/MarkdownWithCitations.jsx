import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bookmark } from 'lucide-react';
import { getSourceColorPalette } from '../utils/sourceColors';

const CITATION_REGEX = /\[(?:([^,\]]+),\s*)?Page\s+(\d+)(?:,\s*Section:\s*([^\]]+))?\]/gi;

/**
 * Structured Markdown renderer that detects grounded citations and renders them
 * as interactive, color-coded, accessible citation badges without breaking
 * markdown formatting.
 */
export default function MarkdownWithCitations({
  content,
  defaultSource = '',
  onSelectCitation,
  className = ''
}) {
  const components = useMemo(() => {
    const formatWithCitations = (children) => {
      return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          // Reset regex state
          CITATION_REGEX.lastIndex = 0;
          if (!CITATION_REGEX.test(child)) return child;

          CITATION_REGEX.lastIndex = 0;
          const elements = [];
          let lastIndex = 0;
          let match;

          while ((match = CITATION_REGEX.exec(child)) !== null) {
            if (match.index > lastIndex) {
              elements.push(child.slice(lastIndex, match.index));
            }

            const raw = match[0];
            const source = (match[1] || defaultSource || 'Reference Document').trim();
            const page = parseInt(match[2].trim(), 10);
            const section = match[3] ? match[3].trim() : null;

            const palette = getSourceColorPalette(source);
            const citObj = {
              source,
              page,
              section,
              raw
            };

            elements.push(
              <span
                key={`${source}_${page}_${section || 'nosec'}_${match.index}`}
                className="inline-citation-badge citation-light-green"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCitation?.(citObj);
                }}
                title={`Click to view in Citations Panel · Document: ${source}, Page: ${page}${section ? `, Section: ${section}` : ''}`}
              >
                <Bookmark size={11} className="inline-cit-icon" />
                <span className="inline-cit-text">{raw}</span>
              </span>
            );

            lastIndex = CITATION_REGEX.lastIndex;
          }

          if (lastIndex < child.length) {
            elements.push(child.slice(lastIndex));
          }

          return elements;
        }

        if (React.isValidElement(child) && child.props.children) {
          return React.cloneElement(child, {
            children: formatWithCitations(child.props.children),
          });
        }

        return child;
      });
    };

    return {
      p: ({ children, ...props }) => (
        <p {...props}>{formatWithCitations(children)}</p>
      ),
      li: ({ children, ...props }) => (
        <li {...props}>{formatWithCitations(children)}</li>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote {...props}>{formatWithCitations(children)}</blockquote>
      ),
      td: ({ children, ...props }) => (
        <td {...props}>{formatWithCitations(children)}</td>
      ),
      th: ({ children, ...props }) => (
        <th {...props}>{formatWithCitations(children)}</th>
      ),
    };
  }, [defaultSource, onSelectCitation]);

  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
