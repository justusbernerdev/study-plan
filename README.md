# Study Tracker

A modern, real-time study progress tracking application built with Next.js 14, Convex, and Clerk. Track your academic goals, manage courses, and stay motivated with friends.

![Study Tracker](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Convex](https://img.shields.io/badge/Convex-Realtime-orange?style=flat-square)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## Features

### Core Functionality
- **Goal Management**: Create and track study goals (YO exams, entrance exams, courses, certifications)
- **Course Tracking**: Add courses under goals with customizable categories
- **Dynamic Daily Quotas**: Automatically calculates daily tasks based on deadlines
- **Progress Visualization**: Real-time progress bars and completion tracking

### Social Features
- **Study Partners**: Connect with friends using unique study codes
- **Streak System**: Track consecutive study days with motivational badges
- **Cheering**: Send encouragement to your study partners

### User Experience
- **Multi-language Support**: English and Finnish (Suomi)
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Instant synchronization across devices

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [Convex](https://convex.dev/) | Real-time backend & database |
| [Clerk](https://clerk.com/) | Authentication & user management |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Shadcn/UI](https://ui.shadcn.com/) | UI components |
| [Lucide React](https://lucide.dev/) | Icons |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:justusbernerdev/study-plan.git
   cd study-plan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a free Convex project
   - Deploy your database schema
   - Generate the `.env.local` file with `NEXT_PUBLIC_CONVEX_URL`

4. **Set up Clerk**
   
   Create an account at [clerk.com](https://clerk.com) and create a new application.
   
   Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Project Structure

```
study-tracker/
├── convex/                    # Convex backend
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User mutations & queries
│   ├── courses.ts            # Course management
│   ├── milestones.ts         # Goal/milestone management
│   ├── categories.ts         # Course categories
│   ├── connections.ts        # Friend connections
│   ├── cheers.ts             # Social encouragement
│   └── studyLogs.ts          # Study session logs
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   ├── sign-in/          # Clerk sign-in
│   │   └── sign-up/          # Clerk sign-up
│   │
│   ├── components/
│   │   ├── dashboard/        # Dashboard components
│   │   │   ├── main-dashboard.tsx
│   │   │   ├── course-card.tsx
│   │   │   ├── course-detail-modal.tsx
│   │   │   ├── streak-display.tsx
│   │   │   ├── invite-friend.tsx
│   │   │   └── ...
│   │   ├── providers/        # Context providers
│   │   └── ui/               # Shadcn/UI components
│   │
│   └── lib/
│       ├── translations.ts   # i18n translations
│       ├── language-context.tsx
│       └── utils.ts
│
├── public/                   # Static assets
└── ...config files
```

## Database Schema

The application uses Convex with the following tables:

- **users**: User profiles synced from Clerk
- **milestones**: High-level study goals
- **courses**: Courses under milestones
- **categories**: Customizable task categories within courses
- **connections**: Friend relationships
- **studyLogs**: Daily study session records
- **cheers**: Social encouragement messages

## Features in Detail

### Dynamic Workload Redistribution

The app automatically calculates daily quotas based on:
- Total remaining tasks
- Days until deadline
- Already completed work

If you miss a day, tasks are redistributed across remaining days.

### Study Code System

Instead of email invitations, users connect via unique 6-character codes:
1. Share your code with a friend
2. Friend enters your code
3. Both can see each other's progress

### Multi-language Support

Toggle between English and Finnish with the language button in the header. The selection is saved to localStorage.

## Deployment

### Deploy to Vercel

The easiest way to deploy Study Tracker is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/justusbernerdev/study-plan)

**Steps:**

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
4. Deploy!

### Deploy Convex Backend

1. Install Convex CLI globally:
   ```bash
   npm install -g convex
   ```

2. Deploy to production:
   ```bash
   npx convex deploy
   ```

3. Copy the production URL to your Vercel environment variables

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful components
- [Convex](https://convex.dev/) for the real-time backend
- [Clerk](https://clerk.com/) for authentication
- [Lucide](https://lucide.dev/) for icons

---

Built with love for students preparing for their exams. Good luck with your studies! 
