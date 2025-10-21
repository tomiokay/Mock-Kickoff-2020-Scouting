# Supabase Setup Instructions

Follow these steps to set up your Supabase database for the scouting app.

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Free tier is perfect for scouting - no credit card required!

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in:
   - **Project Name**: `frc-scouting-2020` (or whatever you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes for database to set up

## Step 3: Create Database Table

1. In your Supabase project dashboard, click "Table Editor" (left sidebar)
2. Click "Create a new table"
3. Use these settings:

**Table Name:** `match_data`

**Columns:**
- `id` (int8) - Primary key, Auto-increment ✓ (already there)
- `created_at` (timestamptz) - Default: now() ✓ (already there)
- `team_number` (int4) - Required
- `match_number` (int4) - Required
- `alliance_color` (text) - Required
- `starting_position` (text) - Required
- `scout_name` (text)
- `auto_score` (int4)
- `teleop_score` (int4)
- `endgame_score` (int4)
- `total_score` (int4)
- `crossed_init_line` (bool)
- `auto_bottom_port` (int4)
- `auto_outer_port` (int4)
- `auto_inner_port` (int4)
- `pickup_ball` (int4)
- `teleop_bottom_port` (int4)
- `teleop_outer_port` (int4)
- `teleop_inner_port` (int4)
- `rotation_control` (int4)
- `position_control` (int4)
- `park` (bool)
- `hang` (bool)
- `level` (bool)
- `defense` (int4)
- `penalty` (int4)
- `disabled` (int4)
- `notes` (text)
- `match_duration` (int4)
- `field_markers_json` (text) - Stores field tracking data

4. Click "Save"

## Step 4: Set Up Row Level Security (RLS)

For now, we'll allow anyone to read and write (you can add authentication later).

1. In Table Editor, click on `match_data` table
2. Click the shield icon or go to "Authentication" > "Policies"
3. Click "New Policy"
4. Choose "Create policy from scratch"
5. **Policy Name**: `Enable all access`
6. **Allowed operation**: SELECT, INSERT, UPDATE, DELETE (check all)
7. **Policy definition for SELECT**: `true`
8. **Policy definition for INSERT**: `true`
9. **Policy definition for UPDATE**: `true`
10. **Policy definition for DELETE**: `true`
11. Click "Review" then "Save policy"

## Step 5: Get Your API Keys

1. Click "Settings" (gear icon) in left sidebar
2. Click "API" under Project Settings
3. Copy these two values:

**You need:**
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJxxxx...` (the `anon` `public` key)

## Step 6: Add Keys to Your App

1. Open the scouting app folder
2. Create a file called `config.js` with this content:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

3. Replace the placeholders with your actual values from Step 5
4. Save the file

**IMPORTANT:** Add `config.js` to `.gitignore` if you're using Git, so your keys don't get committed!

## Step 7: You're Done!

The scouting app is now configured to:
- Save all match data to Supabase
- Load all data in real-time
- Display statistics and analytics
- Export data from the cloud

---

## SQL Script (Alternative Method)

If you prefer to create the table with SQL:

1. Go to "SQL Editor" in Supabase
2. Click "New query"
3. Paste this:

```sql
-- Create match_data table
CREATE TABLE match_data (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  team_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  alliance_color TEXT NOT NULL,
  starting_position TEXT NOT NULL,
  scout_name TEXT,
  auto_score INTEGER,
  teleop_score INTEGER,
  endgame_score INTEGER,
  total_score INTEGER,
  crossed_init_line BOOLEAN,
  auto_bottom_port INTEGER,
  auto_outer_port INTEGER,
  auto_inner_port INTEGER,
  pickup_ball INTEGER,
  teleop_bottom_port INTEGER,
  teleop_outer_port INTEGER,
  teleop_inner_port INTEGER,
  rotation_control INTEGER,
  position_control INTEGER,
  park BOOLEAN,
  hang BOOLEAN,
  level BOOLEAN,
  defense INTEGER,
  penalty INTEGER,
  disabled INTEGER,
  notes TEXT,
  match_duration INTEGER,
  field_markers_json TEXT
);

-- Enable Row Level Security
ALTER TABLE match_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Enable all access" ON match_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click "Run"
5. Done!

---

## Troubleshooting

**Can't save data?**
- Check RLS policies are enabled and set to `true`
- Verify API keys are correct in `config.js`

**Can't see data?**
- Check browser console for errors (F12)
- Verify Supabase URL is correct

**Need help?**
- Supabase docs: https://supabase.com/docs
- Check Table Editor to see if data is appearing

---

## Security Note

The current setup allows anyone with your URL to read/write data. This is fine for:
- Testing
- Internal team use
- Competitions where security isn't critical

For production, you should:
- Add authentication
- Restrict writes to authenticated users only
- Use Row Level Security properly

We can add this later if needed!
