---
author: jc
title: SparkSQL RDF Benchmarking
summary: Systematic comparison of RDF relational schemas using Apache Spark.
date: "2020-11-25"
series: ["projects"]
cover:
  image: "/covers/sparksql.jpg"
---

This is projects aimed to systematically compare relevant RDF relational schemas, i.e., Single Statement Table, Property Tables or Vertically-Partitioned Tables queried using Apache Spark.

It is evaluated the performance Spark SQL querying engine for processing SPARQL queries using three different storage back-ends, namely, Postgres SQL, Hive, and HDFS. For the latter one, the experiment compares four different data formats (CSV, ORC, Avro, and Parquet). It uses a representative query workloads from the SP2Bench benchmark scenario.

The results show interesting insights about the impact of the relational encoding scheme, storage backends and storage formats on the performance of the query execution process.
You can visit more in the [project website](https://datasystemsgrouput.github.io/SPARKSQLRDFBenchmarking/).

## Links
- [Source code](https://github.com/DataSystemsGroupUT/SPARKSQLRDFBenchmarking)
- [Benchmarking Spark-SQL under Alliterative RDF Relational Storage Backends](http://ceur-ws.org/Vol-2496/paper5.pdf)
- [Towards making sense of Spark-SQL performance for processing vast distributed RDF datasets](https://dl.acm.org/doi/10.1145/3391274.3393632)
