# Quick Start Guide - Supabase Scouting App

## Setup (One-Time - 10 Minutes)

### Step 1: Create Supabase Account & Database

1. Go to https://supabase.com and sign up (FREE)
2. Create a new project
3. Follow the detailed instructions in `SUPABASE_SETUP.md`
4. You'll get two values:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon Key (long string starting with `eyJ`)

### Step 2: Configure Your App

1. Open `config.js` in this folder
2. Replace `YOUR_SUPABASE_URL_HERE` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your Anon Key
4. Save the file

Example:
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 3: You're Done!

Refresh your browser at http://localhost:8000 and you're ready to scout!

---

## How to Use

### For Scouts (During Competition)

1. **Open the app** at http://localhost:8000 (or your server URL)

2. **Scout Tab** (default view):
   - Enter team number
   - Enter match number
   - Select alliance color (Red/Blue)
   - Select starting position (Left/Center/Right)
   - Enter your name (optional)
   - Click "Start Match"

3. **During the match:**
   - Press buttons as robot performs actions
   - Timer runs automatically
   - Scores update in real-time
   - Toggle buttons (Init Line, Park, Hang, Level) - click once to activate, click again to undo

4. **After the match:**
   - Click "💾 Save to Database" - **IMPORTANT!**
   - Data is now saved to the cloud
   - Click "New Match" to scout another robot

### For Data Analysis (After Scouting)

1. **Click "Data Dashboard" tab**

2. **View All Data:**
   - See all scouted matches in a table
   - Statistics summary at the top
   - Click any row to see full details

3. **Filter Data:**
   - Filter by Team Number
   - Filter by Match Number
   - Filter by Alliance Color
   - Click "Apply Filters"

4. **Export Data:**
   - Click "📊 Export All CSV" for spreadsheet analysis
   - Click "📦 Export All JSON" for custom analysis
   - Open in Excel, Google Sheets, or Python

5. **Match Details:**
   - Click any row or "👁️ View" button
   - See complete breakdown of robot performance
   - All actions, scores, and notes

---

## Features

### Scouting Tab
- ⏱️ Automatic match timer with period detection
- 📊 Real-time score calculation
- ✅ Toggle buttons for one-time actions
- 📝 Notes section for observations
- 💾 Save to cloud database
- 📄 Export individual match (JSON/CSV)

### Dashboard Tab
- 📈 Statistics summary (averages, totals)
- 🔍 Filter by team, match, or alliance
- 📊 Sortable data table
- 👁️ Detailed match view
- 💾 Export all data (CSV/JSON)
- 🗑️ Delete individual matches
- ⚠️ Clear all data option

---

## Troubleshooting

### "Database not configured"
- Check that `config.js` has your real Supabase URL and key
- Make sure you replaced the placeholder text

### "Error saving to database"
- Check your internet connection
- Verify Supabase project is running
- Check browser console (F12) for error details
- Ensure you created the `match_data` table in Supabase

### No data showing in dashboard
- Click "🔄 Refresh Data"
- Check if any filters are applied
- Verify data was saved (check Supabase table editor)

### Can't see field image
- Make sure `Images/Screenshot 2025-10-20 223552.png` exists
- It appears as a subtle background (5% opacity)

---

## Tips for Competition

1. **Before Event:**
   - Test the app thoroughly
   - Make sure all scouts can access the server
   - Export data as backup frequently

2. **During Event:**
   - Save after every match!
   - Use notes for important observations
   - Export data every hour as backup

3. **After Event:**
   - Export all data immediately
   - Analyze in your preferred tool
   - Keep Supabase database as backup

---

## Data Structure

Each match saves:
- **Match Info:** Team, match number, alliance, position, scout name
- **Scores:** Auto, teleop, endgame, total
- **Auto:** Init line, port scoring
- **Teleop:** Ball pickups, port scoring, control panel
- **Endgame:** Park, hang, level
- **Other:** Defense, penalties, disabled, notes
- **Metadata:** Timestamp, match duration

---

## Advanced Usage

### Multi-Scout Setup
All scouts can use the same database:
1. Share the same `config.js` file with all scouts
2. Each scout scouts different robots simultaneously
3. All data appears in the same dashboard
4. Real-time collaboration!

### Custom Analysis
Export JSON and use Python/R/Excel for:
- Team rankings
- Pick lists
- Match predictions
- Performance trends
- Alliance optimization

### Offline Mode
If internet is unavailable:
- Use "Export JSON" after each match
- Import manually to Supabase later
- OR use local-only mode (no database)

---

## Need Help?

1. Check `SUPABASE_SETUP.md` for detailed setup
2. Check `DATABASE_OPTIONS.md` for alternative solutions
3. Check browser console (F12) for error messages
4. Verify Supabase table structure matches requirements

---

## What's Next?

Optional enhancements you can add:
- [ ] User authentication (restrict who can save data)
- [ ] Team rankings page
- [ ] Match prediction algorithm
- [ ] Pick list generator
- [ ] Photo uploads
- [ ] Offline sync
- [ ] Mobile app version

---

Happy Scouting! 🤖⚡
