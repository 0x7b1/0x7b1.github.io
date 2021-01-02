---
author: jc
title: "Paper review: ARTful Indexing for Main-Memory Databases"
summary: By this and that
date: "2020-11-21"
series: ["blog"]
---

Traditional in-memory data structures do not optimally utilize on-CPU caches.
Hash tables for indexes are fast but only support point queries.
ART is very space efficient and solves the problem of excessive worst-case space consumption.
ART, an adaptive radix tree (trie) for efficient indexing in main memory. It maintains the data in sorted order, which enables additional operations like range scan and prefix lookup.

## Introduction

For OLTP workloads, the resulting execution plans are often sequences of index operations. Therefore, index efficiency is the decisive performance factor
T-tree was proposed as an in-memory indexing structure
The k-ary search tree and the Fast Architecture Sensitive Tree (FAST) use data level parallelism to perform multiple comparisons simultaneously with Singe Instruction Multiple Data (SIMD) instructions. However, they cannot support incremental updates
Hash tables are less commonly used as database indexes because scatter the keys randomly, and therefore only support point queries. Also do not handle growth gracefully, but require expensive reorganization upon overflow
Therefore, current systems face the unfortunate trade-off between fast hash tables that only allow point queries and fully-featured, but relatively slow, search trees.
A third class of data structures, known as trie, radix tree, prefix tree, and digital search tree
While most radix trees require to trade off tree height versus space efficiency by setting a globally valid fanout parameter, ART adapts the representation of every individual node
A useful property of radix trees is that the order of the keys is not random as in hash tables; rather, the keys are ordered bitwise lexicographically
operations that require the data to be ordered (e.g., range scan, prefix lookup, top-k, minimum, and maximum).

## Related Work

- In disk-based database systems, the B+-tree is ubiquitous
- T-trees, like all binary search trees, suffer from poor cache behavior and are therefore often slower than B+-trees on modern hardware. Workaround: a cache conscious B+-tree variant, the CSB+-tree
- Modern CPUs allow to perform multiple comparisons with a single SIMD instruction
- kary search → FAST: are pointer-free data structures which store all keys in a single array and use offset calculations to traverse the tree. While this representation is efficient and saves space, it also implies that no online updates are possible.
- GPUs as dedicated indexing hardware is not yet practical because memory capacities of GPUs are limited, communications cost with main memory is high
- The two earliest variants use lists and arrays as internal node representations
- radix tree over trie because it underscores the similarity to the radix sort algorithm and emphasizes that arbitrary data can be indexed instead of only character strings
- The idea of dynamically changing the internal node representation is used by KISS-Tree, Generalized Prefix Tree, Judy array. they work as a general-purpose indexing structure
- binary-comparable (“normalized”) keys: simplifying and speeding up key comparisons

## The Adaptive Radix Tree

Motivate the use of adaptive nodes by showing that the space consumption of conventional radix trees can be excessive.

- Properties of a Radix tree
  - The height depends on the lenght of the key, not on the number of keys
  - Require no balancing ops
  - Keys stored in lexicographic order
  - The path to a leaf node represents the key of that leaf

Radix mantains two type of nodes: Inner nodes, which map partial keys to other nodes, and leaf nodes, which store the values corresponding to the keys.
The most efficient representation of an inner node is as an array of *2^s* pointers.
The parameter *s* (span), is critical for performance, it determines the height of the tree for a given key length.
A radix tree storing k bit keys has *k/s* levels of inner nodes..
comparison-based search trees: it is illustrative to compare the height of radix trees with the number of comparisons in perfectly balanced search trees.
a radix tree node can rule out more values if *s>1*.
BST search takes *O(klogn)* whereas radix takes *O(k)*.

### Adaptive Nodes

It is desirable to have a large span.
Space usage becomes excessive when using array of pointers and childs are null.
As the span increases, the tree height decreases but the space also increases.
Only some values of *s* offer a balanced tradeoff between space and time.
ART uses less space and has smaller height than normal radix.
The idea is to adapively use different node sizes with same large span w. diff fanout.

### Structure of Inner Nodes

{{< figure src="images/adaptive-nodes.jpg#center" width="70%" title="Data structures for inner nodes" >}}

- Inner nodes map partial keys to child pointers
- Four data structures with different capacities
    - Node4: up to 4 child pointers and uses an array of length 4 for keys and another array of the same length for pointers
    - Node16: for storing between 5 and 16 child pointers. A key can be found efficiently with binary search or, on modern hardware, with parallel comparisons using SIMD instructions.
    - Node48: nodes with more than 16 pointers do not store the keys explicitly. this array stores indexes into a second array which contains up to 48 pointers
    - Node256: the next node can be found very efficiently using a single lookup of the key byte in that array. is also very space efficient because only pointers need to be stored.
- At the front of each inner node, a header of constant size (e.g., 16 bytes) stores the node type, the number of children, and the compressed path
- The child pointers can be scanned in sorted order, which allows to implement range scans
- Bytes are directly addressable which avoids bit shifting and masking operations
- Instead of using a list of key/value pairs, it splits the list into one key part and one pointer part. Refer to Figure 5 of the paper.

### Operations

#### Search

- The tree is traversed by using successive bytes of the kay array until a leaf node or a null pointer is encountered
- Depending on the node type the approapriate search algorithm is executed. For example Node16 uses SSE implementation with SIMD which allows to compare 16 keys stored with one instruction in parallel.

#### Insert

- replace substitutes a node in the tree by another node
- addChild appends a new child to an inner node
- checkPrefix compares the compressed path of a node with the key
- loadKey retrieves the key of a leaf from the database

#### Bulk loading

- Using the first byte of each key the key/value pairs are radix partitioned into 256 partitions
- Before returning that inner node, its children are created by recursively applying the bulk loading procedure for each partition using the next byte of each key

#### Delete

- deletion is symmetrical to insertion: leaf is removed from an inner node and then shrunk if necessary. If the node has only 1 child, it’s replaced by its child and comprsd.

## Conclusions

ART is a fast and space-efficient indexing structure for main-memory database system.
A high fanout, path compression, and lazy expansion reduce the tree height, and therefore lead to excellent performance.
ART is compared with other state-of-the-art main-memory data structures. Results show that ART is much faster than a red-black tree, a Cache Sensitive B+-Tree, and GPT, another radix tree proposal.
ART is a superior alternative to conventional index structures for transactional workloads.

## Links
- [The Adaptive Radix Tree: ARTful Indexing for Main-Memory Databases](https://db.in.tum.de/~leis/papers/ART.pdf)
