// src/utils/formatter.js

export const formatResponse = (text, type) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.5rem; color: #38bdf8;">$1</strong>');
    formattedText = formattedText
      .replace(/^\s*\*\s+/gm, '<li style="color: #fef08a;">')
      .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fef08a;">')
      .replace(/(\n|^)\*\s+/g, '$1<li style="color: #fef08a;">')
      .concat('</li>');
    
    formattedText = formattedText.replace(/\n/g, '<br>');
  
    if (type === 'studyPlan') {
      formattedText = formattedText
        .replace(/^\*\*Topic/gm, '<h2 style="color: #4ade80;">$&')
        .replace(/^\*\*\s*([^\n]+)\s*\(([\d]+ minutes)\)\n+/gm, '<h3 style="color: #f59e0b;">$1 ($2)</h3>')
        .replace(/^\* (Subtopic [\d.]+):/gm, '<h4 style="color: #60a5fa;">$1</h4>')
        .replace(/^\s*\+ ([^\n]+):/gm, '<h5>$1</h5>');
    }
  
    return `<ul>${formattedText}</ul>`;
  };
  