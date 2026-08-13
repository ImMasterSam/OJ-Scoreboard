import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  submission: any;
}

const LANGUAGE_MAP: Record<string, string> = {
  'C': 'c',
  'C++': 'cpp',
  'C++ 11': 'cpp',
  'C++ 14': 'cpp',
  'C++ 17': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'Python 3': 'python',
  'Python3': 'python',
  'JavaScript': 'javascript',
  'Node.js': 'javascript',
  'Ruby': 'ruby',
  'Go': 'go',
  'Rust': 'rust',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'PHP': 'php',
  'C#': 'csharp',
  'Pascal': 'pascal'
};

const getHighlightLanguage = (langString: string | null | undefined) => {
  if (!langString) return 'text';
  // Try exact match first
  if (LANGUAGE_MAP[langString]) return LANGUAGE_MAP[langString];
  
  // Try fuzzy match
  const lowerLang = langString.toLowerCase();
  if (lowerLang.includes('c++') || lowerLang.includes('cpp')) return 'cpp';
  if (lowerLang.includes('c#') || lowerLang.includes('csharp')) return 'csharp';
  if (lowerLang.includes('python')) return 'python';
  if (lowerLang.includes('java') && !lowerLang.includes('javascript')) return 'java';
  if (lowerLang.includes('js') || lowerLang.includes('javascript') || lowerLang.includes('node')) return 'javascript';
  if (lowerLang.includes('ruby')) return 'ruby';
  if (lowerLang.includes('go')) return 'go';
  if (lowerLang.includes('rust')) return 'rust';
  
  return 'text'; // Fallback
};

const decodeHtmlEntities = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
};

export default function CodeDisplay({ submission }: CodeDisplayProps) {
  return (
    <div className="glass-card code-card col-span-8 flex flex-col h-full overflow-hidden">
      <div className="code-header border-b border-white/10 p-4 bg-white/5 flex justify-between items-center">
        <span className="font-semibold text-white">
          {submission ? submission['題目名稱'] : 'Select a submission'}
        </span>
        {submission && submission['程式語言'] && (
          <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/70">
            {submission['程式語言']}
          </span>
        )}
      </div>
      
      <div className="flex-1 bg-[#1e1e1e]/50" style={{ overflow: 'auto' }}>
        {!submission ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.95rem'
          }}>
            <p>請選擇一個提交紀錄以檢視程式碼</p>
          </div>
        ) : !submission['Code'] ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '1.25rem',
              borderRadius: '50%',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, color: '#a0a0a0' }}>
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 500, 
              color: 'rgba(255, 255, 255, 0.85)', 
              marginBottom: '0.75rem',
              letterSpacing: '0.5px'
            }}>
              此平台暫不支援程式碼檢視
            </h3>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 255, 255, 0.4)', 
              maxWidth: '380px', 
              lineHeight: '1.6' 
            }}>
              很抱歉，目前系統僅開放讀取 <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Zerojudge</strong> 的提交原始碼，其他評測平台暫未提供存取權限。
            </p>
          </div>
        ) : (
          <SyntaxHighlighter
            language={getHighlightLanguage(submission['程式語言'])}
            style={vscDarkPlus}
            showLineNumbers={true}
            codeTagProps={{
              style: {
                fontSize: '1.1rem',
                fontFamily: 'Consolas, monospace',
              }
            }}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              minHeight: '100%',
            }}
          >
            {decodeHtmlEntities(submission['Code'])}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
