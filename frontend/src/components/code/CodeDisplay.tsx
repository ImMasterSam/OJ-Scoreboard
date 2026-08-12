import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  submission: any;
}

export default function CodeDisplay({ submission }: CodeDisplayProps) {
  const mockCode = submission
    ? `// Source Code for: ${submission['題目名稱'] || 'Unknown Task'}
// Result: ${submission['結果'] || 'N/A'}
// Submitted At: ${submission['完成時間'] || 'Unknown'}

// =========================
// 這個是暫時的假資料，
// 後端 API 實作好之後，這個要改成從 API 拿
// =========================

#include <iostream>

int main() {
    // This is a placeholder for the actual C++ source code
    std::cout << "Calculating sum..." << std::endl;
    
    int a = 10;
    int b = 20;
    int result = a + b;
    
    std::cout << "Total is: " << result << std::endl;
    
    return 0;
}`
    : `// Please select a submission from the left panel to view code.`;

  return (
    <div className="glass-card code-card col-span-8 flex flex-col h-full overflow-hidden">
      <div className="code-header border-b border-white/10 p-4 bg-white/5">
        <span className="font-semibold">{submission ? submission['題目名稱'] : 'Select a submission'}</span>
      </div>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language="cpp"
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
          {mockCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
