# NICE Grading - Frontend UI

React + Vite + Tailwind CSS frontend for NICE Grading SaaS platform.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API URL and Stripe publishable key.

3. **Run development server:**

   ```bash
   npm run dev
   ```

   Opens on `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Outputs optimized bundle to `dist/`

## Pages & Routes

| Route                | Component                  | Auth Required    |
| -------------------- | -------------------------- | ---------------- |
| `/`                  | Landing page               | No               |
| `/login`             | Login form                 | No               |
| `/register`          | Registration form          | No               |
| `/dashboard`         | User submissions dashboard | Yes              |
| `/add-cards`         | Multi-step card submission | Yes              |
| `/submission-review` | Review before payment      | Yes              |
| `/payment`           | Payment (Pay Now/Later)    | Yes              |
| `/confirmation`      | Submission confirmed       | Yes              |
| `/admin`             | Admin submissions panel    | Yes (Admin only) |

## Key Features

### Authentication

- Register & login flow
- JWT token management
- Session caching of user profile
- Protected routes with role-based access
- Logout clears all cache

### Submissions

- Multi-step form for adding cards
- Form state persisted in session cache
- Edit before final submission
- Speed Demon toggle mode
- Submission summary with pricing

### Payments

- Pay Now - immediate charge
- Pay Later - charge on completion
- Card input with formatting
- Order summary
- Error handling

### Dashboard

- Table of user submissions
- Status color-coded badges
- Payment status indicators
- Amount display
- Memoized rows for performance

### Admin Panel

- All submissions view with pagination
- Inline status updates (triggers auto-charge)
- System analytics dashboard
- Filter by status & payment
- Quick actions menu

## Caching Strategy

### Session Storage

Clears on browser close:

- `user` - Current user profile
- `submissions` - Dashboard list
- `submission_form` - Multi-step form state
- `pricing_tiers` - Service tier info

### Local Storage

Persists across sessions:

- `token` - JWT auth token
- `userRole` - User role for routing
- `stripeCustomerId` - For Stripe integration

### Cache Validation

- Frontend skips API if cache exists
- Background revalidation on data changes
- Manual cache clear on error

## Components

### UI Components (UI.jsx)

- `Button` - Primary, secondary, ghost, danger variants
- `Input` - Text input with validation
- `Select` - Dropdown select
- `Card` - Dark bordered container
- `LoadingSkeleton` - Animated placeholder
- `Toast` - Notification messages

### Layout

- `Header` - Top navigation with user menu
- `Container` - Max-width wrapper
- `MainLayout` - Standard page wrapper

### Hooks

- `useAuth()` - Authentication & user state
- `useSubmissions()` - Submission CRUD
- `usePayment()` - Payment flows
- `useAdmin()` - Admin operations

## Styling

### Tailwind Configuration

- Custom colors: `neon-green: #B0FF00`, `dark: #0a0a0a`
- Custom fonts: System UI stack
- Dark theme by default

### CSS Customization

- Global styles in `index.css`
- Custom scrollbar styling
- Animation utilities
- Tailwind directives

## Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## API Integration

All API calls through `utils/api.js`:

- Automatically includes JWT token
- Error handling with user-friendly messages
- Request/response validation

## Performance

- Code splitting with React.lazy
- Memoized components reduce re-renders
- Skeleton loaders for fast perceived load
- Optimistic UI updates
- Table virtualization ready
- Debounced inputs

## Deployment

Build optimizations:

- Tree shaking removes unused code
- Minified CSS & JS
- Image optimization ready
- No source maps in production

Deploy to Vercel:

```bash
npm run build
```

Then connect repo to Vercel dashboard.

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge)

- CSS Grid & Flexbox
- ES2020+ JavaScript
- Fetch API
- localStorage/sessionStorage

## Notes

- Responsive design: Mobile-first approach
- Accessibility: Semantic HTML, ARIA labels
- All external links open in new tab
- Forms submit via API, not traditional POST
- Images are placeholders - replace with actual assets
