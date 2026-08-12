interface CodeDisplayProps {
  submission: any;
}

export default function CodeDisplay({ submission }: CodeDisplayProps) {
  const mockCode = submission 
    ? `// Source Code for: ${submission['題目名稱'] || 'Unknown Task'}
// Result: ${submission['結果'] || 'N/A'}
// Submitted At: ${submission['完成時間'] || 'Unknown'}

function calculateSum(a, b) {
  // This is a placeholder for the actual source code
  console.log("Calculating sum...");
  
  let result = a + b;
  
  return result;
}

// Example usage
const total = calculateSum(10, 20);
console.log("Total is: ", total);`
    : `// Please select a submission from the left panel to view code.`;

  return (
    <div className="glass-card code-card col-span-8">
      <div className="code-header">
        <span>{submission ? submission['題目名稱'] : 'Select a submission'}</span>
      </div>
      <pre className="code-content">
        <code>{mockCode}</code>
      </pre>
    </div>
  );
}
