# 🔥 FireFlow - Personal Finance Management System

A comprehensive full-stack personal finance management application built with Next.js, TypeScript, and Supabase. FireFlow helps users track expenses, set financial goals, manage recurring transactions, and collaborate on shared financial objectives.

![FireFlow Dashboard](https://img.shields.io/badge/Status-Active%20Development-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🚀 Features

### 💰 Transaction Management
- **Income & Expense Tracking**: Add, categorize, and monitor all financial transactions
- **Real-time Dashboard**: Visual overview of financial health with charts and metrics
- **Transaction Filtering**: Advanced filtering by date, category, and amount
- **Monthly Breakdown**: Detailed monthly financial summaries

### 🎯 Goal Setting & Tracking
- **Personal Goals**: Set individual financial targets with progress tracking
- **Collaborative Goals**: Share and work towards goals with friends and family
- **Goal Categories**: Organize goals by categories (Car, Home, Travel, Education, etc.)
- **Progress Visualization**: Real-time progress bars and percentage tracking
- **Deadline Management**: Track days remaining for each goal

### 🔄 Recurring Transactions
- **Automated Tracking**: Set up recurring income and expenses
- **Flexible Frequencies**: Daily, weekly, bi-weekly, monthly options
- **Smart Scheduling**: Automatic calculation of next occurrence dates
- **End Date Management**: Optional end dates for temporary recurring items

### 👥 Social Features
- **Friend System**: Add friends and manage friend requests
- **Goal Collaboration**: Invite friends to collaborate on shared financial goals
- **Role Management**: Owner/Collaborator/Pending role system
- **Invitation System**: Accept/reject goal collaboration invites
- **Participant Tracking**: View all participants and their contributions

### 📊 Financial Analytics
- **Savings Tracking**: Monitor available savings and monthly accumulation
- **Goal Allocation**: Allocate available savings to specific goals
- **Progress Analytics**: Track progress across all goals and categories
- **Financial Health**: Overview of income, expenses, and savings trends

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Authentication**: JWT with HTTP-only cookies
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase Client
- **Security**: Row Level Security (RLS) policies

### Database Schema
- **Users**: User profiles and authentication
- **Transactions**: Financial transaction records
- **Goals**: Individual and collaborative goals
- **Goal Participants**: Goal collaboration management
- **Friends**: Friend relationships and requests
- **Recurring Transactions**: Automated transaction templates

## 📁 Project Structure

```
FireFlow/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App router pages and layouts
│   │   ├── _components/      # Reusable React components
│   │   │   ├── forms/        # Form components
│   │   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   │   ├── charts/       # Chart components
│   │   │   └── layout/       # Layout components
│   │   ├── cashflows/        # Transaction management pages
│   │   ├── goals/            # Goal tracking pages
│   │   ├── friends/          # Social features pages
│   │   ├── recurring/        # Recurring transaction pages
│   │   ├── profile/          # User profile pages
│   │   └── allocate/         # Savings allocation pages
│   ├── components/           # Additional UI components
│   ├── lib/                  # Utility libraries
│   └── public/               # Static assets
├── backend/                  # Express.js backend API
│   ├── controllers/          # API route handlers
│   ├── routes/               # Express route definitions
│   ├── models/               # Data models and types
│   ├── db/                   # Database configuration
│   └── types/                # TypeScript type definitions
└── supabase/                 # Supabase configuration
    ├── functions/            # Edge functions
    └── config.toml           # Supabase configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```
2. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the frontend directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Create `.env` in the backend directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   PORT=5100
   ```

4. **Set up Supabase database**
   ```bash
   cd supabase
   npx supabase start
   npx supabase db reset
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: https://fireflow-m0z1.onrender.com

## 🔧 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /login/logout` - User logout
- `GET /api/users` - Get current user profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/filter` - Filter transactions
- `DELETE /api/transactions/:id` - Delete transaction

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/with-participants` - Get goals with participant data
- `POST /api/goals/:id/invite` - Invite user to goal
- `POST /api/goals/:id/accept-invitation` - Accept goal invitation
- `POST /api/goals/:id/reject-invitation` - Reject goal invitation

### Friends
- `GET /api/friends` - Get user friends
- `POST /api/friends/send` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `DELETE /api/friends/delete` - Remove friend

### Recurring Transactions
- `GET /api/recurring-transactions` - Get recurring transactions
- `POST /api/recurring-transactions` - Create recurring transaction

## 🎨 Key Features Deep Dive

### Goal Collaboration System
- **Invitation Flow**: Users can invite friends to collaborate on financial goals
- **Role-based Access**: Owners can manage goals, collaborators can contribute
- **Real-time Updates**: Collaborative goals update in real-time for all participants
- **Contribution Tracking**: Track individual contributions within shared goals

### Smart Savings Allocation
- **Available Savings**: Calculate savings available for goal allocation
- **Progress Monitoring**: Track progress across multiple goals simultaneously

### Security Features
- **Row Level Security**: Database-level security ensuring users only access their data
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper CORS configuration for secure API access


## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
npm run deploy
```

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
npm run deploy



## 🗺️ Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with banking APIs
- [ ] Budgeting and forecasting tools
- [ ] Investment tracking capabilities
- [ ] Multi-currency support
- [ ] Export functionality (PDF, CSV)
- [ ] Advanced notification system

---

**Built with ❤️ by the FireFlow Team**

*FireFlow - Take control of your financial future*
