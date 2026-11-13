# Stealth Notepad

Stealth Notepad is a Next.js study workspace that combines an academic syllabus browser with a real-time collaborative scratchpad. It includes searchable syllabus content, room-based notes, dark mode, mobile navigation, and a developer control panel for managing app settings.

## Features

- Searchable academic syllabus and notes
- Real-time collaborative rooms powered by Supabase
- Create or join rooms with commands such as `CREATE PYQ` and `#PYQ`
- Permanent study room access through the daily room key
- Responsive desktop and mobile layouts
- Light and dark themes with saved user preference
- Developer controls for configuring the daily room override
- Panic reset with the `Escape` key

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure Supabase

Copy the example environment file:

```bash
copy .env.example .env.local
```

Then update `.env.local` with the values from **Supabase Dashboard → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Set up the database

Open the Supabase SQL Editor, paste the contents of [`supabase-schema.sql`](./supabase-schema.sql), and run the script. It creates the settings, rooms, and notes tables, enables realtime updates, and configures the required policies.

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run the project linter |

## Room Commands

The top search bar supports both academic searches and room commands:

| Input | Action |
| --- | --- |
| `CREATE PYQ` | Create and open a room named `PYQ` |
| `NEW PYQ` | Create and open a room named `PYQ` |
| `#PYQ` | Join the `PYQ` room |
| `ROOM:PYQ` | Join the `PYQ` room |
| `MONDAY` | Open the permanent study room when Monday is active |
| `Escape` | Reset the current screen to the syllabus |

## Project Structure

```text
src/
├── app/             # Next.js app entry points and global styles
├── components/      # Navigation, syllabus, notepad, and developer UI
└── lib/             # Supabase client, room command parsing, and syllabus data
supabase-schema.sql  # Database tables, policies, indexes, and realtime setup
```

## Security Notes

- Never commit `.env.local` or other files containing Supabase credentials.
- The public Supabase anon key is intended for client-side use, but database policies should be reviewed before production deployment.
- The SQL schema currently permits public access to room and note data. Tighten the policies if the application requires authenticated or private rooms.

## License

No license has been specified yet.
