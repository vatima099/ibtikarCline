# Reference Management System

A modern web application for managing research references, built with a comprehensive technical stack for scalability, performance, and developer experience.

## 🛠 Technical Stack

### Frontend Framework

- **Next.js 14** with Pages Router - React framework for production
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript

### Authentication

- **NextAuth.js** - Complete authentication solution
- **Google OAuth** - Social authentication provider

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality, accessible React components
- **Lucide React** - Beautiful & consistent icon library
- **next-themes** - Theme management

### Database

- **MongoDB** - NoSQL database for flexible document storage
- **MongoDB Atlas** - Cloud database service (recommended)

### Data Fetching & State Management

- **tRPC** - End-to-end typesafe APIs
- **React Query (@tanstack/react-query)** - Powerful data fetching & caching
- **Zustand** - Lightweight state management

### Form Management & Validation

- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### File Handling

- **Formidable** - Server-side file upload parsing
- **Multer-like functionality** - Handle document uploads (PDF, DOC, BibTeX)

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Features

- **User Authentication** - Secure Google OAuth login
- **Reference Management** - Create, read, update, delete references
- **Advanced Search** - Search by title, author, tags, and type
- **Type Support** - Articles, books, conferences, theses, websites
- **Tag System** - Organize references with custom tags
- **File Upload** - Support for various document formats
- **Responsive Design** - Mobile-first responsive UI
- **Real-time Updates** - Optimistic updates with tRPC
- **Type Safety** - Full TypeScript coverage

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Google OAuth credentials

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd reference-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/reference-management

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Set up Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

5. **Set up MongoDB**

   **Option A: Local MongoDB**

   - Install MongoDB locally
   - Start MongoDB service
   - Use: `MONGODB_URI=mongodb://localhost:27017/reference-management`

   **Option B: MongoDB Atlas (Recommended)**

   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster
   - Get connection string
   - Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reference-management`

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
├── pages/                    # Next.js pages (Pages Router)
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth.js authentication
│   │   ├── trpc/           # tRPC API handler
│   │   └── upload.ts       # File upload endpoint
│   ├── references/         # Reference management pages
│   ├── dashboard.tsx       # Main dashboard
│   ├── index.tsx          # Landing page
│   ├── _app.tsx           # App wrapper with providers
│   └── _document.tsx      # Custom document
├── components/              # React components
│   ├── ui/                 # Shadcn/ui components
│   ├── layout/            # Layout components
│   └── reference-form-improved.tsx
├── lib/                    # Utility libraries
│   ├── mongodb.ts         # MongoDB connection
│   ├── trpc.ts           # tRPC client setup
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
├── server/                 # Server-side code
│   ├── routers/           # tRPC routers
│   ├── trpc.ts           # tRPC server setup
│   └── context.ts        # tRPC context
├── styles/                # Global styles
└── hooks/                 # Custom React hooks
```

## 🎯 Key Architecture Decisions

### Why Pages Router over App Router?

- **Specification Requirement** - The project explicitly requires Pages Router
- **Mature Ecosystem** - Better compatibility with current tRPC and NextAuth versions
- **Simpler Mental Model** - Easier to understand file-based routing

### Why tRPC?

- **End-to-end Type Safety** - Full TypeScript inference from client to server
- **Excellent DX** - Auto-completion and compile-time error checking
- **Lightweight** - No code generation, works seamlessly with React Query

### Why Zustand over Redux?

- **Simplicity** - Minimal boilerplate
- **Performance** - No unnecessary re-renders
- **TypeScript First** - Excellent TypeScript support
- **Small Bundle Size** - Lightweight alternative

### Why MongoDB?

- **Flexible Schema** - References have varying fields based on type
- **JSON-like Documents** - Natural fit for JavaScript/TypeScript
- **Powerful Queries** - Rich query capabilities for search functionality

## 📚 Usage

### Adding References

1. Click "Add Reference" from dashboard or navigation
2. Fill in the reference details
3. Add authors by typing and pressing enter
4. Add tags for organization
5. Save the reference

### Searching References

- Use the search bar to find references by title, author, or tags
- Apply filters by reference type
- Clear filters to see all references

### Managing References

- View reference details by clicking on the title
- Edit references using the edit button
- Delete references with confirmation

## 🔒 Security Features

- **Authentication Required** - All reference operations require login
- **User Isolation** - Users can only access their own references
- **File Upload Validation** - Restricted file types and size limits
- **Environment Variables** - Sensitive data in environment variables
- **CSRF Protection** - Built-in NextAuth.js CSRF protection

## 🚀 Performance Optimizations

- **React Query Caching** - Intelligent data caching and invalidation
- **Optimistic Updates** - Immediate UI updates with rollback on error
- **Code Splitting** - Automatic code splitting with Next.js
- **Image Optimization** - Next.js image optimization
- **Debounced Search** - Reduced API calls during search

## 📱 Responsive Design

- **Mobile First** - Designed for mobile devices first
- **Adaptive Layout** - Responsive grid and navigation
- **Touch Friendly** - Appropriate touch targets and interactions

## 🔄 Data Flow

1. **User Authentication** - NextAuth.js handles OAuth flow
2. **Data Fetching** - tRPC queries with React Query caching
3. **State Management** - Zustand for global application state
4. **Form Handling** - React Hook Form with Zod validation
5. **Database Operations** - MongoDB with type-safe operations

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript** - Strict type checking
- **ESLint** - Code linting rules
- **Prettier** - Consistent code formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
