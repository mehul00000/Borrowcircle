# BORROWCIRCLE
# MASTER UI/UX DESIGN SYSTEM & FIGMA GENERATION BRIEF

**Product:** BorrowCircle  
**Tagline:** A Community That Shares Instead of Buys.  
**Document:** DESIGN.md  
**Version:** 1.0  
**Platforms:** Web, Android, iOS  
**Design Goal:** Professional, premium, modern, trustworthy, community-oriented.

---

# 1. MASTER DESIGN INSTRUCTION

Design a complete, high-fidelity UI/UX system for **BorrowCircle**, a hyperlocal peer-to-peer borrowing and lending platform.

BorrowCircle allows people to discover useful items in their neighbourhood, borrow them for a specific duration, and lend their own unused belongings to others.

The platform is based on a simple concept:

**Why buy something you only need occasionally when someone nearby already owns it?**

Create a professional digital product that feels like a combination of a premium community platform, a modern marketplace and a trusted neighbourhood network.

The design must NOT look like:
- A generic e-commerce template.
- A basic student project dashboard.
- A standard Bootstrap website.
- An overcrowded marketplace.
- A generic AI-generated SaaS dashboard.
- A social media clone.

The design must feel like a real, launch-ready startup product.

## Most important requirements

1. Design the complete website, not just the landing page.
2. Design the complete mobile application, not just mobile versions of website screenshots.
3. Maintain one consistent design language across web, Android and iOS.
4. Make every important screen visually polished.
5. Create realistic interactions and connected navigation.
6. Include loading, empty, error, success and disabled states.
7. Prioritise clarity, trust and usability.
8. Use realistic content and item photography.
9. Use consistent spacing, typography, colours and components.
10. Build reusable components and design-system styles.

The design should be detailed enough for developers to implement directly using:

- Next.js + TypeScript + Tailwind CSS for web.
- React Native + Expo + TypeScript for mobile.

---

# 2. BRAND IDENTITY

## 2.1 Brand Personality

BorrowCircle should communicate:

- Trust.
- Community.
- Sustainability.
- Simplicity.
- Accessibility.
- Reliability.
- Smart consumption.
- Modern technology.

The brand should feel friendly without appearing childish.

It should feel premium without being overly luxurious.

It should feel sustainable without relying on excessive environmental clichés.

## 2.2 Brand Positioning

BorrowCircle is a community-first sharing platform.

It is not primarily about selling products. It is about making existing resources accessible to nearby people.

## 2.3 Brand Voice

Use simple, warm and confident language.

Examples:

- "Find what you need, right around the corner."
- "Good things are better when shared."
- "Your neighbourhood has more than you think."
- "Borrow locally. Live sustainably."
- "List it. Share it. Make someone's day."

Avoid robotic or overly corporate language.

## 2.4 Logo Direction

Create a minimal, memorable logo.

Concept:
A circular symbol representing connection, sharing and community.

Possible visual directions:
- Two interconnected circles.
- A location pin integrated into a circular sharing symbol.
- Two abstract hands or shapes forming a circle.
- A simple connected-loop symbol.

The logo must:
- Work at small sizes.
- Work in monochrome.
- Work on light and dark backgrounds.
- Have a recognisable icon-only version.
- Have a horizontal icon + wordmark version.

Use a clean geometric sans-serif wordmark.

Do not use complicated illustrations in the logo.

---

# 3. VISUAL DESIGN DIRECTION

## 3.1 Overall Style

Use a visual direction called:

**Modern Neighbourhood Minimalism**

Characteristics:

- Spacious layouts.
- Strong typography.
- Warm off-white backgrounds.
- Deep forest-green primary accents.
- Subtle borders.
- Soft shadows.
- Rounded but controlled corners.
- High-quality product photography.
- Clear visual hierarchy.
- Minimal decorative elements.

The overall UI should look sophisticated and intentionally designed.

## 3.2 Colour Palette

Use the following colour system consistently.

### Primary Colours

Primary Forest Green:
#176B52

Dark Forest:
#104B3B

Deep Green:
#0D3B30

Light Green:
#E8F3EE

Soft Green:
#F2F8F4

### Secondary Colours

Warm Sand:
#F4F0E8

Soft Cream:
#FAF9F6

Muted Sage:
#A9BBAF

### Neutral Colours

Primary Text:
#17211D

Secondary Text:
#66736C

Muted Text:
#929C96

Border:
#E5EAE6

Surface:
#FFFFFF

Main Background:
#F8F9F6

### Semantic Colours

Success:
#23865B

Success Background:
#E9F6EE

Warning:
#D99A32

Warning Background:
#FFF5DF

Error:
#C94D4D

Error Background:
#FCECEC

Information:
#3979BD

Information Background:
#EAF2FB

### Colour Usage Rules

- Forest green is the primary action colour.
- Dark forest is used for prominent headings or dark hero backgrounds.
- Cream and off-white create warmth.
- White is used for cards and surfaces.
- Semantic colours are used only for meaningful statuses.
- Do not use bright neon colours.
- Do not introduce random gradients.
- Do not use multiple competing accent colours.

## 3.3 Typography

Use **Inter** as the primary typeface.

Recommended weights:
- Regular 400.
- Medium 500.
- Semibold 600.
- Bold 700.

### Desktop Typography

Display heading:
56–64 px

H1:
44–48 px

H2:
32–36 px

H3:
24–28 px

H4:
18–20 px

Body large:
18 px

Body:
15–16 px

Small:
13–14 px

Caption:
12 px

### Mobile Typography

Display:
36–40 px

H1:
30–32 px

H2:
24–26 px

H3:
20–22 px

Body:
14–16 px

Caption:
12 px

### Typography Rules

- Use strong, readable headings.
- Keep paragraph line lengths comfortable.
- Avoid excessively bold body text.
- Maintain consistent line heights.
- Avoid using more than two font families.
- Use tabular numerals for prices and dates where appropriate.

---

# 4. SPACING, GRID AND LAYOUT

## 4.1 Spacing System

Use an 8-point spacing system.

Available spacing values:

4 px  
8 px  
12 px  
16 px  
24 px  
32 px  
40 px  
48 px  
64 px  
80 px  
96 px  
120 px

Use spacing consistently.

## 4.2 Border Radius

Small elements:
8 px

Inputs:
12 px

Buttons:
12 px

Cards:
16 px

Large feature cards:
20 px

Modals:
20 px

Hero containers:
24 px

Pills:
999 px

Avoid excessive rounding on every element.

## 4.3 Shadows

Use subtle shadows.

Small card:
0 2px 8px rgba(20, 40, 30, 0.04)

Floating card:
0 8px 24px rgba(20, 40, 30, 0.08)

Modal:
0 16px 48px rgba(20, 40, 30, 0.14)

Borders should do most of the visual work. Avoid heavy shadows.

## 4.4 Desktop Grid

Maximum content width:
1280 px

Recommended page padding:
64 px on large screens.

Use a 12-column grid for complex desktop layouts.

Maintain consistent gutters.

## 4.5 Tablet Layout

Use:
- 24–32 px horizontal page padding.
- Two-column item grids where appropriate.
- Collapsible navigation.
- Responsive filter layouts.

## 4.6 Mobile Layout

Use:
- 16–20 px horizontal padding.
- Single-column layouts.
- Native-feeling navigation.
- Touch-friendly buttons.
- Bottom navigation.
- Safe-area awareness.
- Sticky primary actions where useful.

---

# 5. COMPONENT DESIGN SYSTEM

Create reusable components with consistent variants and states.

## 5.1 Buttons

Primary Button:
- Forest green background.
- White text.
- 12 px radius.
- Medium/semibold typography.

Secondary Button:
- White or soft-green background.
- Green text.
- Subtle border.

Outline Button:
- Transparent background.
- Neutral border.
- Dark text.

Ghost Button:
- Transparent.
- Minimal visual weight.

Danger Button:
- Soft red background or red outline.

Button sizes:
- Small: 36 px height.
- Medium: 44 px height.
- Large: 52 px height.

States:
- Default.
- Hover.
- Focus.
- Pressed.
- Disabled.
- Loading.

Use icons only when they improve clarity.

## 5.2 Inputs

Create:
- Text input.
- Search input.
- Password input.
- Textarea.
- Number input.
- Date input.
- Select input.
- Location input.

Input height:
48–52 px.

Use:
- Clear labels.
- Helpful placeholders.
- Focus borders.
- Error messages.
- Optional helper text.
- Visible required indicators.

Do not use placeholder text as the only label.

## 5.3 Item Cards

Item cards are one of the most important components.

Design a premium marketplace-style card.

Structure:

1. Large item image.
2. Optional availability badge.
3. Save/heart button.
4. Item title.
5. Category.
6. Approximate location.
7. Borrowing fee.
8. Lender rating or trust indicator.

Example:

[Item Image]

Available

Sony Camera Tripod

Photography · 1.2 km away

₹50/day

★ 4.9 · Verified lender

Card behaviour:
- Entire card opens item details.
- Save button toggles saved state.
- Hover slightly elevates card on desktop.
- Image has a consistent aspect ratio.
- Text must not overflow.

Image ratio:
4:3 preferred.

Use real-looking item photography, not cartoon illustrations.

## 5.4 Category Cards

Design compact category cards with:
- Simple icon.
- Category name.
- Optional item count.

Categories:
- Electronics.
- Photography.
- Tools.
- Books.
- Sports.
- Travel.
- Home.
- Gaming.
- Events.
- Miscellaneous.

Use subtle tinted backgrounds.

## 5.5 Profile Components

Profile avatar.
Verified badge.
Rating.
Review count.
Member since.
Location label.

## 5.6 Status Badges

Use restrained status colours.

Examples:

Pending:
Amber.

Accepted:
Blue or green.

Active:
Forest green.

Overdue:
Red.

Completed:
Muted green.

Declined:
Grey.

Disputed:
Red or amber.

Badges must remain compact and readable.

## 5.7 Navigation

Desktop:
Horizontal top navigation.

Mobile:
Bottom tab navigation.

## 5.8 Modals and Drawers

Use for:
- Confirmation.
- Filters.
- Report listing.
- Agreement acknowledgement.
- Cancel request.
- Image preview.

Use clear titles and primary/secondary actions.

---

# 6. WEBSITE DESIGN SPECIFICATION

Design a complete responsive website.

Website navigation must remain consistent across all authenticated pages.

## 6.1 Landing Page

Route:
/

Design this as a premium startup landing page.

### A. Navigation Bar

White or soft-cream background.

Left:
BorrowCircle logo.

Centre:
- Discover.
- How It Works.
- Categories.
- About.

Right:
- Log In.
- Get Started.

Use a sticky header with subtle border.

### B. Hero Section

Use a two-column layout.

Left side:

Small eyebrow:
"THE SMARTER WAY TO SHARE"

Main heading:

"Why buy when you can borrow?"

Highlight the word "borrow" in forest green.

Supporting text:

"Discover useful things around you. Borrow from your neighbours, share what you own, and build a community that makes more out of less."

Primary CTA:
"Explore Nearby"

Secondary CTA:
"Start Sharing"

Add a prominent search bar:

"What do you need today?"

Include location selector.

Right side:

Create a visually attractive lifestyle composition using high-quality photography of useful everyday items.

Possible objects:
- Camera.
- Drill.
- Travel suitcase.
- Books.
- Sports equipment.

Use an editorial collage or layered image cards.

Do not use an abstract AI blob as the main visual.

### C. Social Proof Strip

Include concise trust indicators:

- Local community.
- Verified profiles.
- Transparent borrowing.
- Built around sharing.

Do not invent real user counts or statistics.

### D. Categories Section

Heading:
"Everything you need, closer than you think."

Display a horizontal category grid.

Each category has:
- Icon or image.
- Name.
- Subtle background.

### E. How It Works

Three visually connected steps:

01 Discover

"Find useful items available in your neighbourhood."

02 Request

"Choose your dates and send a request to the owner."

03 Share

"Pick it up, make use of it and return it."

Use clean icons or restrained illustrations.

### F. Featured Nearby Items

Heading:
"Popular around you"

Supporting text:
"Good finds from people in your community."

Display a four-column desktop grid.

Include realistic item cards:
- Sony tripod.
- Cordless drill.
- Camping tent.
- Portable projector.
- Football.
- Travel suitcase.
- Gaming controller.
- Books.

Show realistic placeholder prices and distances, clearly treated as sample content.

### G. Community Section

Create an emotionally appealing section.

Heading:
"More sharing. Less unnecessary buying."

Show people exchanging items in a friendly neighbourhood setting.

Use a warm photographic visual.

### H. Trust and Safety

Heading:
"Sharing feels better when trust comes first."

Show:
- Verified profiles.
- Clear borrowing terms.
- Documented item condition.
- Community ratings.

### I. Lender CTA

Heading:
"That thing sitting unused? Someone nearby needs it."

Button:
"List an Item"

### J. Footer

Include:
- Logo.
- Short description.
- Discover.
- How it Works.
- About.
- Help.
- Privacy.
- Terms.
- Social links.

---

## 6.2 Discover Page

Route:
/discover

Purpose:
Allow users to find borrowable items.

Layout:

Desktop:
- Top navigation.
- Page heading.
- Search bar.
- Filter sidebar.
- Main item grid.
- Optional map view.

Heading:
"Find something nearby."

Search:
"Search cameras, tools, books and more..."

Filters:
- Category.
- Distance.
- Availability.
- Dates.
- Price.
- Rating.
- Condition.

Sorting:
- Recommended.
- Nearest.
- Recently Added.
- Lowest Price.

Grid:
Three or four columns depending on viewport.

Include:
- Item image.
- Item title.
- Location.
- Price.
- Availability.
- Lender rating.

Create a map/list toggle.

The map must use realistic placeholder pins and must not expose exact home addresses.

Empty state:
"No items found nearby."

CTA:
"Try changing your filters."

Loading state:
Skeleton cards.

---

## 6.3 Item Details Page

Route:
/items/[itemId]

Layout:

Desktop:
Two-column layout.

Left:
Large image gallery.

Right:
Item information and request card.

Content:

- Item title.
- Category.
- Condition.
- Lender profile.
- Rating.
- Approximate location.
- Description.
- Borrowing fee.
- Security deposit if applicable.
- Availability calendar.
- Borrowing guidelines.

Request card:

Select start date.

Select return date.

Display duration.

Display estimated fee.

Primary CTA:
"Request to Borrow"

Secondary action:
"Save Item"

Below the main section:

- Item details.
- Borrowing rules.
- Lender profile.
- Reviews.
- Similar nearby items.

Privacy:
Only show approximate location before an accepted transaction.

---

## 6.4 Authentication Pages

Routes:
/login
/signup
/forgot-password

Use a minimal split layout.

Left:
Branding and warm lifestyle photography.

Right:
Authentication form.

Login:
- Email.
- Password.
- Forgot password.
- Login.
- Sign up link.

Signup:
- Full name.
- Email.
- Password.
- Confirm password.
- Terms acceptance.
- Create account.

Use clear form validation and error states.

Avoid unnecessary fields during registration.

---

## 6.5 Listing Creation

Route:
/items/new

Create a multi-step listing wizard.

Progress indicator:

01 Photos  
02 Details  
03 Borrowing Terms  
04 Availability  
05 Location  
06 Preview

Step 1:
Upload images.

Show a large drag-and-drop upload area.

Step 2:
Item title.
Description.
Category.
Condition.

Step 3:
Borrowing fee.
Security deposit.
Minimum duration.
Maximum duration.
Borrowing rules.

Step 4:
Availability calendar.

Step 5:
Approximate location.

Step 6:
Preview listing.

Primary CTA:
"Publish Listing"

Secondary CTA:
"Save Draft"

Show clear validation and upload progress.

---

## 6.6 Dashboard

Route:
/dashboard

Create a modern dashboard that feels useful rather than corporate.

Greeting:
"Good morning, Alex."

Subtitle:
"Here's what's happening in your BorrowCircle."

Top summary:
- Active Listings.
- Pending Requests.
- Active Borrowings.
- Upcoming Returns.

Main content:

Left:
Recent activity.

Right:
Upcoming return reminders.

Additional sections:
- Your listings.
- Recent requests.
- Recommended nearby items.
- Quick actions.

Quick actions:
- List an Item.
- Discover Items.
- View Requests.

Use realistic data.

---

## 6.7 Requests Page

Route:
/requests

Create separate tabs:

- Received.
- Sent.
- History.

Each request card should show:

- Item image.
- Item name.
- Other user's avatar.
- Name.
- Borrowing dates.
- Duration.
- Fee.
- Status.

Received request actions:
- Accept.
- Decline.
- View Details.

Sent request actions:
- View Details.
- Cancel, if still pending.

Create a clear empty state.

---

## 6.8 Borrowing Details Page

Route:
/borrowings/[requestId]

This page is central to the product.

Use a timeline-based layout.

Show:

- Item details.
- Borrower and lender.
- Agreed dates.
- Agreement status.
- Handover status.
- Current borrowing status.
- Return status.

Timeline:

Request Submitted  
Request Accepted  
Agreement Acknowledged  
Handover Completed  
Borrowing Active  
Return Initiated  
Return Confirmed  
Transaction Completed

The timeline should visually highlight the current stage.

Display actions based on the user's role and current status.

Example:

"Confirm Receipt"

"Initiate Return"

"Confirm Return"

"Report an Issue"

Never show actions that are not allowed in the current transaction state.

---

## 6.9 Agreement Screen

Create a clean, document-like agreement interface.

Display:

- Item.
- Owner.
- Borrower.
- Dates.
- Fees.
- Deposit.
- Item condition.
- Responsibilities.
- Return expectations.
- Damage policy.

At the bottom:

Checkbox:
"I have read and agree to these borrowing terms."

Button:
"Acknowledge Agreement"

Show acknowledgement status for both parties.

Make it clear that this is a platform agreement acknowledgement, not necessarily a certified digital signature.

---

## 6.10 Condition Documentation

Create a simple evidence capture interface.

Sections:

Initial Handover Condition.

Return Condition.

Allow:
- Image uploads.
- Notes.
- Timestamp display.
- Preview images.

Use a side-by-side comparison layout on desktop.

Make it easy to identify differences.

---

## 6.11 Notifications Page

Route:
/notifications

Use a clean activity feed.

Group notifications by:

- Today.
- Yesterday.
- Earlier.

Each notification includes:
- Icon.
- Message.
- Timestamp.
- Related item.
- Read/unread indicator.

Include:
"Mark all as read"

---

## 6.12 Profile Page

Route:
/profile/[userId]

Include:

- Profile image.
- Name.
- Verification status.
- Location.
- Member since.
- Rating.
- Reviews.
- Listings.
- Borrowing history.
- Lending history.

Create a trustworthy, community-oriented profile.

---

## 6.13 Settings Page

Route:
/settings

Use a left sidebar on desktop.

Sections:

- Account.
- Profile.
- Security.
- Location.
- Notifications.
- Privacy.
- Blocked Users.

Use clean forms and clear save actions.

---

## 6.14 Admin Dashboard

Route:
/admin

Create a professional administration interface.

Include:

- Total Users.
- Active Listings.
- Borrowing Requests.
- Completed Transactions.
- Open Disputes.

Tables:
- Users.
- Listings.
- Reports.
- Disputes.

Provide:
- Search.
- Filters.
- Pagination.
- Status actions.
- Detail views.

The admin dashboard should be visually consistent with the brand but optimised for information density.

---

# 7. MOBILE APPLICATION DESIGN

Create a dedicated mobile UI for Android and iOS.

Do not simply shrink the website.

Use native-feeling interaction patterns.

## 7.1 Onboarding

Create three onboarding screens.

Screen 1:
"Your neighbourhood has more to offer."

Visual:
A friendly collection of everyday borrowable items.

Screen 2:
"Borrow what you need. Share what you own."

Visual:
Two people exchanging an item.

Screen 3:
"Good things are better when shared."

Visual:
A community-oriented sharing scene.

Include:
- Skip.
- Next.
- Progress indicators.
- Get Started.

## 7.2 Authentication

Create:
- Login.
- Signup.
- Forgot Password.

Use a clean mobile form layout.

Keep primary actions near the bottom where appropriate.

## 7.3 Main Navigation

Create a bottom tab bar with five tabs:

1. Home.
2. Discover.
3. Activity.
4. Saved.
5. Profile.

Use simple line icons.

Active tab:
Forest green.

Inactive tabs:
Muted grey.

Respect mobile safe areas.

## 7.4 Home Screen

Top:

Greeting:
"Hey, Alex 👋"

Location:
"Discovering near RK Puram"

Search:
"What are you looking for?"

Below:

Category shortcuts.

Section:
"Popular near you"

Horizontal item cards.

Section:
"Recently added"

Section:
"Your activity"

Include a floating or prominent action to list an item.

The home screen should feel welcoming and easy to scan.

## 7.5 Discover Screen

Top:
Search bar.

Below:
Filter chips.

Grid:
Two-column item cards.

Support:
- Search.
- Filters.
- Sorting.
- Map toggle.

Use a bottom sheet for filters.

## 7.6 Item Details Screen

Top:
Large image carousel.

Below:
- Item title.
- Category.
- Condition.
- Lender profile.
- Approximate location.
- Description.
- Price.
- Availability.

Bottom sticky action bar:

"Request to Borrow"

Include save action.

## 7.7 Request Flow

Use a simple multi-step request process.

Step 1:
Select start date.

Step 2:
Select return date.

Step 3:
Review estimated fee and terms.

Step 4:
Add optional message.

Step 5:
Submit request.

Show a confirmation screen.

## 7.8 Activity Screen

Tabs:

- Borrowing.
- Lending.
- History.

Use clear status badges.

Each card shows:
- Item image.
- Item name.
- Dates.
- Status.
- Next action.

## 7.9 Listing Creation

Create a mobile-first multi-step form.

Steps:

Photos  
Details  
Terms  
Availability  
Location  
Preview

Support camera and photo library.

Use a progress indicator.

Keep forms short and easy to complete.

## 7.10 Agreement Screen

Show the agreement as a scrollable document.

At the bottom:
- Agreement checkbox.
- Acknowledge button.

Show the other party's acknowledgement status.

## 7.11 Handover and Return

Create a camera-friendly condition reporting screen.

Allow:
- Taking pictures.
- Selecting existing photos.
- Adding notes.
- Confirming condition.

Make the next action obvious.

## 7.12 Notifications

Use a simple grouped feed.

Include notification icons, timestamps and unread indicators.

## 7.13 Profile

Include:
- Avatar.
- Name.
- Verification.
- Rating.
- Listings.
- Reviews.
- Borrowing history.
- Settings.

---

# 8. REALISTIC SAMPLE CONTENT

Use believable sample content throughout the designs.

Example listings:

1. Sony Camera Tripod
Category: Photography
Fee: ₹50/day
Condition: Good
Location: 1.2 km away
Rating: 4.9

2. Cordless Drill Machine
Category: Tools
Fee: ₹80/day
Condition: Like New
Location: 2.1 km away
Rating: 4.8

3. Camping Tent
Category: Travel
Fee: ₹120/day
Condition: Good
Location: 3.4 km away
Rating: 4.7

4. Portable Projector
Category: Electronics
Fee: ₹150/day
Condition: Like New
Location: 1.8 km away
Rating: 5.0

5. Football
Category: Sports
Fee: Free
Condition: Good
Location: 900 m away
Rating: 4.8

6. Cabin Suitcase
Category: Travel
Fee: ₹60/day
Condition: Good
Location: 2.5 km away
Rating: 4.6

7. Gaming Controller
Category: Gaming
Fee: ₹70/day
Condition: Like New
Location: 1.5 km away
Rating: 4.9

8. Study Table Lamp
Category: Home
Fee: Free
Condition: Good
Location: 1.1 km away
Rating: 4.8

All people, listings, ratings and prices are illustrative design data.

Do not present sample data as actual platform activity.

---

# 9. ICONOGRAPHY AND IMAGERY

## 9.1 Icons

Use Lucide-style outline icons.

Icon style:
- Minimal.
- Consistent stroke.
- Rounded corners.
- Clean geometry.

Avoid mixing multiple icon families.

Recommended icon concepts:
- Search.
- Map pin.
- Heart.
- User.
- Bell.
- Calendar.
- Camera.
- Book.
- Wrench.
- Dumbbell.
- Package.
- Shield.
- Check circle.
- Arrow right.

## 9.2 Photography

Use high-quality, natural photography.

Images should show:
- Real everyday objects.
- Natural lighting.
- Clean backgrounds.
- Realistic colours.
- Diverse people.
- Friendly neighbourhood settings.

Avoid:
- Overly artificial 3D objects.
- Cartoon illustrations as primary item images.
- Excessive stock-photo aesthetics.
- Images with embedded text.
- Watermarks.
- Inconsistent image styles.

Item cards should use consistent aspect ratios.

## 9.3 Illustrations

Use illustrations only for:
- Empty states.
- Onboarding.
- How-it-works sections.
- Success confirmations.

Illustrations should be minimal and consistent with the brand.

---

# 10. INTERACTION AND MICRO-INTERACTION REQUIREMENTS

Create polished interactions.

Examples:

- Cards gently elevate on hover.
- Buttons provide clear pressed states.
- Saved-item heart animates subtly.
- Search fields show focus states.
- Filters update selected states.
- Date selection is visually clear.
- Modals enter and exit smoothly.
- Toasts confirm successful actions.
- Skeletons appear during loading.
- Timeline progresses when a transaction advances.

Animation duration:
150–250 ms for most interactions.

Use restrained easing.

Do not over-animate.

Respect reduced-motion preferences.

---

# 11. REQUIRED UI STATES

Every major screen must include relevant states.

## Loading

Use skeletons that match the final content layout.

## Empty

Examples:

No saved items:
"Nothing saved yet. Find something useful nearby."

No listings:
"You haven't listed anything yet."

No requests:
"Your requests will appear here."

## Error

Use clear explanations and retry actions.

## Success

Use clear confirmations after:
- Listing published.
- Request submitted.
- Request accepted.
- Agreement acknowledged.
- Return confirmed.

## Disabled

Show disabled buttons when actions are not permitted.

Never rely only on colour to communicate status.

---

# 12. FIGMA FILE ORGANISATION

Organise the Figma project into these pages.

PAGE 01 — COVER

- BorrowCircle logo.
- Product title.
- Tagline.
- Brand colours.
- Short product description.

PAGE 02 — DESIGN FOUNDATIONS

- Colour palette.
- Typography.
- Spacing.
- Grid.
- Shadows.
- Radius.
- Iconography.

PAGE 03 — COMPONENT LIBRARY

- Buttons.
- Inputs.
- Search.
- Cards.
- Badges.
- Navigation.
- Modals.
- Drawers.
- Tabs.
- Avatars.
- Calendars.
- Status indicators.

PAGE 04 — WEBSITE PUBLIC

- Landing page.
- Login.
- Signup.
- Discover.

PAGE 05 — WEBSITE APPLICATION

- Item details.
- Create listing.
- Dashboard.
- Requests.
- Borrowing details.
- Agreement.
- Notifications.
- Profile.
- Settings.

PAGE 06 — WEBSITE ADMIN

- Admin overview.
- User management.
- Listing moderation.
- Reports.
- Disputes.

PAGE 07 — MOBILE FOUNDATIONS

- Mobile typography.
- Mobile spacing.
- Bottom navigation.
- Mobile components.
- Mobile form patterns.

PAGE 08 — MOBILE APPLICATION

- Onboarding.
- Authentication.
- Home.
- Discover.
- Item details.
- Request flow.
- Activity.
- Listing creation.
- Agreement.
- Handover.
- Return.
- Notifications.
- Profile.

PAGE 09 — PROTOTYPES

- Website user journey.
- Mobile borrower journey.
- Mobile lender journey.
- Cross-platform borrowing journey.

PAGE 10 — UI STATES

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Hover.
- Focus.
- Pressed.

---

# 13. FIGMA FRAME AND RESPONSIVE SPECIFICATIONS

Create the following reference frames.

## Website

Desktop:
1440 × 1000

Laptop:
1280 × 900

Tablet:
768 × 1024

Mobile Web:
390 × 844

## Mobile Application

iPhone reference:
393 × 852

Android reference:
360 × 800

Also validate on larger mobile screens.

Use Auto Layout wherever possible.

Use reusable components and variants.

Use consistent constraints and responsive resizing.

Do not design each screen as an isolated image.

---

# 14. PROTOTYPE FLOWS

Create interactive prototypes for the following journeys.

## Flow A — Borrower Journey

Landing Page
→ Discover
→ Select Category
→ Open Item
→ Select Dates
→ Submit Request
→ Request Confirmation
→ View Activity
→ Agreement
→ Confirm Receipt
→ Active Borrowing
→ Initiate Return
→ Completed
→ Review Lender

## Flow B — Lender Journey

Login
→ Dashboard
→ Create Listing
→ Upload Images
→ Add Details
→ Set Availability
→ Publish
→ Receive Request
→ View Borrower
→ Accept Request
→ Acknowledge Agreement
→ Handover
→ Confirm Return
→ Review Borrower

## Flow C — Mobile Journey

Onboarding
→ Login
→ Home
→ Discover
→ Item Details
→ Request
→ Activity
→ Agreement
→ Handover
→ Active Borrowing
→ Return
→ Review

## Flow D — Cross-Platform Journey

Create listing on website.

Discover listing on mobile.

Request item on mobile.

Accept request on website.

Complete agreement on either platform.

Confirm handover on mobile.

Track borrowing on website.

Complete return on either platform.

All states must remain consistent.

---

# 15. DESIGN QUALITY AND ACCESSIBILITY

Follow these standards:

- WCAG AA contrast wherever practical.
- Clear keyboard focus on web.
- Screen-reader-friendly labels.
- Minimum comfortable touch targets.
- Consistent form validation.
- Visible action feedback.
- Readable text.
- Logical heading hierarchy.
- Proper mobile safe areas.
- Clear disabled states.

Use approximately 44–48 px touch targets for primary mobile interactions.

Do not communicate important information through colour alone.

---

# 16. DESIGN IMPLEMENTATION RULES

1. Use Auto Layout extensively.
2. Use components rather than duplicated elements.
3. Use component variants for states.
4. Create reusable text styles.
5. Create reusable colour styles or variables.
6. Use consistent spacing tokens.
7. Maintain naming conventions.
8. Use realistic placeholder data.
9. Keep layouts responsive.
10. Keep desktop and mobile navigation distinct.
11. Maintain one brand identity.
12. Ensure all important screens are connected through prototype interactions.
13. Do not create decorative screens without functional purpose.
14. Avoid arbitrary changes in typography or colour.
15. Do not invent additional product features that conflict with the PRD.

---

# 17. FINAL FIGMA GENERATION INSTRUCTION

Generate a complete, professional, high-fidelity BorrowCircle product design.

Prioritise the following:

1. A visually impressive landing page.
2. A polished item discovery experience.
3. Beautiful and practical item cards.
4. A clear item details page.
5. An intuitive listing creation flow.
6. A well-designed borrowing request system.
7. A trustworthy agreement interface.
8. A clear borrowing timeline.
9. A polished user dashboard.
10. A complete native-feeling mobile application.

The final result must look like a carefully designed, funded startup product that could realistically be presented to investors, users and a development team.

The visual identity should be consistent, modern, premium and recognisable.

Use the forest-green, warm-neutral design language throughout.

Make the product feel genuinely useful and trustworthy.

**The most important design principle: BorrowCircle should make borrowing feel as easy and natural as buying, while making sharing feel personal and community-driven.**

END OF DESIGN DOCUMENT