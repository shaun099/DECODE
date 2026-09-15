import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ExecutionResult {
  success: boolean;
  error?: string | null;
  testResults: {
    input: string;
    expected: string;
    actual?: string;
    passed: boolean;
  }[];
}

export async function runJavaScript(
  code: string,
  fnName: string,
  testCases: { input: any[]; expected: any }[]
): Promise<ExecutionResult> {
  try {
    const harnessCode = `
${code}
(function() {
  const __testCases = ${JSON.stringify(testCases)};
  let __fn;
  try {
    __fn = ${fnName};
  } catch (e) {
    return { success: false, error: "ReferenceError: Function '${fnName}' is not defined.", testResults: [] };
  }
  if (typeof __fn !== 'function') {
    return { success: false, error: "TypeError: '${fnName}' is not a function.", testResults: [] };
  }

  const __results = [];
  let __allPassed = true;
  let __errorMsg = null;

  for (let i = 0; i < __testCases.length; i++) {
    const tc = __testCases[i];
    try {
      const actual = __fn(...tc.input);
      const passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
      __results.push({
        input: JSON.stringify(tc.input),
        expected: JSON.stringify(tc.expected),
        actual: JSON.stringify(actual),
        passed: passed
      });
      if (!passed) {
        __allPassed = false;
        __errorMsg = 'Test Case ' + (i + 1) + ' Failed.\\nInput: ' + JSON.stringify(tc.input) + '\\nExpected: ' + JSON.stringify(tc.expected) + '\\nReceived: ' + JSON.stringify(actual);
        break;
      }
    } catch (e) {
      __results.push({
        input: JSON.stringify(tc.input),
        expected: JSON.stringify(tc.expected),
        actual: 'Runtime Error: ' + (e?.message || String(e)),
        passed: false
      });
      __allPassed = false;
      __errorMsg = 'Runtime Error on Test Case ' + (i + 1) + ': ' + (e?.message || String(e));
      break;
    }
  }

  return { success: __allPassed, error: __errorMsg, testResults: __results };
})()
`;

    const script = new vm.Script(harnessCode);
    const sandbox = Object.create(null);
    const context = vm.createContext(sandbox);
    const result = script.runInContext(context, { timeout: 1500 });
    return result;
  } catch (err: any) {
    if (err?.message && err.message.includes('Script execution timed out')) {
      return {
        success: false,
        error: 'Execution Timeout: Code took longer than 1500ms (possible infinite loop).',
        testResults: [],
      };
    }
    return {
      success: false,
      error: `Syntax / Execution Error:\n${err?.message || String(err)}`,
      testResults: [],
    };
  }
}

export async function runPython(
  code: string,
  fnName: string,
  testCases: { input: any[]; expected: any }[]
): Promise<ExecutionResult> {
  const harness = `
import json, sys

try:
${code
  .split('\n')
  .map((l) => '    ' + l)
  .join('\n')}
except Exception as e:
    print(json.dumps({"success": False, "error": f"Syntax / Initialization Error: {type(e).__name__}: {str(e)}", "testResults": []}))
    sys.exit(0)

test_cases = ${JSON.stringify(testCases)}
fn = locals().get(${JSON.stringify(fnName)}) or globals().get(${JSON.stringify(fnName)})

if not callable(fn):
    print(json.dumps({"success": False, "error": f"Function '${fnName}' is not defined.", "testResults": []}))
    sys.exit(0)

results = []
all_passed = True
error_msg = None

for i, tc in enumerate(test_cases):
    inp = tc["input"]
    expected = tc["expected"]
    try:
        actual = fn(*inp)
        passed = (actual == expected)
        results.append({
            "input": json.dumps(inp),
            "expected": json.dumps(expected),
            "actual": json.dumps(actual),
            "passed": passed
        })
        if not passed:
            all_passed = False
            error_msg = f"Test Case {i+1} Failed.\\nInput: {json.dumps(inp)}\\nExpected: {json.dumps(expected)}\\nReceived: {json.dumps(actual)}"
            break
    except Exception as e:
        results.append({
            "input": json.dumps(inp),
            "expected": json.dumps(expected),
            "actual": f"Runtime Error: {type(e).__name__}: {str(e)}",
            "passed": False
        })
        all_passed = False
        error_msg = f"Runtime Error on Test Case {i+1}: {type(e).__name__}: {str(e)}"
        break

print(json.dumps({
    "success": all_passed,
    "error": error_msg,
    "testResults": results
}))
`;

  try {
    const { stdout, stderr } = await execFileAsync('python3', ['-c', harness], {
      timeout: 2000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stdout) {
      return {
        success: false,
        error: `Python Syntax Error:\n${stderr.trim()}`,
        testResults: [],
      };
    }

    const res = JSON.parse(stdout.trim());
    return {
      success: !!res.success,
      error: res.error ?? null,
      testResults: res.testResults || [],
    };
  } catch (err: any) {
    if (err?.killed || err?.signal === 'SIGTERM') {
      return {
        success: false,
        error: 'Execution Timeout: Python process exceeded 2000ms limit (possible infinite loop).',
        testResults: [],
      };
    }
    const msg = err?.stderr || err?.stdout || err?.message || String(err);
    return {
      success: false,
      error: `Python Execution Error:\n${String(msg).trim()}`,
      testResults: [],
    };
  }
}

