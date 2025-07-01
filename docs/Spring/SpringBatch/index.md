---
title: "Spring Batch"
---

## Core Concepts

- [Spring Batch](SpringBatch/SpringBatch.md)
- [Domain](Domain/Domain.md)
- [JobRepository](JobRepository/JobRepository.md)
- [Step](Step/Step.md)
	- Chunk-oriented Processing, TaskletStep

## Configuration

- Batch Configuration
	- [Batch Configuration](Config/BatchConfig/BatchConfig.md)
- Job Configuration
	- [Job Configuration](Config/JobConfig/JobConfig/JobConfig.md)
- Step Configuration
	- [Step Configuration](Config/StepConfig/StepConfig/StepConfig.md)
	- [Chunk-oriented Processing](Config/StepConfig/Chunk-orientedProcessing/Chunk-orientedProcessing.md)
	- [Commit Interval](Config/StepConfig/CommitInterval/CommitInterval.md)
	- [Retry Logic](Config/StepConfig/RetryLogic/RetryLogic.md)
	- [Skip Logic](Config/StepConfig/SkipLogic/SkipLogic.md)
	- [Step Listener](Config/StepConfig/StepListener/StepListener.md)

## Running Jobs

- [Job Parameters](JobParameters/JobParameters.md)
- [Running Job](Config/RunningJob/RunningJob.md)

## Item Operations

- [Item Readers](ItemReaders/ItemReaders.md)
- [Item Processors](ItemProcessors/ItemProcessors.md)
- [Item Writers](ItemWriters/ItemWriters.md)

## Monitoring

- [Chunk Listener](Listener/ChunkListener/ChunkListener.md)
- [Job Execution Listener](Listener/JobExecutionListener.md)
- [Step Execution Listener](Listener/StepExecutionListener.md)

## Advanced Features

- [Partitioning](ParallelProcessing/Partitioning/Partitioning.md)
- [ParallelProcessing.md](ParallelProcessing/ParallelProcessing/ParallelProcessing.md)