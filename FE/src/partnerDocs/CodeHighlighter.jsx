import React from 'react';

const KEYWORDS = /\b(const|let|var|new|return|import|from|require|function|echo|class|public|private|false|true)\b/;
const CURL_COMMANDS = /\b(curl|--location|--method|--header|--data)\b/;
const API_METHODS = /\b(fetch|then|catch|console\.log|requests\.request|print|axios\.request)\b/;

function tokenize(line, lang) {
  const tokens = [];
  const re = lang === 'curl'
    ? /(--\w+|'[^']*'|"[^"]*"|\S+)/g
    : /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\w+\b|[{}[\]();,.]|.)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    tokens.push(m[1]);
  }
  return tokens;
}

function classify(token, lang) {
  if (lang === 'curl') {
    if (CURL_COMMANDS.test(token)) return 'text-amber-400 font-bold';
    if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"')))
      return 'text-emerald-400';
    return null;
  }
  if (KEYWORDS.test(token)) return 'text-purple-400 font-bold';
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")))
    return 'text-emerald-400';
  if (API_METHODS.test(token)) return 'text-blue-400';
  return null;
}

export default function CodeHighlighter({ code, lang }) {
  if (!code) return null;

  const lines = code.split('\n');

  return (
    <code>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && '\n'}
          {tokenize(line, lang).map((token, j) => {
            const cls = classify(token, lang);
            return cls
              ? <span key={j} className={cls}>{token}</span>
              : <React.Fragment key={j}>{token}</React.Fragment>;
          })}
        </React.Fragment>
      ))}
    </code>
  );
}
