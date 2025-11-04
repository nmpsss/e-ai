/**
 * 代码块组件
 */
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { copyToClipboard } from '@/utils/helpers';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 高亮代码
  const highlightedCode = language
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value;

  return (
    <div className="relative group rounded-lg overflow-hidden my-4">
      {/* 语言标签和复制按钮 */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-xs">
        <span className="text-gray-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>复制代码</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <div className="bg-gray-900 overflow-x-auto">
        <pre className="p-4 text-sm">
          <code
            className={language ? `language-${language}` : ''}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
