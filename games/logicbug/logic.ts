export interface LogicBug {
  id: string;
  title: string;
  /** What the program is meant to do. The bug is only wrong against this. */
  spec: string[];
  lines: string[];
  badLine: number;
  reason: string;
}

export const BUGS: LogicBug[] = [
  {
    id: 'l1',
    title: 'ROUND 01',
    spec: [
      'The exam office needs the class average.',
      'Every mark in the list must count towards it.',
    ],
    lines: [
      'def average(marks):',
      '    total = 0',
      '    for i in range(len(marks) - 1):',
      '        total += marks[i]',
      '    return total / len(marks)',
    ],
    badLine: 2,
    reason: 'range(len(marks) - 1) stops one short, so the final mark is never added — but it is still counted in the division. For [40, 55, 90, 72, 68] this returns 51.4 instead of 65.0. It runs, it returns a number, and the number is quietly wrong.',
  },
  {
    id: 'l2',
    title: 'ROUND 02',
    spec: [
      'The pass mark is fifty.',
      'A student who scores exactly fifty has passed.',
    ],
    lines: [
      'PASS_MARK = 50',
      '',
      'def passed(marks):',
      '    out = []',
      '    for m in marks:',
      '        if m > PASS_MARK:',
      '            out.append(m)',
      '    return out',
    ],
    badLine: 5,
    reason: 'The specification says fifty passes, but > excludes it. Only >= includes the boundary. Off-by-one on a comparison is invisible until exactly one student scores exactly the pass mark.',
  },
  {
    id: 'l3',
    title: 'ROUND 03',
    spec: [
      'Sum every transaction in the day\'s ledger.',
      'Return one total for the whole list.',
    ],
    lines: [
      'def day_total(rows):',
      '    for row in rows:',
      '        total = 0',
      '        total += row["amount"]',
      '    return total',
    ],
    badLine: 2,
    reason: 'The accumulator is reset on every pass of the loop, so it only ever holds the last row. For [1, 2, 3] it returns 3 instead of 6. The line belongs above the loop, not inside it.',
  },
  {
    id: 'l4',
    title: 'ROUND 04',
    spec: [
      'Count how many rooms are above the safe temperature.',
      'The threshold is 310 and rooms at exactly 310 are safe.',
    ],
    lines: [
      'def too_hot(readings):',
      '    count = 0',
      '    for r in readings:',
      '        if r > 310:',
      '            count += 1',
      '        else:',
      '            count = 0',
      '    return count',
    ],
    badLine: 6,
    reason: 'The else branch resets the count to zero, so the function returns only the length of the final unbroken run of hot rooms — not the total. If the last reading is cool it returns zero however many were hot.',
  },
  {
    id: 'l5',
    title: 'ROUND 05',
    spec: [
      'Report whether a target appears anywhere in the list.',
      'The whole list must be searched before giving up.',
    ],
    lines: [
      'def contains(items, target):',
      '    for item in items:',
      '        if item == target:',
      '            return True',
      '        else:',
      '            return False',
    ],
    badLine: 4,
    reason: 'The else returns on the first item, so only position zero is ever examined. contains([1, 2, 3], 3) returns False. The return False belongs after the loop, at function level — it means "searched everything, found nothing".',
  },
  {
    id: 'l6',
    title: 'ROUND 06',
    spec: [
      'Average only the readings below 310.',
      'Readings at or above 310 are discarded entirely.',
    ],
    lines: [
      'def mean_safe(readings):',
      '    total = 0',
      '    kept = 0',
      '    for r in readings:',
      '        if r >= 310:',
      '            continue',
      '        total += r',
      '        kept += 1',
      '    return total // len(readings)',
    ],
    badLine: 8,
    reason: 'The filtering is correct and kept holds the right count — but the division uses len(readings), the size of the whole input. For [301, 298, 305, 320, 297] it returns 240 instead of 300. A program that divides by rows it never counted is a program that lies politely.',
  },
];