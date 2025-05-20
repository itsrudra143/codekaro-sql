# 💻 Code Karo (SQL Edition)

> 🚀 An interactive, multi-language **online code editor** with real-time execution, snippet sharing, user profiles with analytics, and a **Pro plan powered by Razorpay** to unlock advanced features.

---

![Code Karo Banner](public/Code-editor.png)

---

## ✨ Key Features

### 🧠 Advanced Code Editor

- 🛠️ Supports multiple programming languages:
  - **Free Tier:** JavaScript, Java, C++
  - **Pro Tier:** Access to all available languages (Python, Go, Rust, C#, Ruby, Swift, TypeScript, etc.)
- 🎨 Switchable editor themes (VS Dark, VS Light, GitHub Dark, Monokai, Solarized Dark)
- ⚙️ Real-time code execution via Piston API integration
- ↔️ Auto-formatting for various languages on paste and via shortcut (Shift+Alt+F)

### 💳 Pro Membership & Payments

- 🌟 **Unlock Pro Features:** Gain access to all programming languages by upgrading to Pro.
- 🇮🇳 Integrated with **Razorpay** for seamless and secure payments (500 INR for Pro).
- ✅ Secure payment verification flow.
- 📈 Pro status reflected across the application, including profile page and editor.

### 🔐 Authentication (Clerk)

- 🔑 Easy Login & Signup using [Clerk](https://clerk.dev).
- 🔒 Secure session management.

### 📤 Snippet Sharing

- 📎 Share code snippets (public/private - to be implemented based on original plan).
- ⭐ Star and favorite snippets.
- 💬 Comment on shared snippets.
- 🔍 Filter snippets by language, author, or name.

### 👤 Profile Dashboard

- ✨ **Pro Member** badge displayed for upgraded users.
- 📊 Shows number of snippets created and starred.
- 📈 Analytics of languages used, including last 24 hours activity.
- 🏆 Most used language and execution history.
- 🎨 Dynamic UI to view developer activity and statistics.

## 📊 System Architecture & Flows

Here's a visual overview of the Code Karo (SQL Edition) system architecture and key operational flows.

### 1. High-Level System Architecture

```mermaid
graph TD
    A[Client - Browser - Next.js/React] -->|HTTP Requests| B(Web Server / API - Next.js API Routes)
    B -->|User Auth| C(Clerk Auth Service)
    B -->|DB Operations| D[Database - MySQL with Prisma]
    B -->|Payment Processing| E(Razorpay Payment Gateway)
    B -->|Code Execution| F(Piston API - External)

    subgraph "User's Device"
        A
    end

    subgraph "Our Backend (Hosted)"
        B
        D
    end

    subgraph "Third-Party Services"
        C
        E
        F
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    style B fill:#ccf,stroke:#333,stroke-width:2px,color:#000
    style D fill:#cfc,stroke:#333,stroke-width:2px,color:#000
    style C fill:#ff9,stroke:#333,stroke-width:2px,color:#000
    style E fill:#ff9,stroke:#333,stroke-width:2px,color:#000
    style F fill:#ff9,stroke:#333,stroke-width:2px,color:#000

    classDef default color:#000
    linkStyle 0 color:#000
    linkStyle 1 color:#fff
    linkStyle 2 color:#fff
    linkStyle 3 color:#fff
    linkStyle 4 color:#fff
```

### 2. User Authentication Flow (Clerk)

```mermaid
sequenceDiagram
    participant Client as Client (Browser)
    participant ClerkJS as Clerk.js (@clerk/nextjs)
    participant Server as Next.js Backend
    participant ClerkBE as Clerk Backend API
    participant DB as MySQL Database (Prisma)

    Client->>ClerkJS: User initiates Login/Signup
    ClerkJS->>Client: Renders Clerk UI / Redirects
    Client->>ClerkBE: User submits credentials to Clerk
    ClerkBE-->>Client: Authentication successful, issues JWT/session
    Client->>Server: Makes authenticated request (with token/session)
    Server->>ClerkBE: Verifies token/session
    ClerkBE-->>Server: Verification result (user identity)
    alt User exists in DB
        Server->>DB: Fetches user by Clerk User ID
    else User does NOT exist in DB
        Server->>DB: Creates new user record (Clerk User ID, email, etc.)
    end
    DB-->>Server: User data
    Server-->>Client: Serves protected resource / user-specific data
```

### 3. Pro Plan Payment Flow (Razorpay)

```mermaid
sequenceDiagram
    participant Client as Client (Pricing Page)
    participant Server as Next.js Backend
    participant RazorpaySDK as Razorpay Node.js SDK
    participant RazorpayAPI as Razorpay API
    participant RZCheckout as Razorpay Checkout Modal
    participant DB as MySQL Database (Prisma)

    Client->>Server: POST /api/razorpay/checkout (Upgrade request)
    Server->>DB: Get/Create User (Prisma)
    Server->>RazorpaySDK: orders.create({amount, currency, notes:{userId}})
    RazorpaySDK->>RazorpayAPI: Create Order Request
    RazorpayAPI-->>RazorpaySDK: Order Details (order_id)
    RazorpaySDK-->>Server: Order Details
    Server-->>Client: {orderId, razorpayKeyId, amount, userName, userEmail}

    Client->>RZCheckout: Initializes Razorpay Checkout (with order_id, key_id)
    RZCheckout->>Client: User completes payment
    Client->>Client: payment.success handler (receives payment_id, order_id, signature)
    Client->>Server: POST /api/razorpay/verify-payment (with payment details)
    Server->>RazorpaySDK: crypto.Hmac (verify signature)
    alt Signature Valid
        Server->>RazorpaySDK: orders.fetch(razorpay_order_id)
        RazorpaySDK->>RazorpayAPI: Fetch Order Request
        RazorpayAPI-->>RazorpaySDK: Fetched Order (amount, notes.userId)
        Server->>Server: Verify amount & userId from notes against logged-in user
        alt Verification OK
            Server->>DB: Update User: isPro=true, proSince, razorpay IDs (Prisma)
            DB-->>Server: Updated User
            Server-->>Client: {success: true, isPro: true}
            Client->>Client: Redirect to Dashboard / Show Success
        else Verification Failed (Amount/User mismatch)
            Server-->>Client: {error: "Mismatch"}
        end
    else Signature Invalid
        Server-->>Client: {error: "Invalid Signature"}
    end
```

### 4. Code Execution Flow

```mermaid
sequenceDiagram
    participant Client as Client (Dashboard - Monaco Editor)
    participant Server as Next.js Backend
    participant DB as MySQL Database (Prisma)
    participant PistonAPI as Piston API (External)

    Client->>Server: POST /api/code-executions (code, language)
    Server->>DB: Get User (isPro status for language access)
    DB-->>Server: User's isPro status
    alt Language Access Granted (Free or Pro)
        Server->>PistonAPI: Execute code (language, version, files:[{content: code}])
        PistonAPI-->>Server: Execution Result (stdout, stderr, error)
        Server->>DB: Save Execution Record (userId, language, code, output, error)
        DB-->>Server: Confirmation
        Server-->>Client: Execution Result
    else Language Access Denied
        Server-->>Client: {error: "Language not available for your plan"}
    end
    Client->>Client: Display output/error
```

### 5. Database ER Diagram (Conceptual)

This diagram shows the main entities and their relationships within the MySQL database, managed by Prisma.

```mermaid
graph LR
    USER[USER<br>userId: string<br>email: string<br>name: string<br>isPro: boolean<br>proSince: datetime<br>razorpayOrderId: string<br>razorpayPaymentId: string<br>razorpaySignature: string<br>createdAt: datetime<br>updatedAt: datetime]
    SNIPPET[SNIPPET<br>snippetId: string<br>userId: string<br>title: string<br>code: string<br>language: string<br>isPublic: boolean<br>starCount: int<br>createdAt: datetime<br>updatedAt: datetime]
    CODE_EXECUTION[CODE_EXECUTION<br>executionId: string<br>userId: string<br>language: string<br>code: string<br>output: string<br>error: string<br>createdAt: datetime]
    COMMENT[COMMENT<br>commentId: string<br>userId: string<br>snippetId: string<br>content: string<br>createdAt: datetime]
    USER_STARRED_SNIPPET[USER_STARRED_SNIPPET<br>userId: string<br>snippetId: string<br>starredAt: datetime]

    USER -->|creates| SNIPPET
    USER -->|performs| CODE_EXECUTION
    USER -->|writes| COMMENT
    USER -->|stars| USER_STARRED_SNIPPET
    SNIPPET -->|has_comments| COMMENT
    SNIPPET -->|is_starred_in| USER_STARRED_SNIPPET
```

---

## ⚙️ Tech Stack

| Layer        | Tech Used                                                               |
| ------------ | ----------------------------------------------------------------------- |
| 🖥️ Frontend  | Next.js (App Router), React.js, TypeScript, Tailwind CSS, Monaco Editor |
| 🔧 Backend   | Next.js API Routes, TypeScript                                          |
| 💽 Database  | MySQL (managed with Prisma ORM)                                         |
| 🔐 Auth      | Clerk                                                                   |
| 💸 Payments  | Razorpay                                                                |
| 🚀 Execution | Piston API (for running code in various languages)                      |
| 🎨 UI Tools  | TailwindCSS, Framer Motion, Lucide Icons, Custom Theme Configurations   |

---

## 🧑‍💻 Developed By

**Rudrakshi Sharma**
📧 rudrakshisharma86@gmail.com
🔗 [GitHub](https://github.com/itsrudra143)

---

## 🏁 Getting Started

1.  **Prerequisites:**

    - Node.js (v18+ recommended)
    - npm/yarn/pnpm
    - MySQL database instance

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/itsrudra143/codekaro # Or your specific fork/repo
    cd codekaro/codekaro-sql
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

4.  **Set up environment variables:**

    - Rename the `.env.sample` file in the `codekaro-sql` directory to `.env.local`.

    ```bash
    # On Windows (PowerShell)
    Rename-Item .env.sample .env.local/.env

    # On macOS/Linux
    mv .env.sample .env.local
    ```

    - Open the newly created `.env.local/.env` file and update the placeholder values with your actual keys and URLs.

5.  **Apply database migrations:**

    - Ensure your MySQL server is running and the database specified in `DATABASE_URL` exists.

    ```bash
    npx prisma migrate dev
    npx prisma generate
    ```

6.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running on [http://localhost:3001](http://localhost:3001) (or your `NEXT_PUBLIC_APP_URL`).

---

## 🚀 Deployment

(Details about deploying the Next.js application, configuring environment variables on the hosting platform, and setting up the database would go here.)

---

## 🤝 Contributing

(Contribution guidelines, if any.)
