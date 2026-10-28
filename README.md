# Simplify Sales Management

A web system for a micro-enterprise with three employees to manage sales and purchases. It centralizes product, supplier and client registration, stock control, transactions and user login in a single application.

## Tech stack

**Back-end:** ASP.NET Core (.NET 8), Entity Framework Core 9, SQL Server, Swagger.

**Front-end:** React 18, TypeScript, Vite, Material UI, Redux.

## Features

**Registration:** products, suppliers and clients.

**Transactions:** sales and purchases that update stock automatically.

**Access:** user registration and login.

**Dashboard:** an overview of the business at a glance.

## Project structure

`Backend/` holds the ASP.NET Core Web API. `Frontend/` holds the React + TypeScript app.

## Getting started

**Requirements:** .NET 8 SDK, Node 18+ and a SQL Server instance.

**1. Configure the database.** Copy `Backend/appsettings.Example.json` to `Backend/appsettings.Development.json` (this file is git-ignored) and set your connection string.

**2. Run the API.**

```bash
cd Backend
dotnet ef database update
dotnet run --launch-profile https
```

Swagger is served at the root path and the API listens on https://localhost:7159.

**3. Run the front-end.**

```bash
cd Frontend
npm install
npm run dev
```

The API URL is currently hardcoded in `Frontend/src/reducers`; update it if your back-end runs on a different address.

## Known limitations and roadmap

**Password hashing:** passwords use unsalted SHA-256. Planned: move to BCrypt or Argon2.

**Authentication:** the login token is a placeholder. Planned: JWT-based authentication.

**CORS:** currently open to all origins. Planned: restrict to the front-end origin.

**Configuration:** the API URL is hardcoded. Planned: move it to an environment variable.

**Tests:** there are none yet. Planned: unit tests for the services and the transaction flow.
