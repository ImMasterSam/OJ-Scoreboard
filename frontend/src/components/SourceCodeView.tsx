import { useState } from 'react';
import SearchSubmissions from './code/SearchSubmissions';
import CodeDisplay from './code/CodeDisplay';

export default function SourceCodeView() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  return (
    <div className="source-code-grid">
      <SearchSubmissions selectedSubmission={selectedSubmission} onSelect={setSelectedSubmission} />
      <CodeDisplay submission={selectedSubmission} />
    </div>
  );
}
