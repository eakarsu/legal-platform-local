import React from 'react';

function AIOutput({ title, content, loading }) {
  if (loading) {
    return (
      <div className="ai-output-container">
        <div className="ai-output-header">
          <i className="fa-solid fa-robot"></i>
          <h3>{title || 'AI Analysis'}</h3>
        </div>
        <div className="ai-loading">
          <div className="spinner"></div>
          <p>AI is analyzing your request...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const renderMarkdown = (text) => {
    if (!text) return '';

    let html = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Unordered lists
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Blockquote
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Line breaks to paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Single line breaks
      .replace(/\n/g, '<br/>');

    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => {
      const cleaned = match.replace(/<br\/>/g, '');
      return `<ul>${cleaned}</ul>`;
    });

    return `<p>${html}</p>`;
  };

  return (
    <div className="ai-output-container">
      <div className="ai-output-header">
        <i className="fa-solid fa-robot"></i>
        <h3>{title || 'AI Analysis'}</h3>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          Powered by AI
        </span>
      </div>
      <div
        className="ai-output-body"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}

export default AIOutput;
