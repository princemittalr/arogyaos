# Enterprise Data Platform & Master Data Management

A core platform layer facilitating ArogyaOS's "Zero-Runtime-Execution" control plane.

## Architecture Guidelines
- **Strict Separation of Concerns**: This module orchestrates metadata, topology, reference definitions, and schemas mapping to external data processes without directly invoking them.
- **Excluded Tools**: Absolutely NO runtime invocations are written for Snowflake, BigQuery, Databricks, Spark, Kafka, Airflow, dbt, ElasticSearch, or warehouse polling. 
- **Immutable Models**: Types and Models define Master Records (Patient, Provider, etc.), Catalogs, Analytics Models, and Data Lifecycles strictly.

## System Topology
React (UI Components) -> React Query Hooks -> Business Logic Services -> In-Memory Repositories -> (Future: External State Stores).
Event streams execute against a localized `DataPlatformEventBus`.
