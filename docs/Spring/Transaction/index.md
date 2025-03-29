---
title: "Spring Transaction"
---

## Spring Transaction

- [Transaction](Transaction/Transaction.md)
	- PlatformTransactionManager, JpaTransactionManager, DataSourceTransactionManager
	- @Transactional
		- rollbackFor, noRollbackFor, readOnly, propagation
		- isolation: DEFAULT, READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
- [Transaction Propagation](TransactionPropagation/TransactionPropagation.md)
  - REQUIRED, REQUIRES_NEW, NESTED, MANDATORY, SUPPORTS, NOT_SUPPORTED, NEVER