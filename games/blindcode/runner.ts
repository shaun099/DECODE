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
    const sandbox = {
      Array,
      String,
      Number,
      Boolean,
      Math,
      JSON,
      RegExp,
      Object,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Map,
      Set,
    };
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

test_cases = json.loads(${JSON.stringify(JSON.stringify(testCases))})
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
        try:
            act_str = json.dumps(actual)
        except Exception:
            act_str = str(actual)
        results.append({
            "input": json.dumps(inp),
            "expected": json.dumps(expected),
            "actual": act_str,
            "passed": passed
        })
        if not passed:
            all_passed = False
            error_msg = f"Test Case {i+1} Failed.\\nInput: {json.dumps(inp)}\\nExpected: {json.dumps(expected)}\\nReceived: {act_str}"
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

export async function runC(
  code: string,
  problemId: string,
  _fnName: string,
  _testCases: { input: any[]; expected: any }[]
): Promise<ExecutionResult> {
  const tmpId = `blindcode_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const srcPath = `/tmp/${tmpId}.c`;
  const binPath = `/tmp/${tmpId}.out`;

  let harnessMain = '';
  if (problemId === 'square') {
    harnessMain = `
int main() {
    int inputs[] = {5, -3, 0, 12, 1};
    int expecteds[] = {25, 9, 0, 144, 1};
    int num_tests = sizeof(inputs) / sizeof(inputs[0]);

    printf("{\\\"success\\\": true, \\\"testResults\\\": [");
    int all_passed = 1;
    char error_msg[256] = "";
    for (int i = 0; i < num_tests; i++) {
        int inp = inputs[i];
        int exp = expecteds[i];
        int act = square(inp);
        int passed = (act == exp);
        if (i > 0) printf(",");
        printf("{\\\"input\\\": \\\"[%d]\\\", \\\"expected\\\": \\\"%d\\\", \\\"actual\\\": \\\"%d\\\", \\\"passed\\\": %s}",
               inp, exp, act, passed ? "true" : "false");
        if (!passed && all_passed) {
            all_passed = 0;
            snprintf(error_msg, sizeof(error_msg), "Test Case %d Failed.\\nInput: [%d]\\nExpected: %d\\nReceived: %d", i+1, inp, exp, act);
        }
    }
    printf("], \\\"allPassed\\\": %s}\\n", all_passed ? "true" : "false");
    return 0;
}
`;
  } else if (problemId === 'reverse_string') {
    harnessMain = `
int main() {
    const char* inputs[] = {"hello", "world", "blind", "racecar", ""};
    const char* expecteds[] = {"olleh", "dlrow", "dnilb", "racecar", ""};
    int num_tests = sizeof(inputs) / sizeof(inputs[0]);

    printf("{\\\"success\\\": true, \\\"testResults\\\": [");
    int all_passed = 1;
    for (int i = 0; i < num_tests; i++) {
        const char* inp = inputs[i];
        const char* exp = expecteds[i];
        char* act = reverse_string(inp);
        int passed = (act != NULL && strcmp(act, exp) == 0);
        if (i > 0) printf(",");
        printf("{\\\"input\\\": \\\"[\\\\\\\"%s\\\\\\\"]\\\", \\\"expected\\\": \\\"\\\\\\\"%s\\\\\\\"\\\", \\\"actual\\\": \\\"\\\\\\\"%s\\\\\\\"\\\", \\\"passed\\\": %s}",
               inp, exp, act ? act : "NULL", passed ? "true" : "false");
        if (!passed && all_passed) {
            all_passed = 0;
        }
    }
    printf("], \\\"allPassed\\\": %s}\\n", all_passed ? "true" : "false");
    return 0;
}
`;
  } else if (problemId === 'is_even') {
    harnessMain = `
int main() {
    int inputs[] = {4, 7, 0, -2, -9};
    int expecteds[] = {1, 0, 1, 1, 0};
    int num_tests = sizeof(inputs) / sizeof(inputs[0]);

    printf("{\\\"success\\\": true, \\\"testResults\\\": [");
    int all_passed = 1;
    for (int i = 0; i < num_tests; i++) {
        int inp = inputs[i];
        int exp = expecteds[i];
        int act = is_even(inp) ? 1 : 0;
        int passed = (act == exp);
        if (i > 0) printf(",");
        printf("{\\\"input\\\": \\\"[%d]\\\", \\\"expected\\\": \\\"%s\\\", \\\"actual\\\": \\\"%s\\\", \\\"passed\\\": %s}",
               inp, exp ? "true" : "false", act ? "true" : "false", passed ? "true" : "false");
        if (!passed && all_passed) {
            all_passed = 0;
        }
    }
    printf("], \\\"allPassed\\\": %s}\\n", all_passed ? "true" : "false");
    return 0;
}
`;
  } else if (problemId === 'sum_array') {
    harnessMain = `
int main() {
    int a1[] = {1, 2, 3, 4};
    int a2[] = {-5, 5};
    int a3[] = {0};
    int a4[] = {100, 200, 300};
    int a5[] = {42};

    const int* inputs[] = {a1, a2, a3, a4, a5};
    int sizes[] = {4, 2, 0, 3, 1};
    int expecteds[] = {10, 0, 0, 600, 42};
    const char* in_strs[] = {"[1, 2, 3, 4]", "[-5, 5]", "[]", "[100, 200, 300]", "[42]"};
    int num_tests = sizeof(sizes) / sizeof(sizes[0]);

    printf("{\\\"success\\\": true, \\\"testResults\\\": [");
    int all_passed = 1;
    for (int i = 0; i < num_tests; i++) {
        int act = sum_array(inputs[i], sizes[i]);
        int exp = expecteds[i];
        int passed = (act == exp);
        if (i > 0) printf(",");
        printf("{\\\"input\\\": \\\"[%s]\\\", \\\"expected\\\": \\\"%d\\\", \\\"actual\\\": \\\"%d\\\", \\\"passed\\\": %s}",
               in_strs[i], exp, act, passed ? "true" : "false");
        if (!passed && all_passed) {
            all_passed = 0;
        }
    }
    printf("], \\\"allPassed\\\": %s}\\n", all_passed ? "true" : "false");
    return 0;
}
`;
  } else if (problemId === 'count_vowels') {
    harnessMain = `
int main() {
    const char* inputs[] = {"hello", "sky", "AEIOU", "blind coding challenge", ""};
    int expecteds[] = {2, 0, 5, 6, 0};
    int num_tests = sizeof(inputs) / sizeof(inputs[0]);

    printf("{\\\"success\\\": true, \\\"testResults\\\": [");
    int all_passed = 1;
    for (int i = 0; i < num_tests; i++) {
        const char* inp = inputs[i];
        int exp = expecteds[i];
        int act = count_vowels(inp);
        int passed = (act == exp);
        if (i > 0) printf(",");
        printf("{\\\"input\\\": \\\"[\\\\\\\"%s\\\\\\\"]\\\", \\\"expected\\\": \\\"%d\\\", \\\"actual\\\": \\\"%d\\\", \\\"passed\\\": %s}",
               inp, exp, act, passed ? "true" : "false");
        if (!passed && all_passed) {
            all_passed = 0;
        }
    }
    printf("], \\\"allPassed\\\": %s}\\n", all_passed ? "true" : "false");
    return 0;
}
`;
  }

  const fullSource = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>
#include <math.h>

${code}

${harnessMain}
`;

  try {
    const fs = await import('node:fs/promises');
    await fs.writeFile(srcPath, fullSource, 'utf8');

    // Compile with gcc
    try {
      await execFileAsync('gcc', ['-O2', '-Wall', '-Wno-unused-variable', srcPath, '-o', binPath, '-lm'], {
        timeout: 4000,
      });
    } catch (compileErr: any) {
      const errOut = compileErr?.stderr || compileErr?.stdout || compileErr?.message || String(compileErr);
      return {
        success: false,
        error: `C Compilation Error:\n${String(errOut).trim()}`,
        testResults: [],
      };
    }

    // Execute binary
    const { stdout, stderr } = await execFileAsync(binPath, [], {
      timeout: 2000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stdout) {
      return {
        success: false,
        error: `C Runtime Error:\n${stderr.trim()}`,
        testResults: [],
      };
    }

    const res = JSON.parse(stdout.trim());
    return {
      success: !!res.allPassed,
      error: res.allPassed ? null : 'One or more test cases failed.',
      testResults: res.testResults || [],
    };
  } catch (err: any) {
    if (err?.killed || err?.signal === 'SIGTERM') {
      return {
        success: false,
        error: 'Execution Timeout: C binary took longer than 2000ms (possible infinite loop).',
        testResults: [],
      };
    }
    const msg = err?.stderr || err?.stdout || err?.message || String(err);
    return {
      success: false,
      error: `C Execution Error:\n${String(msg).trim()}`,
      testResults: [],
    };
  } finally {
    const fs = await import('node:fs/promises');
    await fs.unlink(srcPath).catch(() => {});
    await fs.unlink(binPath).catch(() => {});
  }
}


