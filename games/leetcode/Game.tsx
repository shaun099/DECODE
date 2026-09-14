'use client';

import { useState } from 'react';
import type { GameProps } from '../registry';
import {
  ALL_TEST_CASES,
  ExecutionResult,
  LOCKED_TEST_CASES,
  REFERENCE_SOLUTIONS,
  STARTER_TEMPLATES,
  SupportedLanguage,
  VISIBLE_TEST_CASES,
  executeTests,
} from './logic';
import {
  Play,
  Send,
  RotateCcw,
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle,
  Code2,
  Terminal,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function LeetCodeGame({ hud, view, send }: GameProps) {
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(STARTER_TEMPLATES.javascript);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setCode(STARTER_TEMPLATES[lang]);
    setExecResult(null);
  };

  const handleReset = () => {
    setCode(STARTER_TEMPLATES[language]);
    setExecResult(null);
    setSubmitError(null);
  };

  const handleLoadSolution = () => {
    setCode(REFERENCE_SOLUTIONS[language]);
    setSubmitError(null);
  };

  const handleRunCode = () => {
    setActiveTab('result');
    setSubmitError(null);
    const result = executeTests(code, language, false);
    setExecResult(result);
  };

  const handleSubmit = async () => {
    setActiveTab('result');
    setIsSubmitting(true);
    setSubmitError(null);

    // Run against all 13 test cases (3 visible + 10 locked)
    const result = executeTests(code, language, true);
    setExecResult(result);

    if (result.passed) {
      try {
        await send({ code, language });
      } catch (err: any) {
        setSubmitError(err?.message || 'Submission failed on server');
      }
    } else {
      setSubmitError(
        result.error ||
        `Failed on testcase ${result.results.find((r) => !r.passed)?.id ?? 'unknown'}. All 13 testcases must pass.`
      );
    }
    setIsSubmitting(false);
  };

  const currentTestCase = ALL_TEST_CASES[selectedCaseIndex] ?? ALL_TEST_CASES[0];

  return (
    <div className="mx-auto flex h-screen max-w-[1600px] flex-col gap-2 overflow-hidden px-4 py-3">
      {hud}

      {/* Main LeetCode Workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12">
        {/* Left Pane: Problem Description (5 cols) */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-emerald-950/70 bg-zinc-950/90 shadow-xl lg:col-span-5">
          {/* Problem Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-sm font-bold text-zinc-100">1. Two Sum</span>
              <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-800/60">
                Easy
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="rounded bg-zinc-800/70 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                Array
              </span>
              <span className="rounded bg-zinc-800/70 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                Hash Table
              </span>
            </div>
          </div>

          {/* Description Scroll Area */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 font-sans text-sm leading-relaxed text-zinc-300">
            <div>
              <p className="text-zinc-200">
                Given an array of integers <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-emerald-300">nums</code> and an integer <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-emerald-300">target</code>, return <em>indices of the two numbers such that they add up to <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-emerald-300">target</code></em>.
              </p>
              <p className="mt-2 text-zinc-400 text-xs">
                You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.
              </p>
            </div>

            {/* 3 Visible Test Cases */}
            <div className="space-y-3 pt-2">
              <div className="font-mono text-xs font-bold tracking-wider text-emerald-400">
                VISIBLE EXAMPLES
              </div>

              {VISIBLE_TEST_CASES.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-3.5 space-y-1.5"
                >
                  <div className="font-mono text-xs font-semibold text-zinc-300">
                    Example {idx + 1}:
                  </div>
                  <div className="font-mono text-xs space-y-1 text-zinc-300 bg-black/40 p-2.5 rounded border border-zinc-800/50">
                    <div>
                      <span className="text-zinc-500">Input: </span>
                      nums = [{ex.nums.join(', ')}], target = {ex.target}
                    </div>
                    <div>
                      <span className="text-zinc-500">Output: </span>
                      <span className="text-emerald-400">[{ex.expected.join(', ')}]</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-zinc-400 text-[11px] pt-1">
                        <span className="text-zinc-500">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Locked Testcases Notice */}
            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
              <Lock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-200">10 Locked Test Cases: </span>
                Submissions are rigorously tested against 10 hidden edge cases (negative values, duplicates, large integers, and boundary positions).
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-1.5 pt-2">
              <div className="font-mono text-xs font-bold tracking-wider text-zinc-400">
                CONSTRAINTS
              </div>
              <ul className="list-disc pl-5 font-mono text-xs space-y-1 text-zinc-400">
                <li><code className="text-zinc-300">2 &le; nums.length &le; 10⁴</code></li>
                <li><code className="text-zinc-300">-10⁹ &le; nums[i] &le; 10⁹</code></li>
                <li><code className="text-zinc-300">-10⁹ &le; target &le; 10⁹</code></li>
                <li>Only one valid answer exists.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Pane: Code Editor & Runner Console (7 cols) */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-emerald-950/70 bg-zinc-950/90 shadow-xl lg:col-span-7">
          {/* Editor Header / Language Bar */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2">
            <div className="flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                {(['javascript', 'python', 'java', 'c'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={
                      'rounded px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-all ' +
                      (language === lang
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200')
                    }
                  >
                    {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python 3' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reset code to template"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Code
              </button>
            </div>
          </div>

          {/* Code Textarea with line numbers */}
          <div className="relative min-h-0 flex-1 overflow-hidden bg-black/60 font-mono text-sm">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-6 text-zinc-100 outline-none selection:bg-emerald-500/30 selection:text-white"
              style={{ tabSize: 4 }}
              placeholder="Write your code here..."
            />
          </div>

          {/* Bottom Console / Testcase Drawer */}
          <div className="flex h-56 shrink-0 flex-col border-t border-zinc-800/80 bg-zinc-900/90">
            {/* Drawer Header & Tabs */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('testcase')}
                  className={
                    'flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs font-semibold transition-colors ' +
                    (activeTab === 'testcase'
                      ? 'bg-zinc-800 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200')
                  }
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Testcase
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('result')}
                  className={
                    'flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs font-semibold transition-colors ' +
                    (activeTab === 'result'
                      ? 'bg-zinc-800 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200')
                  }
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Test Result
                  {execResult && (
                    <span
                      className={
                        'ml-1 rounded-full px-1.5 py-0.2 text-[10px] ' +
                        (execResult.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400')
                      }
                    >
                      {execResult.passedCount}/{execResult.totalRun}
                    </span>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                  Run (3 Cases)
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-500 px-4 py-1.5 font-mono text-xs font-bold text-black transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Testing All 13...' : 'Submit (All 13 Cases)'}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs font-mono">
              {activeTab === 'testcase' ? (
                <div className="space-y-3">
                  {/* Testcase selector pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ALL_TEST_CASES.map((tc, idx) => (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setSelectedCaseIndex(idx)}
                        className={
                          'flex items-center gap-1 rounded px-2.5 py-1 text-[11px] transition-colors ' +
                          (selectedCaseIndex === idx
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/60'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700')
                        }
                      >
                        {tc.locked ? <Lock className="h-2.5 w-2.5 text-amber-400" /> : null}
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Selected Test Case Details */}
                  <div className="rounded-lg border border-zinc-800 bg-black/40 p-3 space-y-2">
                    {currentTestCase.locked ? (
                      <div className="space-y-1.5 text-zinc-400 py-1">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold">
                          <Lock className="h-4 w-4" />
                          Locked Test Case #{currentTestCase.id} ({currentTestCase.tag})
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          This test case is evaluated automatically when you click <strong>Submit</strong>. Its parameters remain locked to prevent hardcoded index returns.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-zinc-300">
                        <div>
                          <span className="text-zinc-500">nums = </span>
                          <span className="text-emerald-300">[{currentTestCase.nums.join(', ')}]</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">target = </span>
                          <span className="text-emerald-300">{currentTestCase.target}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">expected = </span>
                          <span className="text-zinc-400">[{currentTestCase.expected.join(', ')}]</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Result Tab */
                <div className="space-y-3">
                  {execResult ? (
                    <div className="space-y-2.5">
                      {execResult.error ? (
                        <div className="rounded-lg border border-red-800/80 bg-red-950/40 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                            <XCircle className="h-5 w-5" />
                            Compile / Syntax Error
                          </div>
                          <pre className="font-mono text-xs text-red-200 bg-black/60 p-3 rounded border border-red-900/60 whitespace-pre-wrap">
                            {execResult.error}
                          </pre>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {execResult.passed ? (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Accepted ({execResult.passedCount}/{execResult.totalRun} Passed)
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                                  <XCircle className="h-4 w-4" />
                                  Wrong Answer ({execResult.passedCount}/{execResult.totalRun} Passed)
                                </div>
                              )}
                            </div>

                            {execResult.runtimeMs !== undefined && (
                              <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                                <Clock className="h-3 w-3" />
                                Runtime: {execResult.runtimeMs} ms
                              </div>
                            )}
                          </div>

                          {submitError && (
                            <div className="rounded border border-red-900/60 bg-red-950/30 p-2 text-red-300 text-[11px]">
                              {submitError}
                            </div>
                          )}

                          {/* Result Cases List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {execResult.results.map((r) => (
                              <div
                                key={r.id}
                                className={
                                  'rounded border p-2 text-[11px] space-y-1 ' +
                                  (r.passed
                                    ? 'border-emerald-900/50 bg-emerald-950/15 text-zinc-300'
                                    : 'border-red-900/50 bg-red-950/20 text-red-200')
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">
                                    {r.locked ? '🔒 ' : ''}Case {r.id}
                                  </span>
                                  <span className={r.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                                    {r.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>

                                {!r.locked && (
                                  <div className="text-[10px] text-zinc-400 space-y-0.5 font-mono">
                                    <div>target: {r.input.target}</div>
                                    <div>expected: [{r.expected.join(', ')}]</div>
                                    <div>actual: {r.error ? r.error : Array.isArray(r.actual) ? `[${r.actual.join(', ')}]` : String(r.actual)}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {execResult.passed && execResult.totalRun === ALL_TEST_CASES.length && (
                        <div className="rounded-lg border border-emerald-600/70 bg-emerald-950/40 p-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold">
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            ALL 13 TEST CASES PASSED!
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Key fragment unlocked successfully.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center text-zinc-500">
                      Click &ldquo;Run (3 Cases)&rdquo; or &ldquo;Submit (All 13 Cases)&rdquo; to test your code.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
