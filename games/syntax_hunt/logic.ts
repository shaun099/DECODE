export interface SyntaxBug {
  id: string;
  title: string;
  brief: string;              // one line of framing, not a hint
  lines: string[];            // the program, one line per entry
  badLine: number;            // 0-based index of the broken line
  reason: string;             // shown after the answer is locked in
}

/** Six rounds, getting harder. */
export const BUGS: SyntaxBug[] = [
  {
    id: 's1',
    title: 'ROUND 01',
    brief: 'A stock counter refuses to run.',
    lines: [
      'def count_stock(items):',
      '    total = 0',
      '    for item in items',
      '        total += item["qty"]',
      '    return total',
    ],
    badLine: 2,
    reason: 'A for statement must end with a colon. Python needs it to know the header has finished and an indented block follows.',
  },
  {
    id: 's2',
    title: 'ROUND 02',
    brief: 'A report builder crashes before printing anything.',
    lines: [
      'names = ["ravi", "meera", "anand"]',
      'counts = {"ravi": 3, "meera": 1, "anand": 7}',
      '',
      'for name in names:',
      '    print(f"{name}: {counts[name]}"',
      '',
      'print("done")',
    ],
    badLine: 4,
    reason: 'The call to print is never closed. Python keeps reading, so the error is usually reported on a later line than the one at fault.',
  },
  {
    id: 's3',
    title: 'ROUND 03',
    brief: 'A grade classifier will not import.',
    lines: [
      'def grade(mark):',
      '    if mark >= 90:',
      '        return "A"',
      '    elif mark >= 75',
      '        return "B"',
      '    elif mark >= 50:',
      '        return "C"',
      '    else:',
      '        return "F"',
    ],
    badLine: 3,
    reason: 'One elif is missing its colon while the others have theirs. Repetition is what makes a single omission hard to see.',
  },
  {
    id: 's4',
    title: 'ROUND 04',
    brief: 'A config loader fails on the first line it reaches.',
    lines: [
      'settings = {',
      '    "host": "10.0.0.4",',
      '    "port": 8080',
      '    "debug": False,',
      '}',
      '',
      'print(settings["host"])',
    ],
    badLine: 2,
    reason: 'A comma is missing after the port value. Python reads the next line as a continuation of the same entry, and the error surfaces one line further down than the mistake.',
  },
  {
    id: 's5',
    title: 'ROUND 05',
    brief: 'A ledger check runs, then stops with a complaint about indentation.',
    lines: [
      'def audit(rows):',
      '    flagged = []',
      '    for row in rows:',
      '        if row["amount"] > 10000:',
      '            flagged.append(row)',
      '         elif row["amount"] < 0:',
      '            flagged.append(row)',
      '    return flagged',
    ],
    badLine: 5,
    reason: 'The elif is indented one space deeper than its if. Python requires them at the same level, and a single space is almost invisible.',
  },
  {
    id: 's6',
    title: 'ROUND 06',
    brief: 'A parser refuses to start. The error message points at the last line.',
    lines: [
      'def parse(line):',
      '    parts = line.split(",")',
      '    record = {',
      '        "id": parts[0],',
      '        "name": parts[1],',
      '        "score": int(parts[2])',
      '    return record',
      '',
      'print(parse("7,meera,88"))',
    ],
    badLine: 2,
    reason: 'The dictionary opened here is never closed. Python treats the return as part of it, so the reported error lands far from the real fault.',
  },
];