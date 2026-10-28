# Smart Parking Management

A simple smart parking management dashboard built with HTML, CSS, and JavaScript. It displays parking availability, slot status, revenue summary, and activity updates for a small parking facility.

## Features
- Live parking layout overview
- Ground floor and upper floor parking slots
- Add a vehicle to an available slot with its license plate
- Select slots, view vehicle details, release or reset a slot
- Navigation shortcuts to live tracking, bookings, payments, and recent activity
- Dashboard metrics for total, available, occupied, and revenue
- Local Node.js server for hosting the app
- Optional Supabase-backed parking data

## Run locally
1. Open a terminal in the project folder.
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at:
   ```text
   http://localhost:3000
   ```

## Project files
- `index.html` — dashboard structure
- `style.css` — visual design and layout
- `script.js` — parking logic and interactions
- `server.js` — local web server
- `supabase.js` — Supabase client initialization
- `supabase-schema.sql` — database schema for parking slots

## Supabase setup
1. Create a Supabase project.
2. In the Supabase SQL editor, run the commands in `supabase-schema.sql`.
3. Open `supabase.js` and replace the placeholder values with your project URL and anon key.
4. Or set the config before loading the script:
   ```html
   <script>
     window.__SUPABASE_CONFIG__ = {
       url: 'https://your-project.supabase.co',
       key: 'your-anon-key'
     };
   </script>
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="supabase.js"></script>
   ```
5. Refresh the app; the dashboard will prefer Supabase if the values are valid.

## Notes
Without Supabase configured, the app uses the local API and sample parking data. Local API changes are held in memory and reset when the server restarts. Configure Supabase to persist slot state in your database.
