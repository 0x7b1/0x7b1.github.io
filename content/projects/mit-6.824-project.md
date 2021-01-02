---
author: jc
title: MIT's 6.824 Distributed System Course
summary: This course project implements the Raft Consensus algoritm, Map Reduce, and a Fault-tolerant key/value storage service.
date: "2020-09-02"
series: ["projects"]
showTOC: true
cover:
  image: "https://info.container-solutions.com/hubfs/Imported_Blog_Media/figure1_raft-1.png"
---

This project is based on the Lab assignments used in MIT's distributed systems course (6.284). It is divided in 3 main parts and is expected to be implemented using the Go programming language.

## Part I: Distributed MapReduce

[Go to the Lab's description](https://pdos.csail.mit.edu/6.824/labs/lab-mr.html)

The most important parts of the Mapreduce model are:
- The Figure 1 of the paper.
- The Map and Reduce functions
  - `map (k1, v1) -> list(k2, v2)`
  - `reduce (k2, list(v2)) -> list(v2)`
In the MapReduce model there are two types of nodes: master and worker.
The master is responsible for dividing the task into M tasks. As long as there is idle worker, it will execute the task map, and R results will be generated and stored on disk.
The worker who executes reduce later will get the corresponding map result from other workers through RPC according to his number (0 to R-1).
The reducer will get a number (k2, list(v2)) of key-value pairs, and then pass this to the reduce-function (user-defined), and the result will be stored and it will be done.
The next step is to merge the results of reduce.

A classic example is the word-counter.
- Having a bunch of files that need to count characters. First, step is to assign the files to each map. It will count the characters and output key-value pairs:
```text
Hello, my name is x, your name?
Hello, your name is nice
```

- The above two sentences, through map, it's assigned to two map operations:

```text
1: <hello,1> <my,1> <name,2>        <is,1> <x,1> <your,1>
2: <hello,1> <name,1> <is,1>        <your,1> <nice,1>
|------------reduce 1--------------|----------- ---reduce 2------------------|
```

- Before throwing the output key-value pairs into the corresponding reduce, we need to obtain its set:

```text
<hello,<1,1>> <my,1> <name,<2,1>> ===> reduce 1
<is,<1,1>> <x,1> <your,<1,1 >> <nice,1> ===> reduce 2
```

- Finally, reduce will count its value:

```text
reduce 1 ===> <hello,2> <my,1> <name,3>
reduce 2 ===> <is,2> <x,1> <your,2> <nice,1>
```

During the whole stage, we rely on a master and several workers to conduct orderly operations
First, we start a master and three workers; the master will tell the workers that it is now in the map phase, you execute file 1, you execute file 2
It is necessary for the worker to report to the master that he has done it. Because this will tell the master whether it should proceed to the next reduce phase. If all files are processed, the master will adjust the status to reduce:
But when we actually come to the experiment, we need to consider some issues.
1. A master, which members need to be included in the worker
2. How to represent tasks and how to distribute tasks
First conceive the whole experiment. We'd better not be mechanically process-oriented, that is, read the file list -> for loop, traverse the file list -> call (rpc) n workers remotely at the same time, and pass in the file name in the master. , Let it execute Map; master maintains a key-value pair to know whether all files have completed the Map phase; then perform Reduce.
Knowing the entire process framework, we return to the first question, what kind of member variables should be designed.
1. **Map task**, we need it to process a separate file, so there is a string type file, a task must have its own ID, and we must know which Worker we work for (workerid), and we also need to know this task Is it done? (status); the same is true for Reduce.
2. **Master Structure**, the master needs to maintain two task queues:
  - A set of pointer lists for saving tasks locally, MapTasks & ReduceTasks;
  - A set of channels MapTasksChan & ReduceTasksChan for asynchronous communication, Worker will request tasks remotely through rpc; The number of NReduce, given by initialization, 10; NMap represents the number of files, calculated when the master is initialized; Represents the number of completed tasks NCompleteXXX;
3. **Process**, after the master initializes some of its member variables, it will directly start to generate Map tasks. This process will write the Map tasks into the queue, and at the same time wait for the worker's RPC call to take away the secondary tasks.
It is worth noting that the allocation task in the above figure uses select, which will respond selectively according to the arrival of the channel, that is, return to the Map task when the Map task arrives, and return to the Reduce task when the Reduce task arrives first; MonitorMapTask() , This function will monitor whether the Map task is completed, which is very important because it will hang up a worker later in the test case.

## Part II: Raft, a replicated state machine protocol

In this lab the goal is to build a fault-tolerant key/value storage system, which is divided into three parts:
  - Implement Raft, a replicated state machine protocol
  - Build a key/value service on Raft
  - Share among multiple replicated state machines Service for higher performance

Nodes have three states, and the initial state of all nodes is Follower.
- Follower
- Candidate
- Leader

#### Basic Structures
At first, you may not know where to start. First, write a part of the framework according to the hints given in the course document.
> Add any state you need to the Raft struct in raft.go. You'll also need to define a struct to hold information about each log entry. Your code should follow Figure 2 in the paper as closely as possible.
```golang
type Log struct {
    Command interface{}
    Term    int32
}
//
// A Go object implementing a single Raft peer.
//
type Raft struct {
    mu        sync.Mutex          // Lock to protect shared access to this peer's state
    peers     []*labrpc.ClientEnd // RPC end points of all peers
    persister *Persister          // Object to hold this peer's persisted state
    me        int                 // this peer's index into peers[]

    // counts    int

    // Your data here (2A, 2B, 2C).
    // Look at the paper's Figure 2 for a description of what
    // state a Raft server must maintain.
    // Persistent state on all servers
    logs         []Log
    votedFor     int
    currentTerm  int32
    // State
    state        int32
    // Volatile state on all server
    commitIndex  int
    lastApplied  int

    VoteGrantedCount  int
    // Volatile state on leaders
    nextIndex[]  int
    matchIndex[] int

    // timer
    electionTimer *time.Timer
    voteCh     chan struct{}
}
```
> Fill in the RequestVoteArgs and RequestVoteReply structs.
```golang
type RequestVoteArgs struct {
    // Your data here (2A, 2B).
    Term         int
    CandidateId  int
    LastLogIndex int
    LastLogTerm  int
}
// field names must start with capital letters!
type RequestVoteReply struct {
    // Your data here (2A).
    Term         int
    VoteGranted  bool
}
```
> Modify Make() to create a background goroutine that will kick off leader election periodically by sending out RequestVote RPCs when it hasn't heard from another peer for a while.

The preparation of Make is very important, it is actually the initialization process of Raft. Finally, the loop of the state machine is started.
```golang
func Make(peers []*labrpc.ClientEnd, me int,
    persister *Persister, applyCh chan ApplyMsg) *Raft {
    rf := &Raft{}
    rf.peers = peers
    rf.persister = persister
    rf.me = me
    // Your initialization code here (2A, 2B, 2C).
    rf.currentTerm = 0;
    rf.votedFor = -1;
    rf.VoteGrantedCount = 0;
    rf.logs = make([]Log, 0)

    rf.commitIndex = -1
    rf.lastApplied = -1
    rf.state = FOLLOWER
    rf.nextIndex = make([]int, len(rf.peers))
    rf.matchIndex = make([]int, len(rf.peers))
    // initialize from state persisted before a crash
    rf.readPersist(persister.ReadRaftState())
    go rf.raftLoop()
    return rf
}
```
> This way a peer will learn who is the leader, if there is already a leader, or become the leader itself. Implement the RequestVote() RPC handler so that servers will vote for one another.

Implementation func `(rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply)`, as explained in the RequestVote RPC part of the paper, Recever implememtation, is transformed into the following code:
```golang
func (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {
    // Your code here (2A, 2B).
    rf.mu.Lock()
    defer rf.mu.Unlock()
    if args.Term < rf.currentTerm {
        reply.VoteGranted = false

    } else if args.Term == rf.currentTerm {
        if (rf.votedFor == -1 ||  rf.votedFor == args.CandidateId)  && args.LastLogIndex >= len(rf.logs){
            // Only when the node does not vote for the candidate or only for the current candidate, the vote is successful. Ensure that a node votes twice
            reply.VoteGranted = true
            rf.votedFor = args.CandidateId;
            fmt.Printf("Server %d voted for Server %d\n", rf.me, args.CandidateId)
            // rf.resetTimer()
        } else {
            reply.VoteGranted = false
        }
    } else {
        // currentTerm is smaller than the candidate
        rf.switchTo(FOLLOWER)
        rf.currentTerm = args.Term
        rf.votedFor = args.CandidateId
        reply.VoteGranted = true
    }
    reply.Term = rf.currentTerm
    if reply.VoteGranted == true {
        go func() { rf.voteCh <- struct{}{} }()
    }

}
```
> To implement heartbeats, define an AppendEntries RPC struct (though you may not need all the arguments yet), and have the leader send them out periodically.
```golang
type AppendEntryArgs struct {
    term         int  // leader's term
    leaderId     int  // so follower can redirect clients
    prevLogIndex int  // index of log entry immediately preceding new ones
    prevLogTerm  int  // term of prevLogIndex entry
    entries      []Log  // (empty for heartbeat; may send more than one for efficiency)
    leaderCommit int    // leader's commitIndex
}
type AppendEntryReply struct {
    term    int     // currentTerm, for leader to update itself
    success bool    // true if follwer contained entry matching prevLogTerm and prevLogIndex
}

func (rf *Raft)sendAppendEntries(server int , args *AppendEntryArgs, reply *AppendEntryReply) {
    ok := rf.peers[server].Call("Raft.AppendEntries", args, reply)
    return ok
}
```
> Make sure the election timeouts in different peers don't always fire at the same time, or else all peers will vote only for themselves and no one will become the leader.
In RequestVotefunction, we added a judgment: only if this node did not vote for any candidate or ballot to the current candidates, this is the ticket to success. Ensure that a node votes twice
```golang
if (rf.votedFor == -1 ||  rf.voteFor == args.CandidateId)  && args.LastLogIndex >= len(rf.logs){
  reply.VoteGranted = true
  rf.votedFor = args.CandidateId;
}
```
### Function implementation
1. First realize the atomic operations of state acquisition, GetTerm and state judgment. The conffollowing functions are also used when checking in (if you run the test error, you need to check whether the function is implemented).
```golang
// atomic operations
func (rf *Raft) getTerm() int32 {
    return atomic.LoadInt32(&rf.currentTerm)
}

func (rf *Raft) isState(state int32) bool {
    return atomic.LoadInt32(&rf.state) == state
}
// return currentTerm and whether this server
// believes it is the leader.
func (rf *Raft) GetState() (int, bool) {
    var term int
    var isleader bool
    // Your code here (2A).
    term = int(rf.getTerm())
    isleader = rf.isState(LEADER)
    return term, isleader
}
```
Realize the reply of request to vote, handle request and handle request to vote.
- `func (rf *Raft) broadcastVoteReq()`
- `func (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply)`
- `func (rf *Raft) sendRequestVote(server int, args *RequestVoteArgs, reply *RequestVoteReply) bool`

Realize request to add Log item, handle append request and handle request append reply. The implementation of PartA only stays at using AppendEntries to maintain the existence of the Leader, and does not actually change the Log.
- `func (rf *Raft) sendAppendEntries(server int , args *AppendEntryArgs, reply *AppendEntryReply) bool`
- `func (rf *Raft) broadcastAppendEntries()`
- `func (rf *Raft) AppendEntries(args *AppendEntryArgs, reply *AppendEntryReply)`


To achieve randomness, Golang's timer + rand is enough. The following two functions implement random time generation and Timer reset.
```golang
func randElectionDuration() time.Duration {
    r := rand.New(rand.NewSource(time.Now().UnixNano()))
    return time.Millisecond * time.Duration(r.Int63n(ELEC_TIME_MAX-ELEC_TIME_MIN) + ELEC_TIME_MIN)
}

func (rf *Raft) resetTimer() {
    newTimeout := randElectionDuration()
    rf.electionTimer.Reset(newTimeout)
}
```

The last and most important function is the switching logic between Raft's states, which is Raft's main loop.
```golang
func (rf *Raft) raftLoop() {
    rf.electionTimer = time.NewTimer(randElectionDuration())
    for {
        switch atomic.LoadInt32(&rf.state) {
            case FOLLOWER:
                select {
                case  <-rf.voteCh:
                    rf.resetTimer()

                case <- rf.electionTimer.C:
                    rf.mu.Lock()
                    rf.switchTo(CANDIDATE)
                    rf.startElection()
                    rf.mu.Unlock()
                }
            case CANDIDATE:
                rf.mu.Lock()
                select {

                case <-rf.electionTimer.C:
                    rf.resetTimer()
                    // election time out ， what we should do? do it again
                    rf.startElection()
                default:
                    // check if it has collected enough vote
                    if rf.VoteGrantedCount > len(rf.peers)/2 {
                        rf.switchTo(LEADER)
                    }
                }
                rf.mu.Unlock()
            case LEADER:
                rf.broadcastAppendEntries()
                time.Sleep(HEART_BEAT)

        }
    }
}
```

## Part III: Fault-tolerant key/value storage service

This experiment is the third experiment of the course. It completes a key-value system based on the raft protocol.

The service must support 3 operations
```text
Put ( key , value ) : change the value of key
Append ( key , arg ) : add value to the value of key
Get ( key ) : return value
```

> When packet loss is not performed and the case of realizing servers fail, it is necessary to provide the client sequential consistency of api, call Put, Append a Get3 and api, performed in the same order in all the server, and having at-most-once the A suggested plan for semantics is: first complete server.gothe Opstructure in progress , and then complete server.gothe PutAppend()sum Get()operation. In operation, it should be called first Start(), and when the log commits, reply to the client

- After the call Start(), kvraft servers will wait for the raft log to reach an agreement. By applyChobtaining consistent commands, we need to consider how to arrange the code so that it can be read continuously applyCh, and other commands can also be executed.
- We need to deal with the case: the leader is called Start(), but leadership is lost before log commit. In this case, the code should resend the request to the new leader. One way is that the server needs to detect that it is no longer the leader, and returns an unused request on the index by checking the same start. The other way is by calling GetState(), but if there is a network partition, it may not know that it is no longer the leader. In this case, both the client and server are in the network partition, so they can wait indefinitely until the network is restored
- A kvraft server should not complete the Get()operation if it cannot get the majority, because it may not get the latest data.

Need to request a number for each client
To ensure that the memory is released quickly, so the next request can be brought with the next request

Current problem: leader changes frequently:
```golang
func  (ck * Clerk)  Get(key string) string {
   args := GetArgs { Key : key }

   for  {
      for _ , c := range ck . servers {
         time . Sleep ( time . Millisecond * 1000)
         reply := GetReply { }
         ok := c . Call ("RaftKV.Get" ,  &args ,  &reply)
         if ok && !reply.WrongLeader {
            return reply.Value
         }
      }
   }

   return  ""
}
```

If there is no sleep here, it is equivalent to that the client is constantly in START. The problem is that the server is constantly processing the START command, causing the normal heartbeat to be unable to complete, and frequent changes to the leader occur. The problem is very serious. Seriously, what should I do?
Later, optimization was made. For read operations, chan is not used, which is not a problem.

```golang
index :=  -1
Term :=  -1

isLeader :=  true

if rf . state != StateLeader {
   isLeader =  false
   return index , term , isLeader
}
```

Give each client a number, and then each request grows sequentially
```golang
select {

case op := <-ch:
   commited := op == entry
   kv.logger.Debug("index:%d commited:%v", index, commited)

   return commited

   // The timeout here is actually very easy to understand, because it was the leader at the beginning, but before the log got the commit, the leadership was lost. At this time
   // If there is no timeout mechanism, it will block forever
   // Or because the leader at this time is the leader in a partition, it can only be blocked forever
   // So also need timeout

case <-time.After(AppendTimeOut):
   //kv.logger.Info("index:%d %s timeout after %v", index, entry.Type, AppendTimeOut)
   return false
}
```

## Links
- [Source code](https://github.com/0x7b1/systems-design/tree/master/project/6.824)
