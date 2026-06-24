import React from 'react';

export default function CodeHighlighter({ code, lang }) {
  if (!code) return null;

  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === 'curl') {
    escaped = escaped.replace(/(curl|--location|--method|--header|--data)/g, '<span class="text-amber-400 font-bold">$1</span>');
    escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>');
  } else {
    escaped = escaped.replace(/\b(const|let|var|new|return|import|from|require|function|echo|class|public|private|false|true)\b/g, '<span class="text-purple-400 font-bold">$1</span>');
    escaped = escaped.replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>');
    escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>');
    escaped = escaped.replace(/\b(fetch|then|catch|console\.log|requests\.request|print|axios\.request)\b/g, '<span class="text-blue-400">$1</span>');
  }

  return <code dangerouslySetInnerHTML={{ __html: escaped }} />;
}
