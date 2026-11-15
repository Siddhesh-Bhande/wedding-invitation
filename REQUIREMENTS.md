# Traditional Indian Wedding Invitation Website — Requirements

## 1. Project Overview
- **Goal:** Build a rich, animated, traditional Indian wedding invitation website.
- **Hosting:** Static frontend (HTML/CSS/JS or modern static site) compatible with free hosting services (e.g., GitHub Pages, Netlify, Vercel, Cloudflare Pages).
- **Design & Theme:** Traditional Indian aesthetic featuring rich cultural motifs, warm/festive color palettes, and smooth, engaging animations throughout the user journey.
- **Reference Assets:** The `examples/` directory contains screenshots illustrating the desired sequence of sections and visual elements.

---

## 2. Page Flow & Section-by-Section Requirements

### 2.1. Entrance Sequence (Landing Experience)
1. **Traditional Door:**
   - When visitors land on the page, they are greeted by a closed traditional Indian door.
   - **Interaction:** Tapping/clicking the door triggers an opening animation.
2. **Curtain Reveal:**
   - Behind the opening door is a closed traditional curtain.
   - The curtain then animates open and settles into place as a decorative frame along the **top** and **sides** of the viewport.
3. **Main Hero Section & Couple Portrait Showcase:**
   - Reveals a rich, traditional background along with the most important wedding details:
     - **Groom:** `Siddhesh Laxman Bhande` (*Son of Mr Laxman and Mrs Priyanka Bhande*)
     - **Bride:** `Nikita Dnyaneshwar Desai` (*Daughter of Mr Dnyaneshwar and Mrs Trupti Desai*)
   - **Scroll Indicator:** Displays a clear "scroll down" icon/animation so visitors know to scroll down for more details.
   - **Couple Portrait Showcase:** Displays the custom couple illustration (`assets/couple_image.png`) framed in a royal palace arch with an animated golden mandala halo and ribbon pedestal right above the Save the Date section.

### 2.2. Save the Date (Interactive Scratch-Off & Calendar)
- **Scratch-Off Heart:**
  - The wedding date is strictly concealed behind an interactive **golden heart** overlay that users must **scratch** (via touch or mouse) to reveal.
  - No dates are visible anywhere in this section before scratching, and the heart reveals **only the Wedding Date** (**January 2, 2027**).
- **Save the Date Button:**
  - Clicking the **"Save the Date"** button automatically adds the wedding events to the user's calendar (`.ics` download and Google Calendar links) for:
    - **January 1, 2027** — Haldi and Sangeet
    - **January 2, 2027** — Wedding and Reception
  - Detailed ceremony timings are shown in the dedicated Schedule section below the countdown (not inside the Save the Date card).

### 2.3. Countdown Timer
- Placed directly below the Save the Date section.
- Live countdown (Days, Hours, Minutes, Seconds) leading up to the auspicious wedding date/time (**Saturday, January 2, 2027, 12:32 PM**).

### 2.4. Wedding Ceremony Schedule
Displayed below the countdown with traditional styling:

- **Header:** `|| Wedding Ceremony Schedule ||`
- **Friday, January 1, 2027**
  - **Engagement (Sakharpuda):** 11:00 AM
  - **Haldi Ceremony:** 4:00 PM
  - **Tel (Oil) Ceremony:** 7:00 PM
- **Saturday, January 2, 2027**
  - **Auspicious Wedding:** 12:32 PM

### 2.5. Wedding Venue Details
Displayed as the user scrolls further down:
- **Venue Name & Address:**
  `Kalpana River Villa, Khutghar, Shahapur, Maharashtra 421601`
- **Embedded Map:** A small interactive Google Map box showing the venue location.
- **Action Button:** A **"View on Google Maps"** button that opens the location directly in Google Maps.

### 2.6. RSVP Form (Google Form & Google Sheets Integration)
- **Backend:** Wired directly to the user's Google Form (`https://forms.gle/58w74jZkjKkoE8yv7` → `https://docs.google.com/forms/d/e/1FAIpQLScVd7zi3qHpQUwCKK_d-kzbd3mfp-lqnHKFL3KDXv_gf284fQ/formResponse`), which saves responses automatically into the `Form Responses 1` tab of the **Siddhesh & Nikita Wedding RSVPs** Google Sheet (`https://docs.google.com/spreadsheets/d/1TrQlGHmzZ7k2Iw6d_zRxy4rb64MmalTqTYvsoFzZB-Q/edit`) while preserving 100% of the custom traditional palace-themed UI.
- **Form Fields & Google Form Entry Mapping (All Optional):**
  - **Name** (`entry.107880043`)
  - **Guest Count** (`entry.605238274`, scale `1–10`)
  - **Dietary Preference** (`entry.380952230`, single reversible `Veg only` checkbox mapped to `"Vegetarian Only"`)
  - **Planned Arrival / Attendance** (`entry.1772788153`: `"Arriving on the wedding day"`, `"Arriving one day prior"`, or `"Arriving two or more days prior"`)
  - **Arrival Note / Travel Details** (`entry.1168825779`)
- **Pre-fill & Update Behavior:**
  - If a guest has already RSVPed previously, the form should look up and **pre-fill** their existing data from the Google Sheet.
  - Guests can **modify** their RSVP details at any time.
  - **Validation:** Nothing is required — every field is optional.

---

## 3. Technical & Non-Functional Requirements
- **Mobile-First & Responsive:** Must work smoothly on mobile phones (where most guests will open the invite via WhatsApp/SMS) as well as desktop browsers.
- **Performance:** Smooth 60fps animations for the door, curtain, scratch-off canvas, and scroll reveals.
- **Zero-Cost Hosting:** No paid backend servers; static site + free Google Sheets / Apps Script integration.
