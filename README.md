# ROTARI

### Business Management System for Small Businesses & Entrepreneurs

ROTARI is a practical business management system designed around the everyday operations of a small business.

The project was originally prepared with a real small-business use case in mind. It is also used as a portfolio case study to show how I approach business analysis, workflow design, system design, and implementation.

> **The application is designed around the business workflow — not around isolated features.**

---

## Why ROTARI?

Small businesses often have customer data, transactions, products or services, payments, stock, and customer follow-up — but these activities are often managed separately.

ROTARI explores how these activities can be connected so that a business transaction creates useful information for the next action.

The basic idea is:

**Business Activity → Transaction → Information → Action → Decision**

---

## Core Business Flow

A customer interaction can move through several connected parts of the business:

```
Customer
   ↓
Transaction
   ↓
Payment / Operational Process
   ↓
Customer History
   ↓
CRM Follow-up
   ↓
Customer Retention / Loyalty
```

Transactions can also create operational information:

```
Transaction
   ↓
Products / Services
   ↓
Stock & Cost Information
   ↓
Operational Insight
   ↓
Business Decision
```

This is an important part of the system design: **a transaction is not treated only as a record.**

---

## Main Business Areas

### 1. Transactions

The transaction module handles business transactions, including:

- Invoice information
- Customer information
- Cashier information
- Products and services
- Quantity and pricing
- Discounts
- Down payment / full payment
- Payment status
- Work status
- Transaction history

### 2. Customer Management

Customer data is connected to transaction activity so the business can understand customer history rather than only maintain a contact list.

Customer information includes activity indicators such as:

- Total orders
- Total spending
- Last order
- Customer status

### 3. Products & Services

ROTARI supports both products and services.

The data model includes:

- Cost price
- Selling price
- Service duration
- Raw material cost
- Stock
- Dead-stock indication
- Last sold information

This allows operational data to be connected with transaction activity.

### 4. CRM

Customer activity can become a trigger for follow-up.

The current design includes CRM records for customer retention activities, including dormant and lost-customer scenarios.

CRM activity can also be associated with a resulting transaction, allowing the business to see whether a follow-up converted into business activity.

### 5. Promotion

The system includes promotion instructions related to products or services and stock conditions.

This connects operational information with possible promotional action.

### 6. Operational Expenses

Expenses are separated into:

- Fixed costs
- Variable costs

This provides a foundation for connecting operational activity with business performance.

---

## Multi-Tenant Design

ROTARI is designed as a multi-tenant application.

The core relationship is:

```
Authenticated User
       ↓
User Profile
       ↓
Tenant / Business
       ↓
Business Data
```

Business entities carry a `tenant_id`, allowing data to be associated with the correct business.

The database uses **PostgreSQL with Supabase Row Level Security (RLS)** to enforce tenant-aware access policies.

The project therefore treats data isolation as part of the system architecture, not only as a frontend concern.

---

## Roles

The current data model defines three roles:

- **Owner**
- **Cashier**
- **Super Admin**

The role model is intended to separate business management responsibilities from day-to-day transaction operations and platform-level administration.

---

## Data Model

The main business entities include:

```
tenants
   │
   ├── users
   ├── customers
   ├── products_services
   ├── operational_expenses
   ├── transactions
   │      └── transaction_items
   ├── crm_logs
   └── promo_instructions

prospect_leads
```

This structure reflects the business relationships behind the application rather than simply organizing tables by screen.

---

## System Architecture

The application is built as a modern web application using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Row Level Security

The architecture separates the user interface, application behavior, and database responsibilities so the system can evolve as the business requirements grow.

---

## Authentication & Access

ROTARI requires authentication before accessing the application.

This is intentional.

The application was designed as a business system rather than as an open public demo. The live application may therefore require an authorized account.

For portfolio purposes, this repository provides the business context, workflow, data model, architecture, and implementation details without requiring public access to business data.

---

## What This Project Demonstrates

ROTARI represents the way I approach software projects as a **Business & System Analyst**.

### Business Analysis

- Understanding business activities
- Identifying operational problems
- Translating business needs into system requirements
- Connecting business goals with system behavior

### System Analysis

- Business process modelling
- Workflow design
- Data relationships
- Role and access design
- Multi-tenant considerations
- Database structure
- System architecture

### Implementation

- Next.js application development
- TypeScript
- Supabase integration
- PostgreSQL data modelling
- Row Level Security
- Frontend implementation
- Authentication and access control

---

## A Different Way to Look at Transactions

One of the principles behind ROTARI is:

> **A transaction should not simply create a record. It should create information that helps the business decide what happens next.**

For example:

```
Transaction
   ↓
Customer History
   ↓
Customer Status
   ↓
CRM Opportunity
   ↓
Follow-up
   ↓
New Transaction
```

This creates a feedback loop between daily operations and customer relationship management.

---

## Project Context

ROTARI was initially developed with a real small-business use case in mind.

The project is currently also maintained as a portfolio case study to demonstrate the process of turning business requirements into a working digital system.

The live application is intentionally protected by authentication.

**Live application:** https://rotari.vercel.app

---

## About

I'm **Tri Raida**, a Business & System Analyst with a background in entrepreneurship, business processes, digitalization, and software development.

I am particularly interested in helping **small businesses and entrepreneurs** turn operational problems into practical digital systems.

My approach is simple:

> **Understand the business first. Then design the system.**
