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
  { question: "Which algorithm repeatedly chooses the smallest element and puts it in the correct position?", options: ["Selection sort", "Binary search", "Breadth-first search", "Merge sort"], answer: 0 },
  { question: "What is the worst-case time complexity of bubble sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 2 },
  { question: "Binary search works correctly when the array is...", options: ["Sorted", "Random", "Empty only", "Reversed only"], answer: 0 },
  { question: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
  { question: "Which sorting algorithm divides the array into smaller parts and then merges them?", options: ["Merge sort", "Selection sort", "Linear search", "Bubble sort"], answer: 0 },
  { question: "What is the usual time complexity of merge sort?", options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"], answer: 2 },
  { question: "If an algorithm checks every item once, what is its time complexity?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2 },
  { question: "If an algorithm has two nested loops that each run n times, its simple time complexity is...", options: ["O(n)", "O(log n)", "O(n²)", "O(2n)"], answer: 2 },
  { question: "Which search checks elements one by one from the beginning?", options: ["Linear search", "Binary search", "Depth-first search", "Hashing"], answer: 0 },
  { question: "What is the main idea of divide and conquer?", options: ["Break a problem into smaller problems", "Always use a loop", "Store everything in a database", "Avoid recursion"], answer: 0 },
  { question: "Which algorithm is commonly used to find the shortest path in a graph with non-negative edge weights?", options: ["Dijkstra's algorithm", "Bubble sort", "Kruskal's algorithm", "Binary search"], answer: 0 },
  { question: "What happens if Dijkstra's algorithm is given a negative edge weight?", options: ["Its usual shortest-path guarantee can fail", "It automatically becomes faster", "It sorts the graph", "It cannot store the graph"], answer: 0 },
  { question: "Which algorithm can handle negative edge weights when there are no negative cycles?", options: ["Bellman-Ford", "Binary search", "Prim", "Selection sort"], answer: 0 },
  { question: "Which problem asks for the best value while staying within a weight limit?", options: ["0/1 knapsack", "Binary search", "Topological sorting", "String matching"], answer: 0 },
  { question: "What does dynamic programming usually do?", options: ["Stores results of smaller problems for reuse", "Always uses more memory than recursion", "Sorts an array first", "Uses only graphs"], answer: 0 },
  { question: "LCS stands for...", options: ["Longest Common Subsequence", "Largest Connected Search", "Least Common Sort", "Longest Circular Stack"], answer: 0 },
  { question: "What does a graph vertex usually represent?", options: ["An item or point", "A sorting operation", "A database table only", "A CPU instruction only"], answer: 0 },
  { question: "What does a graph edge usually represent?", options: ["A connection between two vertices", "A variable", "A loop", "A file"], answer: 0 },
  { question: "A graph with no cycles is called...", options: ["Acyclic", "Circular", "Complete", "Weighted"], answer: 0 },
  { question: "What is a topological ordering used for?", options: ["Putting tasks with dependencies in a valid order", "Sorting numbers only", "Finding duplicate strings", "Encrypting files"], answer: 0 },
  { question: "Which algorithm is used to find a minimum spanning tree by choosing the cheapest safe edges?", options: ["Kruskal's algorithm", "Dijkstra's algorithm", "KMP", "Binary search"], answer: 0 },
  { question: "What is the purpose of a hash function?", options: ["Convert a key into a value used to locate data", "Sort all values", "Encrypt a password automatically", "Create a graph"], answer: 0 },
  { question: "What is a collision in a hash table?", options: ["Two keys map to the same location", "A key is deleted", "The table becomes sorted", "A search reaches the end"], answer: 0 },
  { question: "What is the main idea of binary exponentiation?", options: ["Use repeated squaring to reduce the number of multiplications", "Multiply one by one only", "Sort the exponent", "Use a graph"], answer: 0 },
  { question: "What does Big-O mainly describe?", options: ["How running time or space grows as input grows", "The exact CPU speed", "The number of programmers", "The file size"], answer: 0 },
  { question: "Which of these usually grows faster as n becomes large?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], answer: 2 },
  { question: "What is the purpose of recursion's base case?", options: ["Stop the recursive calls", "Make the program infinite", "Sort the input", "Create a database"], answer: 0 },
  { question: "Why can quicksort become slow in a bad case?", options: ["Poor pivot choices can create very uneven partitions", "It cannot compare numbers", "It always uses a linked list", "It cannot work on arrays"], answer: 0 },
  { question: "Which algorithm is especially useful for finding all-pairs shortest paths?", options: ["Floyd-Warshall", "Bubble sort", "KMP", "Kruskal only"], answer: 0 },

// ---------- Data structures ----------
  { question: "Which data structure follows Last In, First Out?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 0 },
  { question: "Which data structure follows First In, First Out?", options: ["Queue", "Stack", "Heap", "Tree"], answer: 0 },
  { question: "Which structure is useful for storing items with key-value pairs?", options: ["Hash map", "Stack", "Queue", "Graph"], answer: 0 },
  { question: "Which data structure keeps elements in a sequence and allows access by index?", options: ["Array", "Tree only", "Graph only", "Stack only"], answer: 0 },
  { question: "What is the main advantage of a linked list over a normal array?", options: ["Easy insertion/deletion when the position is known", "Constant-time access by any index", "It always uses less memory", "It is automatically sorted"], answer: 0 },
  { question: "In a binary tree, a node can have at most...", options: ["1 child", "2 children", "3 children", "Unlimited children"], answer: 1 },
  { question: "In a binary search tree, smaller values are normally placed...", options: ["To the left", "To the right", "At the root only", "In a queue"], answer: 0 },
  { question: "What is a leaf node in a tree?", options: ["A node with no children", "The root node", "A node with two children", "A node with no parent"], answer: 0 },
  { question: "Which structure is commonly used for a priority queue?", options: ["Heap", "Stack", "Linked list only", "Trie only"], answer: 0 },
  { question: "In a min-heap, the smallest element is normally at the...", options: ["Root", "Last leaf", "Middle only", "Right child"], answer: 0 },
  { question: "What is the main use of a trie?", options: ["Efficient prefix/string lookup", "Sorting numbers by size", "Storing images", "Running SQL queries"], answer: 0 },
  { question: "What does a queue's dequeue operation normally do?", options: ["Removes the front item", "Removes the last item", "Adds an item", "Sorts the queue"], answer: 0 },
  { question: "What does a stack's pop operation normally do?", options: ["Removes the top item", "Adds an item", "Removes the bottom item only", "Sorts the stack"], answer: 0 },
  { question: "Why is a hash map usually fast for lookup?", options: ["It uses a hash to quickly locate a bucket", "It checks every key in order", "It always uses binary search", "It stores only numbers"], answer: 0 },
  { question: "What is an LRU cache designed to remove?", options: ["Items that have not been used recently", "The largest item always", "All duplicate items", "The newest item always"], answer: 0 },

// ---------- Computer architecture ----------
  { question: "Which part of the CPU performs arithmetic and logical operations?", options: ["ALU", "RAM", "Hard disk", "Keyboard"], answer: 0 },
  { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Program Utility", "Central Program User", "Control Processing Utility"], answer: 0 },
  { question: "What is RAM mainly used for?", options: ["Temporarily storing data used by running programs", "Permanent file storage only", "Connecting to Wi-Fi", "Printing documents"], answer: 0 },
  { question: "What is cache memory mainly used for?", options: ["Keeping frequently needed data close to the CPU", "Storing files permanently", "Connecting computers", "Replacing the CPU"], answer: 0 },
  { question: "What is spatial locality?", options: ["Nearby memory locations are likely to be used", "The same data is never used again", "Programs always run in parallel", "Data is stored on the network"], answer: 0 },
  { question: "What does a CPU pipeline allow?", options: ["Different instruction stages to overlap", "Only one instruction per program", "The CPU to avoid memory", "Programs to run without instructions"], answer: 0 },
  { question: "What is a branch in a program?", options: ["A decision that can choose between different paths", "A memory address only", "A type of RAM", "A network cable"], answer: 0 },
  { question: "What does branch prediction try to guess?", options: ["Which path a conditional branch will take", "The next user password", "The disk size", "The network address"], answer: 0 },
  { question: "What is a register?", options: ["A very small, fast storage location inside the CPU", "A hard disk", "A network device", "A database table"], answer: 0 },
  { question: "What does little-endian mean?", options: ["The least significant byte is stored at the lowest address", "The largest byte is stored first", "Bits are always reversed", "Numbers are stored as text"], answer: 0 },
  { question: "In 8-bit two's complement, 11111111 represents...", options: ["255", "-1", "0", "127"], answer: 1 },
  { question: "Why can 0.1 have a small rounding error in binary floating point?", options: ["It cannot be represented exactly in binary", "The CPU cannot add decimals", "RAM cannot store decimals", "The number is always negative"], answer: 0 },
  { question: "What is DMA used for?", options: ["Allowing devices to transfer data with less CPU involvement", "Encrypting RAM", "Increasing CPU clock speed", "Replacing the operating system"], answer: 0 },
  { question: "What is the Von Neumann architecture known for?", options: ["Instructions and data share the same memory", "It has no memory", "It uses only analog signals", "It has no CPU"], answer: 0 },
  { question: "What does a TLB help with?", options: ["Virtual-to-physical address translation", "Sorting files", "Encrypting passwords", "Scheduling web requests"], answer: 0 },

// ---------- Operating systems & concurrency ----------
  { question: "What is an operating system mainly responsible for?", options: ["Managing hardware and software resources", "Writing every application", "Replacing the CPU", "Creating websites automatically"], answer: 0 },
  { question: "What is a process?", options: ["A program that is currently running", "A file stored on disk", "A CPU register", "A network cable"], answer: 0 },
  { question: "What is a thread?", options: ["A smaller unit of execution inside a process", "A type of hard disk", "A database table", "A compiler"], answer: 0 },
  { question: "What is a mutex used for?", options: ["Protecting shared data from simultaneous access", "Sorting arrays", "Connecting to Wi-Fi", "Creating files"], answer: 0 },
  { question: "What is a race condition?", options: ["A result depends on the timing/order of concurrent operations", "A CPU running too fast", "A network being slow", "A program with no loops"], answer: 0 },
  { question: "What is deadlock?", options: ["Processes wait for each other and cannot continue", "A program finishes normally", "A file is deleted", "A CPU becomes faster"], answer: 0 },
  { question: "Which is one common way to avoid race conditions?", options: ["Synchronize access to shared data", "Use more variables", "Remove all loops", "Increase screen resolution"], answer: 0 },
  { question: "What is a context switch?", options: ["Changing the CPU from one running task to another", "Changing a file name", "Switching monitors", "Changing a network cable"], answer: 0 },
  { question: "What is virtual memory?", options: ["Using disk space as an extension of main memory", "A second CPU", "A faster keyboard", "A type of cache only"], answer: 0 },
  { question: "What is a page fault?", options: ["A needed memory page is not currently in physical memory", "A printer error", "A syntax error", "A network packet collision"], answer: 0 },
  { question: "What is thrashing?", options: ["The system spends too much time moving pages in and out of memory", "The CPU is permanently broken", "A disk is empty", "A program has no threads"], answer: 0 },
  { question: "What is a semaphore commonly used for?", options: ["Controlling access to shared resources", "Sorting numbers", "Compiling Java", "Creating IP addresses"], answer: 0 },
  { question: "What does a lock help prevent?", options: ["Multiple threads incorrectly changing shared data at the same time", "A program from compiling", "A user from logging in", "A file from being saved"], answer: 0 },
  { question: "What is copy-on-write?", options: ["Copying shared data only when a modification is needed", "Copying every file twice", "Compressing memory", "Deleting old data"], answer: 0 },
  { question: "What does an inode store in a typical Unix-like file system?", options: ["File metadata such as size and permissions", "The file name only", "The user's password", "The CPU instructions"], answer: 0 },

// ---------- Networking ----------
  { question: "What does IP stand for in networking?", options: ["Internet Protocol", "Internal Program", "Internet Process", "Input Protocol"], answer: 0 },
  { question: "What is the main job of a router?", options: ["Forward packets between networks", "Connect only keyboards", "Store web pages permanently", "Compile programs"], answer: 0 },
  { question: "What is the main job of a switch?", options: ["Forward frames within a network using MAC addresses", "Assign domain names", "Encrypt every file", "Run Java code"], answer: 0 },
  { question: "What is a MAC address used for?", options: ["Identifying a network interface on a local network", "Identifying a web page", "Storing a password", "Naming a database"], answer: 0 },
  { question: "What is the TCP three-way handshake?", options: ["SYN, SYN-ACK, ACK", "ACK, ACK, FIN", "SYN, FIN, ACK", "FIN, FIN, ACK"], answer: 0 },
  { question: "Which protocol is connection-oriented and reliable?", options: ["TCP", "UDP", "ARP", "ICMP only"], answer: 0 },
  { question: "Which protocol is generally faster and connectionless?", options: ["UDP", "TCP", "HTTP only", "DNS only"], answer: 0 },
  { question: "What is DNS mainly used for?", options: ["Converting domain names to IP addresses", "Encrypting files", "Sending emails only", "Assigning MAC addresses"], answer: 0 },
  { question: "What is an ARP request used to find?", options: ["The MAC address associated with an IP address on a local network", "A website's password", "A DNS server's code", "A TCP port"], answer: 0 },
  { question: "What does HTTPS add to normal HTTP?", options: ["Secure encrypted communication using TLS", "A faster CPU", "A database", "A new IP address"], answer: 0 },
  { question: "What does a firewall mainly do?", options: ["Controls allowed network traffic", "Sorts files", "Increases RAM", "Compiles code"], answer: 0 },
  { question: "What is NAT commonly used for?", options: ["Allowing multiple private devices to share a public IP address", "Encrypting passwords", "Sorting packets by size", "Replacing DNS"], answer: 0 },
  { question: "What does a port number help identify?", options: ["A network service or application on a host", "A computer's physical location", "A MAC address", "A file type"], answer: 0 },

// ---------- Databases ----------
  { question: "What is a database used for?", options: ["Storing and organizing data", "Running the CPU", "Replacing RAM", "Drawing images only"], answer: 0 },
  { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Question Language", "System Query Link", "Structured Queue Logic"], answer: 0 },
  { question: "Which SQL command is used to retrieve data?", options: ["SELECT", "INSERT", "DELETE", "UPDATE"], answer: 0 },
  { question: "Which SQL command adds new rows?", options: ["INSERT", "SELECT", "DROP", "UPDATE"], answer: 0 },
  { question: "Which SQL command changes existing rows?", options: ["UPDATE", "SELECT", "CREATE", "INSERT"], answer: 0 },
  { question: "Which SQL command removes rows?", options: ["DELETE", "SELECT", "INSERT", "ALTER"], answer: 0 },
  { question: "What is a primary key?", options: ["A column or set of columns that uniquely identifies a row", "A password for the database", "An index that must be text", "A table name"], answer: 0 },
  { question: "What is a foreign key used for?", options: ["Connecting a row to a related row in another table", "Encrypting a database", "Sorting all rows", "Deleting duplicate rows"], answer: 0 },
  { question: "Why are indexes used in databases?", options: ["To speed up many searches and lookups", "To store passwords", "To replace tables", "To prevent all updates"], answer: 0 },
  { question: "What does ACID describe?", options: ["Important properties of reliable database transactions", "A network protocol", "A sorting algorithm", "A programming language"], answer: 0 },
  { question: "What does atomicity mean in a transaction?", options: ["It happens completely or not at all", "It is always fast", "It never uses a lock", "It can be partly committed"], answer: 0 },
  { question: "What does consistency mean in ACID?", options: ["A transaction keeps the database within its rules", "Every query returns the same row", "The database never has indexes", "All users see the same screen"], answer: 0 },
  { question: "What is a database transaction?", options: ["A group of operations treated as one unit of work", "A database backup only", "A network packet", "A table column"], answer: 0 },

// ---------- Programming languages & runtime ----------
  { question: "What is a variable?", options: ["A named place for storing a value", "A CPU core", "A database server", "A network cable"], answer: 0 },
  { question: "What is a function?", options: ["A reusable block of code that performs a task", "A type of database", "A memory chip", "A network protocol"], answer: 0 },
  { question: "What is a loop used for?", options: ["Repeating a block of code", "Storing a password", "Creating a CPU", "Connecting to Wi-Fi"], answer: 0 },
  { question: "What is an object in object-oriented programming?", options: ["An instance containing data and behavior", "Only a function", "A database server", "A compiler"], answer: 0 },
  { question: "What is inheritance in OOP?", options: ["A class can reuse or extend features of another class", "A variable changes type automatically", "A loop repeats forever", "A database creates a table"], answer: 0 },
  { question: "What is a closure?", options: ["A function that can use values from its surrounding scope", "A closed network connection", "A database lock", "A finished program"], answer: 0 },
  { question: "What is garbage collection?", options: ["Automatically finding and reclaiming unused memory", "Deleting source code", "Compressing all files", "Removing database tables"], answer: 0 },
  { question: "What does an event loop help a program do?", options: ["Handle asynchronous callbacks and tasks", "Increase RAM size", "Compile machine code", "Create hardware"], answer: 0 },
  { question: "What does type checking help detect?", options: ["Invalid use of values according to their types", "Slow internet", "Low battery", "Disk fragmentation"], answer: 0 },

// ---------- Security ----------
  { question: "What is SQL injection?", options: ["An attack that inserts unwanted SQL through input", "A database backup", "A sorting method", "A network cable problem"], answer: 0 },
  { question: "What is the safest common way to prevent SQL injection?", options: ["Parameterized queries", "Hiding the database", "Using longer table names", "Client-side validation only"], answer: 0 },
  { question: "What is XSS?", options: ["Injecting unwanted script into web pages", "Encrypting a database", "A CPU attack only", "A type of sorting"], answer: 0 },
  { question: "Why should passwords be stored as salted password hashes?", options: ["To make stolen password databases harder to use", "So the server can read them easily", "To make passwords reversible", "To avoid authentication"], answer: 0 },
  { question: "What does HTTPS help protect?", options: ["Data sent between a client and server", "The computer from all viruses", "The database from every bug", "The CPU from overheating"], answer: 0 },
  { question: "What is authentication?", options: ["Checking who a user is", "Checking what a user is allowed to do", "Encrypting every file", "Creating a database"], answer: 0 },
  { question: "What is authorization?", options: ["Checking what an authenticated user is allowed to do", "Checking the user's identity", "Connecting to DNS", "Hashing a password"], answer: 0 },

// ---------- Theory & misc ----------
  { question: "What is a DFA?", options: ["A finite automaton with one defined next state for each input choice", "A database file", "A sorting algorithm", "A CPU instruction"], answer: 0 },
  { question: "What kind of language can a regular expression describe in theory?", options: ["A regular language", "Every possible language", "Only programming languages", "Only SQL"], answer: 0 },
  { question: "What is a finite automaton made of?", options: ["States and transitions", "Tables and rows", "Threads and locks", "Packets and ports"], answer: 0 },
  { question: "What is a context-free grammar useful for?", options: ["Describing nested structures such as matching parentheses", "Encrypting passwords", "Managing RAM", "Routing packets"], answer: 0 },
  { question: "What is a compiler?", options: ["A program that translates source code into another form such as machine code", "A database", "A network switch", "A text editor only"], answer: 0 },
  { question: "What is Unicode used for?", options: ["Representing text from many writing systems", "Compressing images", "Routing packets", "Storing passwords"], answer: 0 },
  { question: "UTF-8 is a common way to encode...", options: ["Unicode text", "CPU instructions only", "IP addresses only", "Database indexes"], answer: 0 },
  { question: "What is entropy in information theory roughly related to?", options: ["Uncertainty or information content", "CPU temperature", "Disk size", "Network speed"], answer: 0 },
  { question: "What does lossless compression mean?", options: ["The original data can be recovered exactly", "Some data is always removed", "The file becomes larger", "The file is encrypted"], answer: 0 },
  { question: "Why can floating-point addition give slightly different results in different orders?", options: ["Rounding can occur after each operation", "The CPU cannot add numbers", "RAM changes values randomly", "All floating point is exact"], answer: 0 },
  { question: "What does parallelism mean?", options: ["Doing multiple parts of work at the same time", "Running one instruction only", "Storing data on disk", "Using only one CPU core"], answer: 0 },
  { question: "What is the main purpose of a character encoding?", options: ["Map characters to numbers/bytes for storage and communication", "Sort characters alphabetically", "Encrypt passwords", "Compress programs"], answer: 0 },
  { question: "What does the halting problem ask?", options: ["Whether a program will eventually stop for a given input", "Whether a program has a syntax error", "Whether a file is compressed", "Whether a CPU is fast"], answer: 0 },
]

// Medium-to-hard questions used by the current game round. These test applied
// understanding without requiring specialist research-level knowledge.
export const MEDIUM_QUESTION_POOL: QuizQuestion[] = [
  { question: "A list has 1000 items. If you check every item once, about how does the work grow?", options: ["With the number of items", "With the square of the number of items", "It stays constant", "It grows logarithmically"], answer: 0 },
  { question: "Why is binary search faster than checking every item in a sorted list?", options: ["It removes about half the remaining search space each step", "It checks every item twice", "It sorts the list each time", "It uses more loops"], answer: 0 },
  { question: "Why can a hash table become slower when many keys collide?", options: ["More entries may need to be checked in the same bucket", "The table becomes a linked list automatically", "Hashing stops working completely", "The keys become sorted"], answer: 0 },
  { question: "A stack is used to undo actions. Why is it suitable?", options: ["The most recent action is removed first", "The oldest action is removed first", "All actions are removed together", "Actions are randomly removed"], answer: 0 },
  { question: "Why does a queue work well for a printer waiting list?", options: ["The first job added is normally handled first", "The newest job is always handled first", "Jobs are chosen randomly", "Jobs are sorted by file name"], answer: 0 },
  { question: "Why can two threads cause a wrong result when updating the same variable?", options: ["Their operations can overlap in an unsafe order", "Threads cannot use variables", "Variables cannot store numbers", "The CPU stops after two threads"], answer: 0 },
  { question: "Why is a mutex useful when several threads update shared data?", options: ["It can allow only one thread into the protected section at a time", "It makes every thread run faster", "It deletes shared data", "It removes the need for memory"], answer: 0 },
  { question: "Why does a router need an IP address to forward packets between networks?", options: ["IP addresses identify the network destination", "IP addresses store passwords", "IP addresses identify CPU registers", "IP addresses sort files"], answer: 0 },
  { question: "Why does DNS make websites easier to use?", options: ["People can use names instead of remembering IP addresses", "It makes every website offline", "It replaces TCP", "It stores passwords"], answer: 0 },
  { question: "Why is a database index helpful for a large table?", options: ["It can reduce the amount of data that must be searched", "It always makes every operation faster", "It removes the table", "It prevents inserts"], answer: 0 },
  { question: "Why is a primary key useful?", options: ["It gives each row a unique identity", "It encrypts every row", "It makes every column numeric", "It removes foreign keys"], answer: 0 },
  { question: "Why should SQL input be parameterized?", options: ["The database treats supplied values as data instead of SQL code", "It makes passwords visible", "It removes the need for a database", "It guarantees every query is fast"], answer: 0 },
  { question: "Why is a password hash normally made deliberately slow?", options: ["It makes trying many guessed passwords more expensive", "It lets users recover the original password", "It makes the hash reversible", "It removes the need for authentication"], answer: 0 },
  { question: "Why does garbage collection help programmers?", options: ["It can reclaim memory that is no longer reachable", "It prevents every memory bug", "It makes the CPU faster", "It stores files permanently"], answer: 0 },
  { question: "Why can 0.1 be slightly inaccurate in a typical binary floating-point type?", options: ["Its exact decimal value has no finite binary representation", "The CPU cannot represent zero", "The number is too large", "Floating point stores only whole numbers"], answer: 0 },
  { question: "A function uses a variable created outside the function. What concept describes this behavior?", options: ["Closure", "Inheritance", "Overloading", "Compilation"], answer: 0 },
  { question: "Why is HTTPS safer than plain HTTP on an untrusted network?", options: ["TLS helps encrypt and authenticate the connection", "HTTP cannot send text", "HTTPS uses no IP address", "HTTPS removes all malware"], answer: 0 },
  { question: "If a program repeats the same calculation many times, what is one useful optimization?", options: ["Store and reuse the previous result when appropriate", "Always add another loop", "Delete the input", "Use more print statements"], answer: 0 },
  { question: "Why is recursion sometimes replaced with iteration?", options: ["Iteration can avoid growing the call stack for repeated work", "Iteration cannot use variables", "Recursion never works", "Loops are always faster"], answer: 0 },
  { question: "Why does a cache often improve performance?", options: ["Frequently reused data can be accessed from a faster nearby location", "It increases the amount of disk space", "It removes the CPU", "It guarantees no cache misses"], answer: 0 },
]

export const POOL_SIZE = MEDIUM_QUESTION_POOL.length;