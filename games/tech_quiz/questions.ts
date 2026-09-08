// 129-question computer science question pool — CS-major difficulty.
// Multiple choice, 4 options each, answer is the index of the correct option.
// The correct-answer index is shuffled at draw time (see logic.shuffleQuestion).
// With 15 questions per round and no repeats until exhausted, this yields ~8
// full rounds before any question can reappear.

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index into options
}

export const QUESTION_POOL: QuizQuestion[] = [
  // ---------- Algorithms & complexity ----------
  { question: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n^2)", "O(n)", "O(n log^2 n)"], answer: 1 },
  { question: "Quicksort's worst case is triggered most reliably by...", options: ["Random pivots", "Already-sorted input with first/last pivot selection", "Arrays with distinct elements", "Small input sizes"], answer: 1 },
  { question: "What is the amortized cost of a push onto a dynamic array that doubles when full?", options: ["O(n)", "O(log n)", "O(1)", "O(sqrt n)"], answer: 2 },
  { question: "Which recurrence describes merge sort's running time?", options: ["T(n) = 2T(n/2) + O(n)", "T(n) = T(n-1) + O(n)", "T(n) = T(n/2) + O(1)", "T(n) = 2T(n-1) + O(1)"], answer: 0 },
  { question: "By the Master Theorem, T(n) = 2T(n/2) + O(n) solves to...", options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], answer: 1 },
  { question: "Dijkstra's algorithm with a binary heap runs in...", options: ["O(V^2)", "O(E log V)", "O(V E)", "O(E + V log V)"], answer: 1 },
  { question: "Why does Dijkstra's algorithm fail on graphs with negative edge weights?", options: ["It cannot traverse negative cycles", "Its greedy 'settled' assumption breaks — a shorter path may appear after settling", "It only works on DAGs", "The heap cannot store negative keys"], answer: 1 },
  { question: "Which algorithm finds shortest paths even with negative edge weights (no negative cycles)?", options: ["Dijkstra", "Bellman-Ford", "Prim", "Kruskal"], answer: 1 },
  { question: "Bellman-Ford's running time is...", options: ["O(V log V)", "O(E)", "O(V E)", "O(E^2)"], answer: 2 },
  { question: "The 0/1 knapsack problem solved by dynamic programming takes...", options: ["O(nW) time, pseudo-polynomial", "O(n log W)", "O(2^n) always", "O(W^2)"], answer: 0 },
  { question: "Why is 0/1 knapsack's O(nW) DP called 'pseudo-polynomial'?", options: ["W grows polynomially with input bits", "W is exponential in the input's bit-length", "It only works on integers", "It ignores the weights"], answer: 1 },
  { question: "Longest common subsequence of two strings of length n and m takes...", options: ["O(n + m)", "O(nm)", "O(n log m)", "O((n+m)^2)"], answer: 1 },
  { question: "KMP string matching achieves linear time by...", options: ["Hashing the pattern", "Precomputing a failure table of longest proper prefix-suffixes", "Sorting the alphabet", "Randomizing the text"], answer: 1 },
  { question: "A hash table with chaining has load factor α. Expected lookup cost is...", options: ["O(1 + α)", "O(α^2)", "O(log α)", "O(1) regardless of α"], answer: 0 },
  { question: "Open addressing with linear probing suffers primarily from...", options: ["Primary clustering", "High memory use", "Slow inserts only", "Cache misses"], answer: 0 },
  { question: "A B-tree of minimum degree t stores between which key counts per node (non-root)?", options: ["t-1 and 2t-1", "t and 2t", "1 and t", "2t and 4t"], answer: 0 },
  { question: "Why are B-trees preferred over binary search trees for databases?", options: ["Lower asymptotic complexity", "Fewer disk I/Os due to high branching factor matching block size", "Simpler implementation", "They auto-balance better than AVL"], answer: 1 },
  { question: "An AVL tree's height is bounded by...", options: ["log2(n)", "1.44 log2(n)", "2 log2(n)", "sqrt(n)"], answer: 1 },
  { question: "Red-black trees guarantee height at most...", options: ["log2(n)", "2 log2(n+1)", "1.44 log2(n)", "n/2"], answer: 1 },
  { question: "Topological sorting of a DAG can be done in...", options: ["O(V + E)", "O(V log V)", "O(V E)", "O(E log V)"], answer: 0 },
  { question: "Kruskal's algorithm relies on which data structure for cycle detection?", options: ["Union-Find (disjoint set) with path compression", "Adjacency matrix", "Binary heap", "Trie"], answer: 0 },
  { question: "The union-find operation with path compression and union by rank is nearly...", options: ["O(1) worst case", "O(log n)", "O(α(n)) — inverse Ackermann", "O(n)"], answer: 2 },
  { question: "Which problem is NP-complete?", options: ["Shortest path with non-negative weights", "Boolean satisfiability (SAT)", "Sorting", "Minimum spanning tree"], answer: 1 },
  { question: "If P = NP, which statement follows?", options: ["All NP-complete problems have polynomial-time algorithms", "NP becomes empty", "NP-hard problems become undecidable", "Sorting becomes faster"], answer: 0 },
  { question: "A problem is in NP if...", options: ["It is solvable in polynomial time", "A given certificate can be verified in polynomial time", "It is at least as hard as every NP problem", "It requires exponential time"], answer: 1 },
  { question: "Which technique does binary exponentiation use to compute x^n in O(log n)?", options: ["Squaring and multiplying based on n's binary bits", "Recursion on n-1", "Taylor series", "Matrix inversion"], answer: 0 },
  { question: "The Floyd-Warshall all-pairs shortest path algorithm runs in...", options: ["O(V^3)", "O(V^2 E)", "O(V E log V)", "O(V^2)"], answer: 0 },
  { question: "Floyd-Warshall's core idea is...", options: ["Relaxing paths through each intermediate vertex k one by one", "Greedy edge selection", "Binary search on path length", "Random walks"], answer: 0 },
  { question: "A stable counting sort runs in...", options: ["O(n log n)", "O(n + k) where k is the value range", "O(nk)", "O(k^2)"], answer: 1 },
  { question: "Comparison-based sorting has an Ω(n log n) lower bound because...", options: ["Memory bandwidth is limited", "A comparison tree over n! permutations needs depth Ω(log n!)", "Recursion overhead is unavoidable", "Cache misses dominate"], answer: 1 },

  // ---------- Data structures ----------
  { question: "In a min-heap stored as an array, the children of index i are...", options: ["2i and 2i+1", "i+1 and i+2", "2i+1 and 2i+2", "i/2 and i/2+1"], answer: 2 },
  { question: "Building a binary heap from an unsorted array of n elements takes...", options: ["O(n log n)", "O(n)", "O(log n)", "O(n^2)"], answer: 1 },
  { question: "Why is heapify (bottom-up construction) O(n) rather than O(n log n)?", options: ["Most nodes are near the leaves and sift down only a short distance", "It uses memoization", "It skips half the array", "Heaps are always balanced"], answer: 0 },
  { question: "A treap maintains balance by...", options: ["Node colors", "Random priorities forming a heap on top of BST order", "Rotating on every insert", "Rebuilding periodically"], answer: 1 },
  { question: "A Fenwick tree (BIT) supports prefix-sum queries and point updates in...", options: ["O(n) each", "O(log n) each", "O(1) query, O(n) update", "O(sqrt n) each"], answer: 1 },
  { question: "A segment tree with lazy propagation supports range updates in...", options: ["O(1)", "O(log n)", "O(log^2 n)", "O(n)"], answer: 1 },
  { question: "A trie with n keys over a fixed alphabet has worst-case lookup time...", options: ["O(length of key)", "O(log n)", "O(n)", "O(1)"], answer: 0 },
  { question: "Which structure gives O(1) amortized append AND O(1) indexed access?", options: ["Linked list", "Dynamic array (vector)", "Skip list", "Hash map"], answer: 1 },
  { question: "An LRU cache is typically built from...", options: ["Hash map + doubly linked list", "Binary heap", "Balanced BST only", "Stack + queue"], answer: 0 },
  { question: "Bloom filters can produce...", options: ["False negatives", "False positives", "Both", "Neither"], answer: 1 },
  { question: "After inserting into a Bloom filter, an element is guaranteed...", options: ["Absent if a probe returns 'not present'", "Present if a probe returns 'present'", "Never deleted", "Uniquely hashed"], answer: 0 },
  { question: "A skip list achieves expected O(log n) search by...", options: ["Hashing levels", "Randomized multi-level linked lists", "Balancing rotations", "Sorting at each level"], answer: 1 },
  { question: "Deque operations (push/pop both ends) with a standard Python list are...", options: ["O(1) at both ends", "O(1) at back, O(n) at front", "O(n) at both ends", "O(log n) at back"], answer: 1 },
  { question: "A monotonic stack is the key structure behind...", options: ["Next-greater-element problems in O(n)", "Binary search variants", "Graph coloring", "String hashing"], answer: 0 },
  { question: "Union-Find without path compression or union by rank degrades to...", options: ["O(1) per op", "O(log n) per op", "O(n) per op worst case", "O(n log n) per op"], answer: 2 },

  // ---------- Computer architecture ----------
  { question: "Cache memory exploits which two principles of program behavior?", options: ["Temporal and spatial locality", "Pipelining and superscalarity", "Virtual memory and paging", "Branch prediction"], answer: 0 },
  { question: "A direct-mapped cache with two addresses mapping to the same line causes...", options: ["Conflict misses", "Capacity misses", "Compulsory misses", "TLB misses"], answer: 0 },
  { question: "What does a TLB cache?", options: ["Virtual-to-physical page translations", "Disk blocks", "Instruction opcodes", "Floating point results"], answer: 0 },
  { question: "A pipeline hazard caused by one instruction needing a result from an in-flight instruction is...", options: ["Structural hazard", "Data hazard (RAW)", "Control hazard", "Memory hazard"], answer: 1 },
  { question: "Branch prediction failures primarily cost the pipeline...", options: ["Cache misses", "Flushed instructions from the wrong path", "Extra registers", "TLB pressure"], answer: 1 },
  { question: "Out-of-order execution preserves the illusion of sequential execution via...", options: ["Register renaming and in-order retirement", "Slower clocks", "Larger caches", "Compiler reordering only"], answer: 0 },
  { question: "MESI is a protocol for...", options: ["CPU cache coherence across cores", "Memory paging", "Disk scheduling", "Network routing"], answer: 0 },
  { question: "A 'false sharing' performance bug occurs when...", options: ["Two cores modify different variables that share a cache line", "Two threads share a mutex", "A page is shared between processes", "Two caches hold identical data"], answer: 0 },
  { question: "Little-endian byte order means...", options: ["Least significant byte stored at the lowest address", "Most significant byte first", "Bytes are sorted", "Bits are reversed"], answer: 0 },
  { question: "In two's complement with 8 bits, 11111111 represents...", options: ["255", "-1", "-255", "127"], answer: 1 },
  { question: "IEEE 754 single precision allocates bits as...", options: ["1 sign, 8 exponent, 23 mantissa", "1 sign, 11 exponent, 20 mantissa", "1 sign, 15 exponent, 16 mantissa", "8 sign, 8 exponent, 15 mantissa"], answer: 0 },
  { question: "Why is 0.1 not exactly representable in binary floating point?", options: ["1/10 has a non-terminating binary expansion", "Floats use base 10 internally", "The mantissa is signed", "Rounding is disabled"], answer: 0 },
  { question: "Von Neumann architecture's defining trait is...", options: ["Shared memory for instructions and data", "Separate program and data stores", "No ALU", "Analog computation"], answer: 0 },
  { question: "DMA (Direct Memory Access) exists to...", options: ["Offload data transfers from the CPU", "Encrypt memory", "Increase clock speed", "Replace RAM"], answer: 0 },

  // ---------- Operating systems & concurrency ----------
  { question: "A mutex and a binary semaphore differ in that...", options: ["A mutex has ownership; any task can release a semaphore", "They are identical", "Semaphores are faster", "Mutexes cannot block"], answer: 0 },
  { question: "The four Coffman conditions for deadlock include mutual exclusion, hold-and-wait, no preemption, and...", options: ["Circular wait", "Priority inversion", "Starvation", "Race condition"], answer: 0 },
  { question: "A reader-writer lock favors concurrency by allowing...", options: ["Multiple readers simultaneously when no writer holds the lock", "Writers to read", "Readers to write", "Only one reader"], answer: 0 },
  { question: "Thrashing in virtual memory happens when...", options: ["Page faults dominate execution time as the working set exceeds physical memory", "The CPU overheats", "Threads exceed cores", "The disk is full"], answer: 0 },
  { question: "Belady's anomaly states that...", options: ["More frames can increase page faults under FIFO replacement", "LRU never faults", "Clock is optimal", "TLBs shrink"], answer: 0 },
  { question: "Which page replacement is provably optimal but unimplementable online?", options: ["FIFO", "LRU", "Belady's OPT (replace the page used farthest in future)", "Clock"], answer: 2 },
  { question: "A race condition differs from a data race in that...", options: ["A data race is undefined behavior on unsynchronized access; a race condition is a semantic ordering bug", "They are the same", "Race conditions only occur in kernels", "Data races are harmless in Java"], answer: 0 },
  { question: "Compare-and-swap (CAS) is the foundation of...", options: ["Lock-free data structures", "Virtual memory", "Paging", "Scheduling"], answer: 0 },
  { question: "The ABA problem affects lock-free algorithms because...", options: ["A value changed and changed back, and CAS cannot detect it", "Atomic ops are slow", "Pointers are 64-bit", "CAS retries forever"], answer: 0 },
  { question: "A memory barrier (fence) instruction exists to...", options: ["Enforce ordering of memory operations across cores", "Allocate memory", "Zero pages", "Flush the TLB"], answer: 0 },
  { question: "Priority inversion is famously mitigated by...", options: ["Priority inheritance", "Longer time slices", "Disabling interrupts", "More mutexes"], answer: 0 },
  { question: "Context switch cost is dominated by...", options: ["Cache/TLB pollution for the incoming process", "Register saves alone", "Disk I/O", "Network flushes"], answer: 0 },
  { question: "Copy-on-write fork is efficient because...", options: ["Parent and child share pages until a write triggers a copy", "Memory is compressed", "The child runs first", "Pages are pre-zeroed"], answer: 0 },
  { question: "Inode metadata does NOT include...", options: ["File name", "File size", "Permissions", "Block pointers"], answer: 0 },

  // ---------- Networking ----------
  { question: "The TCP three-way handshake sequence is...", options: ["SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "ACK, SYN, SYN-ACK", "SYN, ACK, ACK"], answer: 0 },
  { question: "TCP slow start grows the congestion window...", options: ["Exponentially until a threshold, then linearly", "Linearly always", "By fixed steps", "Only on retransmit"], answer: 0 },
  { question: "TCP distinguishes congestion loss from corruption loss how?", options: ["It assumes loss is congestion — packet corruption is rare on wired networks", "Checksums classify the loss", "Routers flag it", "It cannot distinguish and treats all loss as corruption"], answer: 0 },
  { question: "NAT breaks the end-to-end principle primarily for...", options: ["Inbound connections initiated from outside", "Outbound HTTP", "DNS queries", "UDP only"], answer: 0 },
  { question: "An ARP request is...", options: ["Broadcast asking 'who has this IP?' to learn a MAC", "A unicast DNS lookup", "A routing update", "A TLS handshake step"], answer: 0 },
  { question: "BGP's key security weakness is...", options: ["Route origin announcements are trusted without validation, enabling hijacks", "Weak encryption", "Small MTU", "Slow convergence only"], answer: 0 },
  { question: "DNS uses UDP port 53 mainly because...", options: ["Queries are single small request/response pairs where TCP handshake overhead is wasteful", "TCP is blocked", "DNS predates TCP", "UDP encrypts better"], answer: 0 },
  { question: "A TLS handshake authenticates the server primarily via...", options: ["The server's X.509 certificate chain validated against trusted roots", "Pre-shared keys only", "IP filtering", "MAC addresses"], answer: 0 },
  { question: "HTTP/2's headline improvements over HTTP/1.1 are...", options: ["Binary framing, multiplexing streams over one connection, header compression", "Encryption", "Larger cookies", "UDP transport"], answer: 0 },
  { question: "QUIC (HTTP/3) runs over...", options: ["UDP with built-in TLS 1.3", "TCP with TLS", "ICMP", "Raw Ethernet"], answer: 0 },
  { question: "The difference between a switch and a router is...", options: ["Switch forwards frames by MAC in L2; router forwards packets by IP in L3", "Routers are wireless", "Switches do NAT", "Routers only work in LANs"], answer: 0 },
  { question: "Exponential backoff in CSMA/CD exists to...", options: ["Reduce repeated collisions by spreading retries in time", "Increase bandwidth", "Encrypt frames", "Prioritize packets"], answer: 0 },

  // ---------- Databases ----------
  { question: "Database isolation level that prevents dirty reads but allows non-repeatable reads is...", options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], answer: 1 },
  { question: "Serializable isolation can be implemented with...", options: ["Two-phase locking or serializable snapshot isolation", "Foreign keys", "Indexes", "Vacuuming"], answer: 0 },
  { question: "A phantom read is...", options: ["New rows appearing in a re-executed range query within one transaction", "Reading uncommitted data", "Reading the same row twice with different values", "A lost update"], answer: 0 },
  { question: "An index B+tree differs from a B-tree in that...", options: ["All values live in leaves linked for range scans; internal nodes hold only keys", "It is unbalanced", "It stores rows randomly", "It has no root"], answer: 0 },
  { question: "Write-ahead logging (WAL) guarantees durability by...", options: ["Persisting log records before applying changes to data pages", "Writing only on commit", "Doubling writes", "Skipping the cache"], answer: 0 },
  { question: "ACID's 'Isolation' is violated by...", options: ["Concurrent transactions observing each other's intermediate states", "A crash after commit", "Duplicate primary keys", "A missing index"], answer: 0 },
  { question: "CAP theorem says a distributed store in a network partition must sacrifice...", options: ["Either consistency or availability", "Durability", "Latency only", "Nothing"], answer: 0 },
  { question: "Eventual consistency means...", options: ["Replicas converge to the same value if no new updates arrive", "Reads always return the latest write", "Writes are synchronous everywhere", "No conflicts ever occur"], answer: 0 },
  { question: "A covering index speeds a query when...", options: ["All needed columns are in the index, avoiding table lookups", "It covers every table", "It is clustered", "It includes the primary key"], answer: 0 },
  { question: "Why can a query with a function on an indexed column (e.g. WHERE UPPER(name) = ...) fail to use the index?", options: ["The index stores raw values; the predicate no longer matches the indexed form", "Functions are slow", "The planner is lazy", "Indexes are read-only"], answer: 0 },
  { question: "Vectorized (batch) query execution improves performance mainly by...", options: ["Improving CPU cache use and enabling SIMD over column batches", "Adding indexes", "Reducing joins", "Compressing rows"], answer: 0 },
  { question: "A write skew anomaly is possible even under...", options: ["Snapshot isolation (hence serializable snapshot isolation exists)", "Full serializability", "Read Uncommitted only", "No isolation level"], answer: 0 },

  // ---------- Programming languages & runtime ----------
  { question: "A closure captures...", options: ["Variables from its defining lexical scope by reference or value per language rules", "Only globals", "The call stack", "Its return type"], answer: 0 },
  { question: "Garbage collection's mark-and-sweep cost is proportional to...", options: ["Live objects (not total allocated)", "All allocations ever made", "Heap size only", "Thread count"], answer: 0 },
  { question: "A memory leak in a GC language typically happens when...", options: ["Live references accidentally retain unreachable-intent objects", "The GC is buggy", "Stack frames grow", "Pointers are manual"], answer: 0 },
  { question: "JavaScript's event loop processes microtasks (promise callbacks)...", options: ["After the current task completes, before the next macrotask", "Only on requestAnimationFrame", "In a separate thread", "At page unload"], answer: 0 },
  { question: "Python's GIL limits...", options: ["Only one thread executes Python bytecode at a time", "Process count", "Memory size", "Recursion depth"], answer: 0 },
  { question: "Type erasure in Java generics means...", options: ["Generic type parameters are not retained at runtime", "Types are checked at runtime", "Casting is banned", "Primitives are boxed"], answer: 0 },
  { question: "Tail-call optimization converts recursion into...", options: ["Iteration reusing the stack frame", "Heap allocation", "Thread spawn", "Memoization"], answer: 0 },
  { question: "Currying transforms...", options: ["f(a, b, c) into f(a)(b)(c)", "Loops into recursion", "Objects into arrays", "Sync into async"], answer: 0 },
  { question: "Idempotent HTTP methods (PUT/DELETE) guarantee...", options: ["Repeated identical requests have the same effect as one", "They always succeed", "They are cached", "They are encrypted"], answer: 0 },
  { question: "Big-O of amortized deque push-front in a proper deque implementation is...", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], answer: 0 },

  // ---------- Security ----------
  { question: "SQL injection is prevented most reliably by...", options: ["Parameterized queries / prepared statements", "Escaping quotes manually", "Client-side validation", "Hiding error messages"], answer: 0 },
  { question: "XSS is prevented by...", options: ["Context-aware output encoding and CSP", "HTTPS", "Strong passwords", "Rate limiting"], answer: 0 },
  { question: "CSRF tokens work because...", options: ["The attacker's site cannot read the victim's token due to same-origin policy", "Tokens encrypt traffic", "Cookies are disabled", "Servers log requests"], answer: 0 },
  { question: "Storing passwords should use...", options: ["A slow, salted hash like bcrypt/argon2", "SHA-256 once", "AES encryption", "Base64"], answer: 0 },
  { question: "Why bcrypt over SHA-256 for passwords?", options: ["Key stretching (cost factor) makes brute force expensive per guess", "It is faster", "It produces longer output", "It is reversible"], answer: 0 },
  { question: "Public-key cryptography's security rests on...", options: ["Computational hardness of problems like factoring or discrete log", "Key secrecy of the public key", "Symmetric keys", "Obfuscation"], answer: 0 },
  { question: "A TLS certificate chain validates up to...", options: ["A root CA already trusted by the client", "The server's IP", "A DNS record", "The browser vendor"], answer: 0 },
  { question: "Spectre/Meltdown exploit...", options: ["Speculative execution leaving microarchitectural traces across trust boundaries", "Buffer overflows", "SQL injection", "Weak passwords"], answer: 0 },

  // ---------- Theory & misc ----------
  { question: "A deterministic finite automaton (DFA) and a nondeterministic one (NFA) are equal in...", options: ["Recognizing exactly the regular languages", "State count", "Speed", "Expressiveness beyond regular languages"], answer: 0 },
  { question: "The pumping lemma is used to...", options: ["Prove languages are NOT regular", "Generate strings", "Minimize automata", "Parse grammars"], answer: 0 },
  { question: "A Turing machine's tape is...", options: ["Unbounded memory with random access via head movement", "Fixed size", "Read-only", "Circular only"], answer: 0 },
  { question: "The halting problem is...", options: ["Undecidable — no algorithm decides it for all programs", "NP-complete", "Solvable in exponential time", "Only hard in practice"], answer: 0 },
  { question: "Rice's theorem states...", options: ["Any non-trivial semantic property of programs is undecidable", "All programs halt", "Syntax is undecidable", "Regular languages are decidable"], answer: 0 },
  { question: "A context-free grammar can capture...", options: ["Nested structures like balanced parentheses", "Only fixed patterns", "All decidable languages", "Only regular expressions"], answer: 0 },
  { question: "Regular expressions (theoretical) cannot match...", options: ["Arbitrarily nested balanced parentheses", "Any fixed string", "Alternation", "Repetition"], answer: 0 },
  { question: "Information entropy of a fair coin flip is...", options: ["1 bit", "0 bits", "2 bits", "0.5 bits"], answer: 0 },
  { question: "The pigeonhole principle proves that any lossless compression algorithm...", options: ["Cannot compress every possible input", "Is always lossy", "Needs hashing", "Fails on text"], answer: 0 },
  { question: "Floating point addition is NOT associative because...", options: ["Rounding after each operation depends on order", "CPUs are imprecise", "Bases differ", "NaN propagation"], answer: 0 },
  { question: "Amdahl's law bounds speedup from parallelism by...", options: ["The serial fraction of the program", "Core count", "Clock speed", "Memory bandwidth"], answer: 0 },
  { question: "In big-endian vs little-endian, network byte order is...", options: ["Big-endian", "Little-endian", "Host-dependent", "Randomized"], answer: 0 },
  { question: "UTF-8 encodes code points using...", options: ["1 to 4 bytes with leading-bit markers", "Always 2 bytes", "Always 4 bytes", "7 bits fixed"], answer: 0 },
  { question: "The two's complement trick -x = ~x + 1 works because...", options: ["Complementing flips the sum to 2^n - 1 - x; adding 1 completes the modulus", "Hardware adds a sign bit", "It only works for positives", "CPUs special-case it"], answer: 0 },
];

// Medium-to-hard questions used by the current game round. These test applied
// understanding without requiring specialist research-level knowledge.
export const MEDIUM_QUESTION_POOL: QuizQuestion[] = [
  { question: "Why does Dijkstra's algorithm fail when a graph has negative edge weights?", options: ["Its settled-node assumption can become invalid", "It cannot store negative numbers", "It only works on trees", "It requires a directed graph"], answer: 0 },
  { question: "What is the amortized cost of appending to a dynamic array that doubles when full?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 2 },
  { question: "Which algorithm finds shortest paths with negative edges but no negative cycles?", options: ["Dijkstra", "Bellman-Ford", "Prim", "Kruskal"], answer: 1 },
  { question: "Why is a hash table lookup not guaranteed to be O(1)?", options: ["Collisions can force a search through multiple entries", "Hashing always sorts the keys", "Tables cannot store strings", "Lookup requires a graph traversal"], answer: 0 },
  { question: "What is the main advantage of a B-tree in a database index?", options: ["It minimizes disk I/O through high branching", "It stores every value in a hash bucket", "It never needs balancing", "It only supports exact matches"], answer: 0 },
  { question: "Which isolation level prevents dirty reads but can still allow non-repeatable reads?", options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], answer: 1 },
  { question: "What does a database write-ahead log ensure?", options: ["Log records reach durable storage before changed data pages", "Every query uses an index", "Transactions never block", "Reads always see uncommitted data"], answer: 0 },
  { question: "What is a phantom read?", options: ["New rows appear when a transaction repeats a range query", "A row is read before it is committed", "The same row changes between reads", "A transaction loses its connection"], answer: 0 },
  { question: "Why can a function applied to an indexed column prevent normal index use?", options: ["The predicate no longer matches the stored index ordering", "Functions cannot run in SQL", "Indexes only support numeric columns", "The database deletes the index"], answer: 0 },
  { question: "What is the TCP three-way handshake?", options: ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "SYN, ACK, ACK", "FIN, FIN-ACK, ACK"], answer: 0 },
  { question: "Why does TCP slow start increase its congestion window exponentially at first?", options: ["To probe available capacity quickly before switching to cautious growth", "To avoid using acknowledgements", "To guarantee zero packet loss", "To replace flow control"], answer: 0 },
  { question: "What does a TLS certificate chain ultimately validate?", options: ["A server identity up to a trusted root CA", "The server's local MAC address", "The client's password", "The router's private key"], answer: 0 },
  { question: "What is the key difference between a switch and a router?", options: ["A switch forwards by MAC address; a router forwards by IP address", "A switch encrypts traffic; a router compresses it", "A router only works over Wi-Fi", "A switch assigns domain names"], answer: 0 },
  { question: "What does the ABA problem mean in a lock-free algorithm?", options: ["A value changes and changes back before a comparison notices", "Two threads always acquire the same lock", "An atomic operation cannot be retried", "A pointer is larger than a word"], answer: 0 },
  { question: "What is the purpose of a memory barrier?", options: ["To enforce ordering of memory operations across threads or cores", "To allocate stack frames", "To encrypt cache lines", "To replace a mutex"], answer: 0 },
  { question: "Why is 0.1 not represented exactly by typical binary floating point?", options: ["One tenth has a non-terminating binary expansion", "Floating point uses integers only", "The sign bit is missing", "The exponent is always rounded to zero"], answer: 0 },
  { question: "Which technique most reliably prevents SQL injection?", options: ["Parameterized queries", "Client-side validation", "Escaping a few quote characters", "Hiding database errors"], answer: 0 },
  { question: "Why is bcrypt or Argon2 preferred over a single SHA-256 hash for passwords?", options: ["It makes each brute-force guess deliberately expensive", "It encrypts passwords reversibly", "It avoids the need for a salt", "It stores passwords in plain text"], answer: 0 },
  { question: "What does JavaScript's event loop do with promise callbacks?", options: ["Runs them as microtasks after the current task and before the next task", "Runs them on a guaranteed separate CPU thread", "Runs them only after page unload", "Runs them before the current function returns"], answer: 0 },
  { question: "What is the usual benefit of an LRU cache?", options: ["It evicts items that have not been used recently", "It guarantees unlimited storage", "It sorts all keys alphabetically", "It prevents every cache miss"], answer: 0 },
];

export const POOL_SIZE = MEDIUM_QUESTION_POOL.length;
