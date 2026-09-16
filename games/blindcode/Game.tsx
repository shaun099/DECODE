'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameProps } from '../registry';
import { Play, RotateCcw, ShieldAlert, CheckCircle2, Terminal, Code2, EyeOff, Eye } from 'lucide-react';

export default function BlindcodeGame({ hud, view, send }: GameProps) {
  const problem = view?.problem;
  const lastError = view?.lastError;
  const lastOutput = view?.lastOutput;
  const testResults = view?.testResults ?? [];
  const solvedCode = view?.solvedCode;

  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputLog, setOutputLog] = useState<{
    success: boolean | null;
    error: string | null;
    message: string | null;
    testResults: any[];
  }>({
    success: null,
    error: null,
    message: null,
    testResults: [],
  });
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [revealCode, setRevealCode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or reset starter template when problem changes or language changes
  useEffect(() => {
    if (problem?.starterCode) {
      const template = language === 'python' ? problem.starterCode.python : problem.starterCode.js;
      setCode(template);
      setOutputLog({
        success: null,
        error: null,
        message: null,
        testResults: [],
      });
      setRevealCode(false);
    }
  }, [problem?.id, language]);

  // Sync server view state
  useEffect(() => {
    if (lastError) {
      setOutputLog({
        success: false,
        error: lastError,
        message: null,
        testResults: testResults || [],
      });
    } else if (lastOutput) {
      setOutputLog({
        success: true,
        error: null,
        message: lastOutput,
        testResults: testResults || [],
      });
      setRevealCode(true);
    }
  }, [lastError, lastOutput, testResults]);

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
    const lines = text.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const spaces = language === 'python' ? '    ' : '  ';
      const newVal = val.substring(0, start) + spaces + val.substring(end);
      setCode(newVal);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
          updateCursorPosition();
        }
      }, 0);
    }
  };

  const handleReset = () => {
    if (problem?.starterCode) {
      const template = language === 'python' ? problem.starterCode.python : problem.starterCode.js;
      setCode(template);
      setOutputLog({
        success: null,
        error: null,
        message: null,
        testResults: [],
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || outputLog.success) return;

    setIsSubmitting(true);
    setOutputLog({
      success: null,
      error: null,
      message: 'Executing solution in sandbox against test suite...',
      testResults: [],
    });

    try {
      const res: any = await send({
        code,
        language,
      });

      if (res) {
        if (res.correct || res.done) {
          setOutputLog({
            success: true,
            error: null,
            message: 'ACCEPTED: All test cases passed!',
            testResults: res.lastResult?.testResults ?? res.view?.testResults ?? [],
          });
          setRevealCode(true);
        } else {
          setOutputLog({
            success: false,
            error: res.lastResult?.error ?? res.view?.lastError ?? 'Execution failed.',
            message: null,
            testResults: res.lastResult?.testResults ?? res.view?.testResults ?? [],
          });
        }
      }
    } catch (err: any) {
      setOutputLog({
        success: false,
        error: err?.message || 'Failed to submit code.',
        message: null,
        testResults: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const codeLines = (code || '').split('\n');
  const lineCount = Math.max(codeLines.length, 8);

  // Generate masked visual lines for blind preview
  const maskedLines = codeLines.map((line) => {
    return line
      .split('')
      .map((ch) => (ch === ' ' ? ' ' : ch === '\t' ? '  ' : '•'))
      .join('');
  });

  return (
    <div className="mx-auto flex h-screen max-w-6xl flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6">
      {/* Top HUD */}
      {hud}

      {/* Main Workspace Layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Problem Briefing & Output Console */}
        <div className="flex min-h-0 flex-col gap-4 lg:col-span-5">
          {/* Problem Card */}
          <div className="flex flex-col rounded-lg border-2 border-emerald-900/60 bg-black/60 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded border border-emerald-600/40 bg-emerald-950/40 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                <Code2 className="h-3.5 w-3.5" />
                BLIND CODING CHALLENGE
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {problem?.difficulty || 'Easy'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-zinc-100">{problem?.title || 'Coding Challenge'}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{problem?.description}</p>

            {/* Examples */}
            {problem?.examples && problem.examples.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-zinc-800/80 pt-2.5">
                <p className="font-mono text-[11px] font-semibold text-emerald-400">EXAMPLES:</p>
                <div className="space-y-1 font-mono text-xs">
                  {problem.examples.map((ex: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded bg-zinc-950/70 px-2.5 py-1 text-zinc-300 border border-zinc-800/50"
                    >
                      <span className="text-zinc-400">{ex.input}</span>
                      <span className="text-emerald-300">➜ {ex.output}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Terminal / Output Console */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border-2 border-zinc-800 bg-zinc-950 p-3 shadow-inner">
            <div className="mb-2 flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-zinc-300">
                  EXECUTION CONSOLE
                </span>
              </div>
              {outputLog.success === true ? (
                <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ACCEPTED
                </span>
              ) : outputLog.success === false ? (
                <span className="flex items-center gap-1 font-mono text-xs font-bold text-red-400">
                  <ShieldAlert className="h-3.5 w-3.5" /> REJECTED
                </span>
              ) : (
                <span className="font-mono text-[11px] text-zinc-500">STANDBY</span>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto font-mono text-xs leading-relaxed">
              {isSubmitting ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  <span>Running code against test suite...</span>
                </div>
              ) : outputLog.success === true ? (
                <div className="space-y-2 text-emerald-300">
                  <p className="font-bold text-emerald-400">✓ {outputLog.message}</p>
                  {outputLog.testResults && outputLog.testResults.length > 0 && (
                    <div className="space-y-1 border-t border-emerald-900/60 pt-2 text-zinc-300">
                      {outputLog.testResults.map((tr: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400">✓</span>
                          <span>Test {idx + 1}:</span>
                          <span className="text-zinc-400">Input: {tr.input}</span>
                          <span className="text-emerald-400">➜ {tr.actual}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-zinc-400">
                    Challenge completed! You may proceed with key discovery.
                  </p>
                </div>
              ) : outputLog.error ? (
                <div className="space-y-2 text-red-300">
                  <div className="rounded border border-red-900/60 bg-red-950/30 p-2.5">
                    <p className="font-bold text-red-400">EXECUTION ERROR:</p>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-red-200">
                      {outputLog.error}
                    </pre>
                  </div>
                  {outputLog.testResults && outputLog.testResults.length > 0 && (
                    <div className="space-y-1 text-zinc-400 text-[11px]">
                      {outputLog.testResults.map((tr: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={tr.passed ? 'text-emerald-400' : 'text-red-400'}>
                            {tr.passed ? '✓' : '✗'}
                          </span>
                          <span>Test {idx + 1}:</span>
                          <span>Input: {tr.input}</span>
                          <span className={tr.passed ? 'text-emerald-400' : 'text-red-400'}>
                            Expected: {tr.expected}, Got: {tr.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-600">
                  <p>&gt; Blind Code Engine initialized.</p>
                  <p>&gt; Choose language, write your function blindly, and click Run.</p>
                  <p>&gt; Keystrokes are masked during typing.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Blind Code Editor */}
        <div className="flex min-h-0 flex-col rounded-lg border-2 border-emerald-900/70 bg-black/70 p-4 shadow-xl backdrop-blur-md lg:col-span-7">
          {/* Header with Language Selector & Blind Status */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded bg-zinc-950 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => setLanguage('javascript')}
                className={`rounded px-3 py-1 font-mono text-xs font-bold transition-colors ${
                  language === 'javascript'
                    ? 'bg-emerald-500 text-black shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                JavaScript
              </button>
              <button
                type="button"
                onClick={() => setLanguage('python')}
                className={`rounded px-3 py-1 font-mono text-xs font-bold transition-colors ${
                  language === 'python'
                    ? 'bg-emerald-500 text-black shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Python
              </button>
            </div>

            {/* Blind Mode Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                  revealCode
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    : 'bg-red-950/60 text-red-400 border border-red-800/50'
                }`}
              >
                {revealCode ? (
                  <>
                    <Eye className="h-3 w-3" /> REVEALED
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 animate-pulse" /> BLIND MODE: MASKED
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={handleReset}
                title="Reset code template"
                className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="relative flex min-h-0 flex-1 rounded border border-zinc-800 bg-zinc-950/90 font-mono text-sm overflow-hidden">
            {/* Line Number Gutter */}
            <div className="w-12 select-none border-r border-zinc-800/80 bg-zinc-950 py-3 pr-2 text-right font-mono text-xs text-zinc-600">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input & Display Area */}
            <div className="relative flex-1 overflow-auto p-3">
              {/* Actual Textarea (invisible/masked text in blind mode) */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  updateCursorPosition();
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={updateCursorPosition}
                onClick={updateCursorPosition}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                disabled={outputLog.success === true}
                className={`h-full w-full resize-none bg-transparent font-mono text-sm leading-6 outline-none ${
                  revealCode
                    ? 'text-emerald-300 selection:bg-emerald-500/30'
                    : 'text-transparent caret-emerald-400 selection:bg-emerald-500/20'
                }`}
                style={
                  !revealCode
                    ? ({
                        WebkitTextSecurity: 'disc',
                      } as any)
                    : {}
                }
              />

              {/* Masked Overlay (when blind mode is active and not revealed) */}
              {!revealCode && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 p-3 font-mono text-sm leading-6 text-zinc-500 select-none overflow-hidden"
                >
                  {maskedLines.map((mLine, i) => (
                    <div key={i} className="whitespace-pre">
                      {mLine || ' '}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Stats & Submit Button */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
            <div className="font-mono text-xs text-zinc-500">
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span className="mx-2">&bull;</span>
              <span>{code.length} chars</span>
              <span className="mx-2">&bull;</span>
              <span className="text-zinc-600">Press Ctrl+Enter to submit</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || outputLog.success === true}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                outputLog.success === true
                  ? 'border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 cursor-default'
                  : 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-black active:scale-95 disabled:opacity-50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  Testing...
                </>
              ) : outputLog.success === true ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Solved
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run & Submit Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

