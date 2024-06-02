# Simple Concurrent Contracts

This document contains examples showcasing concurrent programming with Arcology's concurrent library. It demonstrates how to implement concurrent counters using two built-in data structures in the Arcology concurrent library: `U256Cumulative` and `Concurrent boolean array`.

- [Concurrent likes](./docs/parallel-like.md)
- [Concurrent visit counter](./docs/parallel-visits.md)

## Summary

Both contracts demonstrate the use of Arcology's concurrent library to handle concurrent operations, but they employ different data structures to achieve their respective goals. The Like contract uses a commutative counter to track likes, while the Visits contract uses a concurrent array of boolean values to track visits. Each approach ensures safe and conflict-free updates in a concurrent environment.