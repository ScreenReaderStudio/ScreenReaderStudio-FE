'use client';

import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';

import { useInputStore } from '@/modules/analysis/model/useInputStore';

export default function CodeEditor() {
  const code = useInputStore((state) => state.code);
  const setCode = useInputStore((state) => state.setCode);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const onChange = (value: string) => {
    setCode(value);
  };

  return (
    <div className="rounded-md border border-gray-300 p-1.5 shadow-md dark:border-gray-700">
      <CodeMirror
        aria-label="분석할 HTML 코드"
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={onChange}
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
}
