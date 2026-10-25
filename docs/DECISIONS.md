# Technical Decisions

## D001: Fresh Implementation
Bravo will be implemented from scratch.
Existing application code will not be copied.

## D002: Backend
Node.js 20, Express and JavaScript ES modules.

## D003: Frontend
React, Vite and Tailwind CSS.

## D004: Database
MongoDB for persistent application data.
Redis for queues, presence and Socket.io coordination.

## D005: Code Execution
Judge0 CE will run user submissions in an isolated environment.

## D006: Testing
Every phase must pass its required tests before the next phase begins.