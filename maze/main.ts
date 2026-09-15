import './style.css';

type Question = { q: string; options: string[]; answer: number };
type Cell = { r: number; c: number };

const ROWS = 21;
const COLS = 31;
const TOTAL_TIME = 5 * 60;

const easyQuestions: Question[] = [
  { q:'Which data structure follows LIFO?', options:['Queue','Stack','Graph','Heap'], answer:1 },
  { q:'What does CPU stand for?', options:['Central Processing Unit','Computer Primary Utility','Core Program Unit','Central Program User'], answer:0 },
  { q:'Which language is mainly used to style web pages?', options:['HTML','CSS','SQL','C'], answer:1 },
  { q:'Which SQL command is used to retrieve data?', options:['GET','SELECT','FETCHROW','READ'], answer:1 },
  { q:'Which data structure follows FIFO?', options:['Stack','Queue','Tree','Array'], answer:1 },
  { q:'What is the main purpose of an operating system?', options:['Manage computer resources','Design websites','Compile only Java','Store only images'], answer:0 },
  { q:'Which is a valid primary key property?', options:['It can be duplicated','It uniquely identifies a row','It must be a password','It stores only text'], answer:1 },
  { q:'What is an algorithm?', options:['A programming language','A step-by-step solution to a problem','A database','A CPU register'], answer:1 },
  { q:'Which protocol is commonly used for web pages?', options:['HTTP','FTP only','SMTP only','BIOS'], answer:0 },
  { q:'What does RAM provide?', options:['Temporary working memory','Permanent optical storage','Internet access','Power supply'], answer:0 },
];

const harderQuestions: Question[] = [
  { q:'What is the average-case time complexity of binary search on a sorted array?', options:['O(1)','O(log n)','O(n)','O(n log n)'], answer:1 },
  { q:'Which normal form removes partial dependency on a composite key?', options:['1NF','2NF','3NF','BCNF'], answer:1 },
  { q:'Which CPU scheduling algorithm can cause starvation?', options:['FCFS','Round Robin','Priority Scheduling','FIFO disk scheduling'], answer:2 },
  { q:'Which traversal of a BST visits keys in sorted order?', options:['Preorder','Postorder','Inorder','Level order'], answer:2 },
  { q:'Which protocol maps an IP address to a MAC address on a local network?', options:['DNS','ARP','HTTP','DHCP'], answer:1 },
  { q:'What does a page fault indicate?', options:['A CPU overflow','A referenced page is not currently in physical memory','A database lock','A syntax error'], answer:1 },
  { q:'Which compiler phase converts source code into tokens?', options:['Lexical analysis','Code generation','Optimization','Linking'], answer:0 },
  { q:'For a connected graph with n vertices, a spanning tree has how many edges?', options:['n-1','n','n+1','2n'], answer:0 },
  { q:'Which ACID property ensures a transaction is all-or-nothing?', options:['Consistency','Isolation','Atomicity','Durability'], answer:2 },
  { q:'Which technique uses overlapping subproblems and optimal substructure?', options:['Dynamic programming','Linear probing','Paging','Lexical analysis'], answer:0 },
];

const maze = document.querySelector<HTMLDivElement>('#maze')!;
const startBtn = document.querySelector<HTMLButtonElement>('#startBtn')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submitBtn')!;
const levelLabel = document.querySelector<HTMLElement>('#levelLabel')!;
const doorsLabel = document.querySelector<HTMLElement>('#doorsLabel')!;
const livesLabel = document.querySelector<HTMLElement>('#livesLabel')!;
const timerLabel = document.querySelector<HTMLElement>('#timerLabel')!;
const mazeTitle = document.querySelector<HTMLElement>('#mazeTitle')!;
const questionTitle = document.querySelector<HTMLElement>('#questionTitle')!;
const questionText = document.querySelector<HTMLElement>('#questionText')!;
const answersEl = document.querySelector<HTMLDivElement>('#answers')!;
const feedback = document.querySelector<HTMLDivElement>('#feedback')!;
const progressBar = document.querySelector<HTMLDivElement>('#progressBar')!;
const progressText = document.querySelector<HTMLElement>('#progressText')!;
const modal = document.querySelector<HTMLDivElement>('#modal')!;
const modalIcon = document.querySelector<HTMLElement>('#modalIcon')!;
const modalEyebrow = document.querySelector<HTMLElement>('#modalEyebrow')!;
const modalTitle = document.querySelector<HTMLElement>('#modalTitle')!;
const modalText = document.querySelector<HTMLElement>('#modalText')!;
const modalBtn = document.querySelector<HTMLButtonElement>('#modalBtn')!;

let level = 1;
let lives = 3;
let secondsLeft = TOTAL_TIME;
let running = false;
let timerId: number | undefined;
let player: Cell = { r: 1, c: 1 };
let exit: Cell = { r: ROWS - 2, c: COLS - 2 };
let walls = new Set<string>();
let doors: Cell[] = [];
let opened = new Set<string>();
let stars = new Set<string>();
let selectedAnswer = -1;
let activeDoor: Cell | null = null;
let cells: HTMLDivElement[] = [];

const key = (r:number,c:number) => `${r},${c}`;
const same = (a:Cell,b:Cell) => a.r === b.r && a.c === b.c;
const inside = (r:number,c:number) => r > 0 && c > 0 && r < ROWS - 1 && c < COLS - 1;

function shuffled<T>(arr:T[]):T[] {
  const copy = [...arr];
  for (let i=copy.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}

function generateMaze() {
  walls = new Set<string>();
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) walls.add(key(r,c));
  const stack: Cell[] = [{r:1,c:1}];
  walls.delete(key(1,1));
  const dirs = [{dr:-2,dc:0},{dr:2,dc:0},{dr:0,dc:-2},{dr:0,dc:2}];
  while(stack.length) {
    const cur = stack[stack.length-1];
    const choices = shuffled(dirs).filter(d => inside(cur.r+d.dr,cur.c+d.dc) && walls.has(key(cur.r+d.dr,cur.c+d.dc)));
    if (!choices.length) { stack.pop(); continue; }
    const d = choices[0];
    walls.delete(key(cur.r+d.dr,cur.c+d.dc));
    walls.delete(key(cur.r+d.dr/2,cur.c+d.dc/2));
    stack.push({r:cur.r+d.dr,c:cur.c+d.dc});
  }
  // Make the final cell definitely reachable and use it as the exit.
  exit = {r:ROWS-2,c:COLS-2};
  walls.delete(key(exit.r,exit.c));
  walls.delete(key(exit.r,exit.c-1));
  walls.delete(key(exit.r-1,exit.c));
  walls.delete(key(1,2));
}

function neighbors(p:Cell): Cell[] {
  return [{r:p.r-1,c:p.c},{r:p.r+1,c:p.c},{r:p.r,c:p.c-1},{r:p.r,c:p.c+1}]
    .filter(n => n.r>=0 && n.r<ROWS && n.c>=0 && n.c<COLS && !walls.has(key(n.r,n.c)));
}

function findPath(): Cell[] {
  const start = {r:1,c:1};
  const q:Cell[]=[start];
  const prev = new Map<string,string>();
  const seen = new Set<string>([key(start.r,start.c)]);
  while(q.length) {
    const cur=q.shift()!;
    if(same(cur,exit)) break;
    for(const n of neighbors(cur)) {
      if(!seen.has(key(n.r,n.c))) { seen.add(key(n.r,n.c)); prev.set(key(n.r,n.c),key(cur.r,cur.c)); q.push(n); }
    }
  }
  const path:Cell[]=[];
  let cur:Cell|undefined=exit;
  while(cur) {
    path.push(cur);
    if(same(cur,start)) break;
    const p=prev.get(key(cur.r,cur.c));
    if(!p) break;
    const [r,c]=p.split(',').map(Number); cur={r,c};
  }
  return path.reverse();
}

function placeObstacles() {
  doors=[]; opened.clear(); stars.clear();
  const path=findPath();
  // Put exactly 5 doors on level 1; level 2 has 10 total doors.
  const count = level === 1 ? 5 : 10;
  const usable = path.slice(3,-3).filter(p => !same(p,player) && !same(p,exit));
  const picks = shuffled(usable);
  // Spread doors through the route so every door is a genuine obstacle on the main route.
  const step = Math.max(1, Math.floor(picks.length / (count + 1)));
  const selected:Cell[]=[];
  for(let i=1;i<=count;i++) {
    const p=picks[Math.min(picks.length-1,i*step)];
    if(p && !selected.some(x=>same(x,p))) selected.push(p);
  }
  // Fallback if the random selection collided.
  for(const p of path.slice(4,-4)) {
    if(selected.length>=count) break;
    if(!selected.some(x=>same(x,p))) selected.push(p);
  }
  doors=selected.slice(0,count);
  for(const p of path.filter((_,i)=>i%Math.max(5,Math.floor(path.length/8))===2).slice(0,8)) stars.add(key(p.r,p.c));
}

function render() {
  maze.innerHTML=''; cells=[];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    const el=document.createElement('div');
    el.className='cell '+(walls.has(key(r,c))?'wall':'floor');
    if(stars.has(key(r,c)) && !same(player,{r,c})) el.classList.add('star');
    const door=doors.find(d=>same(d,{r,c}));
    if(door) {
      el.classList.add('door');
      if (opened.has(key(r,c))) el.classList.add('open');
    }
    if(same(exit,{r,c})) el.classList.add('exit');
    if(same(player,{r,c})) el.classList.add('player');
    maze.appendChild(el); cells.push(el);
  }
}

function updateHUD() {
  const openedCount=doors.filter(d=>opened.has(key(d.r,d.c))).length;
  levelLabel.textContent=`${level} / 2`;
  doorsLabel.textContent=`${openedCount} / ${doors.length}`;
  livesLabel.textContent='♥ '.repeat(lives).trim() || '0';
  const min=Math.floor(secondsLeft/60).toString().padStart(2,'0');
  const sec=(secondsLeft%60).toString().padStart(2,'0');
  timerLabel.textContent=`${min}:${sec}`;
  mazeTitle.textContent=level===1?'LEVEL 1 — CSE BASICS':'LEVEL 2 — CSE CHALLENGE';
  const totalDoors=level===1?5:10;
  const totalProgress=level===1?openedCount:5+openedCount;
  const percent=Math.round((totalProgress/15)*100);
  progressBar.style.width=`${Math.min(100,percent)}%`;
  progressText.textContent=`${Math.min(100,percent)}% complete • ${totalProgress} / 15 doors cleared across both levels`;
}

function questionForDoor(index:number):Question {
  const bank=level===1?easyQuestions:harderQuestions;
  return bank[index % bank.length];
}

function openQuestion(door:Cell) {
  const index=doors.findIndex(d=>same(d,door));
  activeDoor=door;
  selectedAnswer=-1;
  const q=questionForDoor(index);
  questionTitle.textContent=`LOCKED DOOR ${index+1}`;
  questionText.textContent=q.q;
  answersEl.innerHTML='';
  q.options.forEach((option,i)=>{
    const b=document.createElement('button'); b.className='answer'; b.textContent=`${String.fromCharCode(65+i)}. ${option}`;
    b.onclick=()=>{ selectedAnswer=i; [...answersEl.children].forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); submitBtn.disabled=false; };
    answersEl.appendChild(b);
  });
  feedback.textContent=''; feedback.className='feedback'; submitBtn.disabled=true;
}

function clearQuestionPanel() {
  activeDoor=null; selectedAnswer=-1; questionTitle.textContent='Keep moving'; questionText.textContent='Find the next locked door or reach the glowing exit.'; answersEl.innerHTML=''; submitBtn.disabled=true; feedback.textContent='';
}

function attemptMove(dr:number,dc:number) {
  if(!running) return;
  const next={r:player.r+dr,c:player.c+dc};
  if(next.r<0||next.r>=ROWS||next.c<0||next.c>=COLS||walls.has(key(next.r,next.c))) return;
  const door=doors.find(d=>same(d,next));
  if(door && !opened.has(key(door.r,door.c))) { openQuestion(door); return; }
  player=next; render(); updateHUD();
  if(same(player,exit)) {
    const allDoorsOpen = doors.every(d => opened.has(key(d.r,d.c)));
    if(allDoorsOpen) finishLevel();
    else {
      feedback.textContent=`Exit locked — clear all ${doors.length} doors first.`; feedback.className='feedback bad';
      questionTitle.textContent='EXIT LOCKED';
      questionText.textContent='Every locked door on this level must be opened before the exit will accept you.';
    }
  }
}

function submitAnswer() {
  if(!activeDoor || selectedAnswer<0 || !running) return;
  const door = activeDoor;
  const index=doors.findIndex(d=>same(d,door));
  const q=questionForDoor(index);
  if(selectedAnswer===q.answer) {
    opened.add(key(door.r,door.c));
    feedback.textContent='Correct — door unlocked.'; feedback.className='feedback good';
    activeDoor=null; selectedAnswer=-1;
    setTimeout(()=>{ if(running){ player=door; render(); updateHUD(); clearQuestionPanel(); } },220);
  } else {
    lives--; feedback.textContent='Incorrect — one life lost. Try again.'; feedback.className='feedback bad';
    selectedAnswer=-1; submitBtn.disabled=true; [...answersEl.children].forEach(x=>x.classList.remove('selected'));
    if(lives<=0) endGame('NO LIVES LEFT','The maze locked down before you could recover the key fragment.');
  }
  updateHUD();
}

function finishLevel() {
  if(level===1) {
    running=false; stopTimer(); showModal('🔑','KEY FRAGMENT 1 / 2','Key Fragment Acquired!','You cleared Level 1 and recovered the first part of the key. The second maze has 10 locked doors.','CONTINUE TO LEVEL 2',()=>{ level=2; lives=3; player={r:1,c:1}; generateMaze(); placeObstacles(); render(); updateHUD(); hideModal(); running=true; startTimer(); clearQuestionPanel(); });
  } else {
    endGame('🔑 KEY COMPLETE','You cleared both levels in time and recovered the final part of the key.');
  }
}

function showModal(icon:string, eyebrow:string, title:string, text:string, button:string, action:()=>void) {
  modalIcon.textContent=icon; modalEyebrow.textContent=eyebrow; modalTitle.textContent=title; modalText.textContent=text; modalBtn.textContent=button; modalBtn.onclick=action; modal.classList.remove('hidden');
}
function hideModal(){ modal.classList.add('hidden'); }
function endGame(title:string,text:string){ running=false; stopTimer(); showModal('🔑','MISSION COMPLETE',title,text,'PLAY AGAIN',()=>{hideModal(); resetGame(); startGame();}); }
function startTimer(){ stopTimer(); timerId=window.setInterval(()=>{ if(!running)return; secondsLeft--; updateHUD(); if(secondsLeft<=0) endGame('TIME UP','Five minutes have elapsed. The key fragment remains locked inside the maze.'); },1000); }
function stopTimer(){ if(timerId!==undefined){clearInterval(timerId); timerId=undefined;} }
function resetGame(){ stopTimer(); level=1; lives=3; secondsLeft=TOTAL_TIME; player={r:1,c:1}; activeDoor=null; selectedAnswer=-1; generateMaze(); placeObstacles(); render(); updateHUD(); clearQuestionPanel(); }
function startGame(){ if(running)return; hideModal(); if(secondsLeft===TOTAL_TIME && level===1 && doors.length===5){ running=true; startTimer(); questionTitle.textContent='Maze active'; questionText.textContent='Use arrow keys or WASD. Locked doors require a CSE answer.'; } else { resetGame(); running=true; startTimer(); } updateHUD(); }

window.addEventListener('keydown',(e)=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) e.preventDefault();
  const k=e.key.toLowerCase();
  if(e.key==='ArrowUp'||k==='w') attemptMove(-1,0);
  else if(e.key==='ArrowDown'||k==='s') attemptMove(1,0);
  else if(e.key==='ArrowLeft'||k==='a') attemptMove(0,-1);
  else if(e.key==='ArrowRight'||k==='d') attemptMove(0,1);
});
startBtn.onclick=()=>{ if(!running){ resetGame(); startGame(); } };
submitBtn.onclick=submitAnswer;
resetGame();
