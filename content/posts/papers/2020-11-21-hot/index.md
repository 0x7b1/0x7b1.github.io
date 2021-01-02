---
author: jc
title: "Paper review: HOT Radix Tree"
summary: HOT is a efficient radix tree that uses a general purpose index structure for main-memory database systems or string intensive applications.
date: "2020-11-21"
series: ["blog"]
---

This paper introduces HOT, a trie index structure that enables efficient search and insert operations using modern processor instructions by being space efficient and linear scalable.
The basic idea is to dynamically vary the number of bits considered at each node and enable high fanout and low tree height.
The major difference between this and radix tree variants is its variable size for each node.
HOT outperforms state of the art index structures in terms of search performance and memory footprint.
These prevalent differences makes it appealing to be used as a general purpose index structure for main-memory database systems or string intensive applications.

## Introduction

Memory database systems depend on fast index structures.
For this reason, it is required to be space efficient and responsive.
One advantage of using tries, compared to hash tables, is its order-preserving property.
ART achieves high fanout and high performance on integers but its average fanout is lower when indexing strings.
This is caused by sparse key distributions prevalence in string keys.
HOT is a space-optimized and performant index structure that dynamically evolves and efficiently support operations.
It uses an adaptive number of bits (also known as *span*) per nodes depending on the data distribution to achieve a high average fanout.
In this way, the sparsity problem and space consumption are reduced.
HOT also provides a careful design to leverage the power of modern CPU instructions by making intensive use of SIMD parallel operations.
For the benchmark, HOT is compared against state-of-the-art index structures showing outstanding results.

## Background

Trie is a tree structure where all descendants of a node share a common prefix.
The major drawbacks of tries are the large heights.
Patricia trees omit nodes with only one child, the result is a full binary tree.
This reduces the height but the fanout remains small, and therefore still yields large tree heights.
In order to reduce the height, one technique is to increment the size of the span *s* and make each node to store \(2^s\) pointers.
Large spans are space consuming but they can be reduced by dynamically adapting the node structure, like ART does by using a compact representation of the store instead of a fixed array of 256 pointers.
Having a span of 8 bits results in sparsity of distributed keys in many nodes with very low fanout.
Using adaptive nodes reduces the memory consumption in sparsely distributed data, but does not address the problem of a balanced fanout and height of the tree.
The idea is to reduce the height of the tree and increase the average node fanout.
HOT builds upon these previous ideas to propose a binary Patricia trie with compound nodes by having a maximum node fanout and an optimized resulting height.
Previous work has proposed hybrid data structures but they perform concisely only on specific workloads.

{{< figure src="images/1-trees.jpg#center" width="70%" title="Figure 1. Different implementations of a Trie, and HOT" >}}

### Implementation

As mentioned, the most important optimization is to increase the span of each compound node.
We can observe in the Figure 1 how the span and fanout varies across different impementations of a trie.
The problem lies on sparsely-distributed keys that usually string values cause when using a trie with fixed size of span.
HOT proposes to set the size of the span per node depending on the data distribution by targeting a maximum fanout *k*.
In HOT, every compound node represents a binary Patricia trie with a fanout up to *k*, with *n* keys and *n − 1* inner nodes.
This means at most *k − 1* binary inner nodes.
Given a *k* of fanout the idea is to minimize the overall tree height associated with *h(n)*, which yields the maximum height of its compound child nodes.
The minimization of the height of the tree is analogous to partitioning a full binary tree.
This idea preserves the height optimization while new data is inserted.
A (compound) node contains up to *k − 1* patricia trie nodes and *k* leaf entries.

### Organization

{{< figure src="images/2-binary.jpg#center" width="70%" title="Figure 2. Binary encoding using a sequential layout" >}}

HOT does not organize nodes in a pointer-based trie structure, instead uses a compact representation that allows it to be space-efficient and fast, as it is shown if the Figure 2.
The idea is to linearize a trie bit string in order to allow parallel searching using SIMD instructions.
The first dimension of the node is the size of the partial keys, and the second is the representation of the bit positions.
These representations are meant to be optimized by modern processor instruction sets.
Each node layout consists of header, bit positions, partial keys, and values.
The lookup operation traverses the tree until a leaf node containing a tuple identifier is encountered.
The insertion operation uses a sparse partial key for inner nodes.
First, a search operation is issued to check its existence, and then an intricate operation to flip bites using SIMD is done in order to insert new bit positions.
This operation is further improved by encoding the least-significant bits and overlapping operations.

### Scalability

Scalability is important for an index structure, for this a synchronization protocol is used in order to provide efficient concurrent index access.
Traditional locking tech-iques don’t scale.
Lock-free index structures or write-only minimal locks.
For synchronizing HOT, the protocol takes care of the insert and delete operations.
One important aspect of the synchronization is making the nodes obsolete instead of claiming directly to memory, this allows concurrent writes and reads with no locking.

### Evaluation

For the benchmarking, there are 5 workloads that test operations according to different proportions by using four different datasets consisting of string data.
HOT is compared against state of the art index structures: ART, MassTree, BT.
The benchmark evaluates performance, memory consumption scalability and tree height.

- Performance: HOT is better on many of the workload scenarios. It is also consistent across different dataset shapes, which makes it appealing for a general purpose index structure.
- Memory consumption: The evaluation measures the space required to store nodes, and key identifiers. HOT is the most space-efficient data structure, and also the one that has less memory footprint.
- Scalability: The workload executes insert and lookup operations to measure the throughput of operations. HOT features a linear scalability mainly due to the employed synchronization protocol.
- Tree height: An analysis of the depth distribution for all data sets shows that HOT is able to reduce the mean depth significantly in contrast with the other trie structures.

## Conclusion

HOT is a novel index data structure that improves traditional tries by tackling the problem of speed and sparsity.
This enables instant lookup and fast insert operations, which is one of the requirements of Database Systems.


## Links
- [HOT: A Height Optimized Trie Index for Main-Memory Database Systems](https://15721.courses.cs.cmu.edu/spring2019/papers/08-oltpindexes2/p521-binna.pdf)
