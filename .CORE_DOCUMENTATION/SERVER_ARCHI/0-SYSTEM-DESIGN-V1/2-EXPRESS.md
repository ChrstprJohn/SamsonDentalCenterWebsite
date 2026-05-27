# Express & TypeScript Engineering Conventions

> **System Note:** Governed by `agent-skills/frontend-ui-engineering` and `agent-skills/api-and-interface-design`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the official development standards and production‑ready coding patterns for the Samson Dental backend built with Express and TypeScript.

---

## 1️⃣ TypeScript Configuration & Typings

1. **Strict Mode is Non-Negotiable**
   * `strict: true` in `tsconfig.json`.
   * No `any` types allowed. Use `unknown` if the type is truly dynamic, and validate it before using it.
   * Enable `noImplicitReturns`, `noFallthroughCasesInSwitch`, and `exactOptionalPropertyTypes`.

2. **DTOs (Data Transfer Objects)**
   * All incoming requests must be validated using classes and decorators (e.g., `class-validator` and `class-transformer`) or a schema validation library like Zod.
   * Separate input DTOs (what the client sends) from output DTOs (what we return). Never expose database entities directly to the client.

---

## 2️⃣ Express Routing & Controllers

1. **Async Error Wrapping**
   * Never use `try/catch` blocks inside controllers just to pass errors to `next`. Use an async wrapper (e.g., `express-async-errors`) to automatically catch promise rejections and forward them to the global error handler.

2. **Thin Controllers**
   * Controllers must be thin. They are only responsible for extracting data from `req`, calling a service, and formatting the `res`.
   * Example:
     ```typescript
     public async createUser(req: Request, res: Response) {
       const userDto = plainToClass(CreateUserDto, req.body);
       const newUser = await this.userService.create(userDto);
       res.status(201).json(newUser);
     }
     ```

---

## 3️⃣ Middleware & Security

1. **Global Middleware Stack**
   * Always apply standard security headers using `helmet`.
   * Enable CORS with a strict origin whitelist for production.
   * Apply global rate-limiting to prevent brute-force attacks.

2. **Request Validation Middleware**
   * Build a generic validation middleware that takes a DTO class, validates the request body/params/query against it, and returns a 400 response with detailed error messages if validation fails.

---

## 4️⃣ Error Handling

1. **Custom App Errors**
   * Create a base `AppError` class extending `Error` that includes an HTTP status code, an error code (e.g., `USER_NOT_FOUND`), and a message.
   * Create specific error subclasses (e.g., `NotFoundError`, `UnauthorizedError`, `ValidationError`).

2. **Global Error Handler**
   * Catch all errors in a single global middleware.
   * If the error is an instance of `AppError`, return the specified status code and a structured JSON response.
   * If it's an unhandled exception (500), log the stack trace securely and return a generic "Internal Server Error" message to the client, never exposing internal details.

---

*Document version: 1.1 – last updated 2026‑05‑17*