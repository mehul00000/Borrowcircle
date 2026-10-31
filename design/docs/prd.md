# BORROWCIRCLE
# PRODUCT REQUIREMENTS DOCUMENT (PRD)

Version: 3.0
Document Type: Master Product Requirements Document
Product Name: BorrowCircle
Tagline: A Community That Shares Instead of Buys.
Status: Product Definition
Platforms:
- Responsive Web Application
- Android Application
- iOS Application

---

# 1. PRODUCT OVERVIEW

## 1.1 Introduction

BorrowCircle is a hyperlocal peer-to-peer borrowing and lending platform that enables people within nearby neighbourhoods, residential societies, campuses and communities to share items they do not use regularly.

Instead of purchasing something for occasional use, users can discover and borrow it from someone nearby.

Similarly, users can list their unused or rarely used belongings and allow others to borrow them for a defined period.

BorrowCircle aims to make borrowing convenient, transparent, safe and community-driven.

The platform will provide a unified experience across web and mobile applications.

Both applications will use:
- One shared backend.
- One authentication system.
- One central database.
- One set of business rules.
- One common API architecture.

## 1.2 Product Vision

Build a trusted local sharing ecosystem where accessing an item becomes easier than purchasing it.

## 1.3 Tagline

"A Community That Shares Instead of Buys."

## 1.4 Core Value Proposition

For borrowers:
- Save money by borrowing instead of buying.
- Find useful items nearby.
- Access items for short-term requirements.
- Avoid unnecessary purchases.

For lenders:
- Make productive use of unused belongings.
- Help people in their community.
- Earn optional income through lending.
- Build trust and reputation.

For communities:
- Encourage sustainable consumption.
- Reduce unnecessary purchases.
- Strengthen neighbourhood relationships.
- Promote resource sharing.

---

# 2. PROBLEM STATEMENT

People frequently purchase products that they only need occasionally.

Examples:
- A drill machine needed for a single home repair.
- A tripod needed for a weekend photography project.
- A suitcase needed for a short trip.
- A projector needed for an event.
- Sports equipment needed for temporary use.
- Books, tools and appliances needed for a limited period.

At the same time, many people own these items but rarely use them.

There is no universally convenient way to discover, request and borrow such items from trusted people nearby.

Existing buying and selling marketplaces are not specifically designed for temporary borrowing.

BorrowCircle addresses this gap through a community-based sharing platform.

---

# 3. PRODUCT OBJECTIVES

## 3.1 Primary Objectives

1. Allow users to list items for borrowing.
2. Enable users to discover nearby available items.
3. Allow borrowers to request items for specific dates.
4. Allow owners to approve or decline requests.
5. Establish transparent borrowing terms.
6. Provide digital agreement acknowledgement.
7. Record item condition during handover and return.
8. Track active and completed borrowings.
9. Build trust through reviews and reputation.
10. Support responsive web and mobile experiences.

## 3.2 Secondary Objectives

- Encourage sustainable consumption.
- Build hyperlocal communities.
- Reduce unnecessary purchases.
- Introduce optional lending fees in the future.
- Support community-based sharing groups.
- Enable verified users and trusted communities.

## 3.3 Success Metrics

The platform should monitor:

- Total registered users.
- Monthly active users.
- Number of active listings.
- Number of successful borrowings.
- Request acceptance rate.
- Request completion rate.
- Average time to find an item.
- Repeat borrowing rate.
- Repeat lending rate.
- Dispute rate.
- User retention.
- Average user rating.

---

# 4. TARGET AUDIENCE

## 4.1 Primary Audience

- College students.
- University communities.
- Residential societies.
- Working professionals.
- Neighbourhood residents.
- People living in shared accommodation.

## 4.2 Secondary Audience

- Hobbyists.
- Photographers.
- Travellers.
- DIY enthusiasts.
- Sports enthusiasts.
- Small community organisations.

## 4.3 Initial Market

The initial launch should focus on a limited geographical area.

Potential launch communities:
- University campuses.
- Residential societies.
- Apartment complexes.
- Local neighbourhoods.

A focused launch will help establish trust and sufficient listing density.

---

# 5. USER ROLES AND PERMISSIONS

A single account can act as both a borrower and a lender.

## 5.1 Guest

A guest is an unauthenticated visitor.

Permissions:
- Visit the landing page.
- View public platform information.
- Browse limited item listings.
- View categories.
- Register or log in.

Restrictions:
- Cannot request an item.
- Cannot list an item.
- Cannot contact users.
- Cannot save items.

## 5.2 Member

A registered user.

Permissions:
- Browse items.
- Search and filter.
- Save items.
- Request borrowing.
- Manage profile.
- View notifications.
- Review completed transactions.

## 5.3 Lender

A member who lists an item.

Permissions:
- Create listings.
- Edit listings.
- Manage availability.
- Receive borrowing requests.
- Accept or decline requests.
- Manage handover and return.
- Review borrowers.

## 5.4 Borrower

A member who requests an item.

Permissions:
- Request available items.
- Select borrowing dates.
- View agreement terms.
- Acknowledge agreements.
- Submit condition evidence.
- Confirm return.
- Review lenders.

## 5.5 Administrator

An administrator manages platform operations.

Permissions:
- View users.
- Manage reported listings.
- Suspend accounts.
- Remove inappropriate listings.
- Review disputes.
- Monitor transactions.
- View audit records.
- Manage categories.

---

# 6. PLATFORM REQUIREMENTS

BorrowCircle must support two fully functional platforms.

## 6.1 Website

Technology:
- Next.js
- TypeScript
- Tailwind CSS

The website must be responsive and support:
- Desktop.
- Laptop.
- Tablet.
- Mobile browsers.

The website is a complete application, not merely a marketing landing page.

Users must be able to perform the complete borrowing lifecycle through the website.

## 6.2 Mobile Application

Technology:
- React Native
- Expo
- TypeScript
- Expo Router

Platforms:
- Android.
- iOS.

The mobile application should feel native and support:
- Native navigation patterns.
- Push notifications.
- Camera access.
- Image uploads.
- Location permissions.
- Native sharing.
- Secure token storage.
- Deep linking.

## 6.3 Shared Infrastructure

Both platforms must share:
- Authentication.
- User accounts.
- Item listings.
- Search functionality.
- Borrowing requests.
- Agreements.
- Transaction statuses.
- Notifications.
- Reviews.
- Database records.

No platform should maintain a separate set of borrowing business rules.

---

# 7. WEBSITE FUNCTIONAL REQUIREMENTS

## 7.1 Landing Page

Route: /

Purpose:
Introduce BorrowCircle and encourage users to explore or register.

Required sections:

### Navigation Bar

Elements:
- BorrowCircle logo.
- Home.
- Discover.
- How It Works.
- About.
- Login.
- Sign Up.
- Profile menu when authenticated.

### Hero Section

Primary heading:

"Why Buy When You Can Borrow?"

Supporting text:

"Discover useful things around you. Borrow from your neighbours, share what you own, and build a community that makes more out of less."

Primary CTA:
Explore Nearby Items

Secondary CTA:
Start Sharing

Include a prominent search field.

### Category Section

Display popular categories:
- Electronics.
- Photography.
- Tools and Hardware.
- Books.
- Sports and Fitness.
- Travel.
- Home Appliances.
- Events and Entertainment.
- Miscellaneous.

### How It Works

Three primary steps:

1. Discover:
Find items available in your neighbourhood.

2. Request:
Choose your dates and send a borrowing request.

3. Share:
Collect the item, use it and return it.

### Featured Listings

Display selected nearby listings.

Each listing card should contain:
- Item image.
- Item name.
- Category.
- Approximate location.
- Availability.
- Lender rating.
- Optional borrowing fee.

### Trust Section

Explain:
- Verified accounts.
- Transparent borrowing terms.
- Digital agreements.
- Condition documentation.
- Community reviews.

### Sustainability Section

Communicate the environmental value of sharing rather than buying.

### Footer

Include:
- About.
- Contact.
- Privacy Policy.
- Terms and Conditions.
- Community Guidelines.
- Help Centre.
- Social media links.

---

## 7.2 Authentication

Routes:
- /login
- /signup
- /forgot-password
- /reset-password

Requirements:
- Email and password registration.
- Login.
- Logout.
- Password reset.
- Email verification.
- Authentication persistence.
- Protected routes.
- Session expiration handling.

Future enhancement:
- Google authentication.
- Apple authentication.
- Phone number verification.

---

## 7.3 Discover Page

Route: /discover

Purpose:
Help users discover items nearby.

Required features:

### Search

Search by:
- Item name.
- Keyword.
- Category.
- Description.

### Filters

- Category.
- Distance.
- Availability.
- Date range.
- Price.
- Rating.
- Condition.

### Sorting

- Nearest first.
- Recently listed.
- Highest rated lender.
- Lowest borrowing fee.

### View Options

- Grid view.
- List view.
- Map view.

### Listing Card

Each card should show:
- Image.
- Item title.
- Category.
- Approximate distance.
- Location.
- Availability.
- Borrowing fee, if applicable.
- Lender rating.

---

## 7.4 Item Details Page

Route: /items/[itemId]

Display:

- Item name.
- Image gallery.
- Description.
- Category.
- Condition.
- Borrowing fee.
- Security deposit, if applicable.
- Availability calendar.
- Approximate location.
- Lender profile.
- Lender rating.
- Borrowing rules.
- Minimum and maximum borrowing duration.

Actions:
- Request to Borrow.
- Save Item.
- Share Listing.
- Report Listing.

The exact handover location must not be publicly exposed.

---

## 7.5 Create Listing

Route: /items/new

Users must be able to list an item.

Required fields:

- Item title.
- Description.
- Category.
- Item condition.
- Images.
- Borrowing fee (optional).
- Security deposit (optional).
- Availability.
- Borrowing rules.
- Minimum borrowing duration.
- Maximum borrowing duration.
- Approximate location.

Image requirements:
- Multiple images.
- Image preview.
- Remove image.
- Upload progress.
- File type validation.
- File size validation.

Listing statuses:

- DRAFT
- ACTIVE
- PAUSED
- UNAVAILABLE
- REMOVED

Users can edit, pause or remove their listings.

A listing with an active borrowing request must follow transaction rules before it can be removed.

---

## 7.6 User Dashboard

Route: /dashboard

Display:

- Welcome message.
- Active listings.
- Pending requests.
- Active borrowings.
- Upcoming returns.
- Recent activity.
- Notifications.
- Quick actions.

Quick actions:
- List an Item.
- Discover Items.
- View Requests.
- View Borrowings.

---

## 7.7 Borrowing Requests

Route: /requests

Display separate sections:

- Received Requests.
- Sent Requests.
- Pending Requests.
- Accepted Requests.
- Declined Requests.
- Cancelled Requests.

Request information:

- Item.
- Borrower.
- Lender.
- Requested start date.
- Requested end date.
- Borrowing duration.
- Optional message.
- Borrowing fee.
- Deposit.
- Request status.

Lender actions:
- Accept.
- Decline.
- View Borrower Profile.

Borrower actions:
- Cancel pending request.
- View request details.

---

## 7.8 Borrowing Details

Route: /borrowings/[requestId]

Display the complete borrowing lifecycle.

Information:
- Item details.
- Borrower.
- Lender.
- Agreed dates.
- Terms.
- Agreement acknowledgement.
- Handover information.
- Condition reports.
- Return information.
- Transaction status.
- Activity timeline.

Available actions depend on the current transaction state.

---

## 7.9 Notifications

Route: /notifications

Notification types:

- New borrowing request.
- Request accepted.
- Request declined.
- Agreement awaiting acknowledgement.
- Agreement completed.
- Handover reminder.
- Item received.
- Return reminder.
- Return initiated.
- Return confirmed.
- Borrowing overdue.
- Dispute update.
- New review.

Features:
- Read/unread status.
- Mark as read.
- Mark all as read.
- Notification history.

---

## 7.10 User Profile

Route: /profile/[userId]

Display:
- Profile picture.
- Name.
- Short bio.
- General location.
- Member since.
- Average rating.
- Completed borrowings.
- Lending history.
- Reviews.

Privacy settings must control which profile details are visible.

---

## 7.11 Settings

Route: /settings

Sections:
- Account details.
- Profile information.
- Password.
- Location preferences.
- Notification preferences.
- Privacy.
- Blocked users.
- Account deletion.

---

## 7.12 Admin Dashboard

Route: /admin

Features:
- User management.
- Listing management.
- Category management.
- Report management.
- Dispute management.
- Account suspension.
- Platform statistics.
- Audit log access.

Only authorised administrators can access this route.

---

# 8. MOBILE APPLICATION REQUIREMENTS

The mobile application must provide the same essential functionality as the website.

## 8.1 Onboarding

Screens:
1. Welcome.
2. Product introduction.
3. How BorrowCircle works.
4. Location permission explanation.
5. Login or Sign Up.

Users should be allowed to continue without granting location permission.

Manual location selection must remain available.

## 8.2 Authentication

Screens:
- Login.
- Sign Up.
- Forgot Password.
- Reset Password.

Requirements:
- Secure authentication.
- Session persistence.
- Secure token storage.
- Logout.
- Account verification.

## 8.3 Main Navigation

Use a bottom navigation bar.

Tabs:

1. Home
2. Discover
3. Activity
4. Saved
5. Profile

## 8.4 Home Screen

Display:
- Location selector.
- Search bar.
- Category shortcuts.
- Nearby listings.
- Recommended items.
- Recently added items.
- Active borrowing summary.

## 8.5 Discover Screen

Features:
- Search.
- Category filtering.
- Distance filtering.
- Date filtering.
- Price filtering.
- Sorting.
- Grid/list display.
- Map view.

## 8.6 Item Details Screen

Display:
- Image carousel.
- Item information.
- Lender information.
- Availability.
- Borrowing terms.
- Location.
- Reviews.

Actions:
- Request Item.
- Save Item.
- Share Item.

## 8.7 Listing Creation

Steps:

1. Add item images.
2. Enter item details.
3. Select category.
4. Set condition.
5. Set borrowing terms.
6. Select availability.
7. Set approximate location.
8. Preview listing.
9. Publish.

## 8.8 Activity Screen

Sections:
- Borrowing Requests.
- Lending Requests.
- Active Borrowings.
- Upcoming Returns.
- Completed Transactions.

## 8.9 Saved Items

Users can:
- View saved items.
- Remove saved items.
- Open item details.
- Request an item.

## 8.10 Profile Screen

Display:
- User profile.
- Rating.
- Listings.
- Borrowing history.
- Lending history.
- Settings.
- Help and support.
- Logout.

## 8.11 Native Features

- Camera integration.
- Photo library access.
- Location permissions.
- Push notifications.
- Deep links.
- Secure storage.
- Native share sheet.

---

# 9. CORE BORROWING WORKFLOW

This is the most important functionality of BorrowCircle.

The complete workflow must be consistent across website and mobile applications.

## 9.1 Step 1: Listing Creation

The lender creates a listing.

The listing becomes discoverable after validation and publication.

## 9.2 Step 2: Item Discovery

The borrower discovers the item through:
- Search.
- Categories.
- Nearby listings.
- Recommendations.
- Map view.

## 9.3 Step 3: Borrowing Request

The borrower selects:
- Start date.
- End date.
- Optional message.

The system validates:
- Listing availability.
- Date conflicts.
- Borrowing duration.
- Listing status.
- User eligibility.

The borrower submits the request.

Initial status:

PENDING

## 9.4 Step 4: Lender Decision

The lender receives a notification.

The lender can:
- Accept.
- Decline.

If declined:

DECLINED

If accepted:

ACCEPTED

The system must recheck availability before confirming acceptance.

## 9.5 Step 5: Digital Agreement

After acceptance, both users must review the borrowing terms.

Agreement should contain:
- Item information.
- Borrower information.
- Lender information.
- Start date.
- End date.
- Borrowing fee.
- Deposit, if applicable.
- Item condition.
- Responsibilities.
- Late return policy.
- Damage reporting process.

Both parties must acknowledge the agreement.

Store:
- Agreement version.
- Agreement content snapshot.
- Borrower acknowledgement timestamp.
- Lender acknowledgement timestamp.

The platform must not claim that a simple acknowledgement is equivalent to a legally certified electronic signature.

After both parties acknowledge:

READY_FOR_HANDOVER

## 9.6 Step 6: Handover

The parties arrange a handover.

The lender records the initial item condition.

The borrower reviews the condition and confirms receipt.

The system stores:
- Condition images.
- Notes.
- Timestamp.
- Submitted-by information.

Once receipt is confirmed:

ACTIVE

## 9.7 Step 7: Active Borrowing

The borrowing is now active.

The system tracks:
- Start date.
- Due date.
- Current status.
- Remaining duration.

The borrower can view the borrowing details.

The system sends reminders before the return deadline.

## 9.8 Step 8: Return Initiation

The borrower initiates return.

Status:

RETURN_INITIATED

The lender is notified.

## 9.9 Step 9: Return Verification

The lender inspects the item.

Both parties can submit return-condition evidence.

If there is no issue:

COMPLETED

If there is a disagreement:

DISPUTED

## 9.10 Step 10: Reviews

After successful completion, both parties can review each other.

Review fields:
- Rating.
- Optional comment.
- Transaction reference.

Reviews must only be permitted for completed transactions.

---

# 10. TRANSACTION STATUS MODEL

The borrowing system must use a clearly defined state machine.

Statuses:

PENDING
ACCEPTED
AWAITING_ACKNOWLEDGEMENT
READY_FOR_HANDOVER
ACTIVE
RETURN_INITIATED
OVERDUE
DISPUTED
COMPLETED
DECLINED
CANCELLED
EXPIRED

## 10.1 Allowed Transitions

PENDING:
- ACCEPTED
- DECLINED
- CANCELLED
- EXPIRED

ACCEPTED:
- AWAITING_ACKNOWLEDGEMENT
- CANCELLED

AWAITING_ACKNOWLEDGEMENT:
- READY_FOR_HANDOVER
- CANCELLED

READY_FOR_HANDOVER:
- ACTIVE
- CANCELLED

ACTIVE:
- RETURN_INITIATED
- OVERDUE
- DISPUTED

RETURN_INITIATED:
- COMPLETED
- DISPUTED
- OVERDUE

OVERDUE:
- RETURN_INITIATED
- DISPUTED
- COMPLETED

DISPUTED:
- COMPLETED
- Other administrator-resolved outcome

COMPLETED:
- No further transaction status changes.

DECLINED:
- Terminal state.

CANCELLED:
- Terminal state.

EXPIRED:
- Terminal state.

All transitions must be validated on the server.

The frontend must never independently decide transaction status.

---

# 11. LISTING REQUIREMENTS

## 11.1 Listing Fields

Each listing must contain:

- Unique listing ID.
- Owner ID.
- Title.
- Description.
- Category ID.
- Images.
- Item condition.
- Borrowing fee.
- Security deposit.
- Availability.
- Minimum duration.
- Maximum duration.
- Approximate latitude.
- Approximate longitude.
- General location label.
- Listing status.
- Created timestamp.
- Updated timestamp.

## 11.2 Item Categories

Initial categories:

1. Electronics.
2. Photography.
3. Tools and Hardware.
4. Books and Study Material.
5. Sports and Fitness.
6. Travel and Luggage.
7. Home Appliances.
8. Kitchen Equipment.
9. Events and Entertainment.
10. Gaming.
11. Furniture.
12. Miscellaneous.

Administrators should be able to manage categories.

## 11.3 Item Conditions

- New.
- Like New.
- Good.
- Fair.
- Heavily Used.

Condition descriptions should be visible to borrowers.

---

# 12. LOCATION AND DISCOVERY

Location is central to BorrowCircle.

## 12.1 Location Features

- Detect approximate user location.
- Allow manual location selection.
- Search within a selected radius.
- Display nearby listings.
- Support map-based discovery.
- Allow location updates.

## 12.2 Privacy

Public listings must not reveal exact home addresses.

Display approximate location only.

Exact handover details should only be shared with authorised parties after request acceptance and appropriate consent.

Users must be able to deny location permissions.

Manual location entry must be supported.

---

# 13. TRUST AND SAFETY

Trust is essential for a peer-to-peer borrowing platform.

## 13.1 User Verification

Initial requirements:
- Verified email.
- Verified phone number as a planned enhancement.
- Profile completion.

Future possibilities:
- Optional identity verification.
- Community or institution verification.

## 13.2 Ratings and Reviews

Users can rate each other after completed transactions.

Rating scale:
1 to 5 stars.

Review criteria:
- Communication.
- Item condition.
- Reliability.
- Timely return.

## 13.3 Reporting

Users can report:
- Inappropriate listings.
- Suspicious accounts.
- Misleading information.
- Harassment.
- Transaction issues.

## 13.4 Blocking

Users can block other users.

Blocked users should not be able to initiate new interactions that violate the blocking rules.

## 13.5 Disputes

A dispute can be raised for:
- Damaged items.
- Missing items.
- Late returns.
- Misrepresentation.
- Disagreement about condition.
- Other transaction issues.

Disputes must be associated with the relevant transaction.

Administrators can review and resolve disputes.

---

# 14. NOTIFICATION REQUIREMENTS

Notifications must be supported on both platforms.

## 14.1 In-App Notifications

Required events:
- New request.
- Request accepted.
- Request declined.
- Agreement acknowledgement required.
- Agreement completed.
- Handover reminder.
- Borrowing activated.
- Return reminder.
- Return initiated.
- Transaction completed.
- Overdue borrowing.
- Dispute update.
- New review.

## 14.2 Push Notifications

Mobile applications should receive push notifications for important events.

## 14.3 Email Notifications

Email notifications may be used for:
- Account verification.
- Password reset.
- Important transaction updates.
- Security-related alerts.

Users should be able to configure optional notification preferences.

---

# 15. SEARCH AND RECOMMENDATION REQUIREMENTS

## 15.1 Search

Search should support:
- Item names.
- Keywords.
- Categories.
- Descriptions.
- Location.

## 15.2 Filters

- Category.
- Distance.
- Availability.
- Date range.
- Borrowing fee.
- Rating.
- Item condition.

## 15.3 Recommendations

The initial recommendation system can use:
- Distance.
- Category interest.
- Listing freshness.
- Availability.
- Popularity.

Advanced personalised recommendations can be introduced later.

---

# 16. PAYMENTS AND MONETISATION

Payments are not required for the initial MVP unless explicitly enabled for the pilot.

The platform should support optional financial fields.

Potential models:
- Free borrowing.
- Optional lending fee.
- Refundable security deposit.
- Platform service fee.
- Premium community features.

If payments are introduced, requirements include:
- Payment gateway integration.
- Payment status tracking.
- Refund handling.
- Deposit management.
- Transaction records.
- Payment dispute handling.

No payment should be assumed successful based only on a frontend response.

Payment status must be verified by the backend using trusted gateway confirmation.

---

# 17. ADMINISTRATION

Administrators must have access to a protected admin dashboard.

Features:

## 17.1 User Management
- Search users.
- View account information.
- Suspend accounts.
- Reactivate accounts.
- Review reported users.

## 17.2 Listing Management
- View listings.
- Remove inappropriate listings.
- Review reported listings.
- Manage categories.

## 17.3 Transaction Management
- View borrowing requests.
- Review transaction history.
- Investigate disputes.
- Record administrative decisions.

## 17.4 Analytics
- Total users.
- Active users.
- Active listings.
- Borrowing requests.
- Completed borrowings.
- Dispute rate.

## 17.5 Audit Logs

Important administrative actions must be recorded.

---

# 18. DESIGN AND USER EXPERIENCE REQUIREMENTS

## 18.1 Design Direction

BorrowCircle should feel:

- Modern.
- Minimal.
- Trustworthy.
- Friendly.
- Community-focused.
- Professional.
- Easy to navigate.

Avoid an overly corporate or complicated interface.

## 18.2 Visual Identity

Suggested colour palette:

Primary:
Deep Navy / Blue

Secondary:
Teal / Green

Background:
Off-white / Light Neutral

Surface:
White

Text:
Dark Charcoal

Supporting:
Muted Grey

Use consistent design tokens across web and mobile.

## 18.3 Typography

Recommended:
- Inter for web.
- Platform-native system typography for mobile where appropriate.

## 18.4 Components

Reusable components should include:
- Navigation bar.
- Bottom navigation.
- Search bar.
- Item card.
- Category card.
- Profile card.
- Rating component.
- Availability calendar.
- Date selector.
- Filter panel.
- Modal.
- Confirmation dialog.
- Notification item.
- Status badge.
- Empty state.
- Loading state.
- Error state.
- Image uploader.

## 18.5 Responsive Design

Website must adapt to:
- Large desktop.
- Standard desktop.
- Tablet.
- Mobile.

Mobile application layouts must follow native platform conventions.

## 18.6 Accessibility

Requirements:
- Adequate colour contrast.
- Readable typography.
- Accessible form labels.
- Screen reader support.
- Keyboard navigation on web.
- Clear error messages.
- Touch-friendly controls.
- Accessible modal behaviour.

## 18.7 UI Quality

The interface should not look like a generic dashboard template.

Prioritise:
- Clear visual hierarchy.
- Consistent spacing.
- Thoughtful typography.
- High-quality item imagery.
- Useful empty states.
- Consistent interactions.
- Clear loading and error feedback.

Use the following design references during implementation:

1. https://github.com/jakubkrehel/skills
2. https://github.com/bergside/awesome-design-skills

These repositories can help guide:
- UI review.
- Visual consistency.
- Typography.
- Colour systems.
- Accessibility.
- Layout decisions.
- Interface quality.

Their skills should be reviewed and applied selectively rather than blindly copying a design.

---

# 19. NON-FUNCTIONAL REQUIREMENTS

## 19.1 Performance

- Fast initial page loading.
- Optimised images.
- Lazy loading where appropriate.
- Efficient database queries.
- Pagination for listings.
- Minimal unnecessary network requests.

## 19.2 Scalability

Architecture should support:
- Increasing user counts.
- More listings.
- More concurrent requests.
- Additional communities.
- Future payment integration.

## 19.3 Reliability

- Consistent transaction states.
- Reliable notifications.
- Database backups.
- Error monitoring.
- Graceful failure handling.

## 19.4 Security

- Secure authentication.
- Server-side authorisation.
- Input validation.
- Rate limiting.
- Secure image uploads.
- Protected administrative routes.
- Privacy-aware location handling.
- Audit logging.

## 19.5 Maintainability

- Modular architecture.
- Reusable components.
- Shared TypeScript types.
- Documented APIs.
- Automated tests.
- Consistent coding standards.

---

# 20. TECHNICAL DIRECTION

The product will use the following recommended technology stack.

## 20.1 Web

- Next.js.
- TypeScript.
- Tailwind CSS.

## 20.2 Mobile

- React Native.
- Expo.
- TypeScript.
- Expo Router.

## 20.3 Backend

- Shared REST API.
- Next.js Route Handlers initially.
- Versioned API under /api/v1.

## 20.4 Database

- PostgreSQL.
- Prisma ORM.

## 20.5 Authentication

- Supabase Auth.

## 20.6 Storage

- Cloudinary or S3-compatible object storage.

## 20.7 Maps

- Google Maps or OpenStreetMap-based provider.

## 20.8 Notifications

- Expo Push Notifications.
- Email provider.
- In-app notifications.

## 20.9 Deployment

- Vercel for web and initial backend deployment.
- Managed PostgreSQL.
- Expo EAS for mobile builds.

The implementation team may revise individual providers while maintaining the shared architecture and functional requirements.

---

# 21. HIGH-LEVEL DATA ENTITIES

The system should support the following entities:

1. Users
2. Items
3. ItemImages
4. Categories
5. Availability
6. BorrowRequests
7. Agreements
8. ConditionReports
9. ConditionImages
10. Reviews
11. Notifications
12. SavedItems
13. UserReports
14. AuditEvents

Detailed database fields, relationships, constraints and indexes will be defined in the Technical Requirements Document.

---

# 22. API REQUIREMENTS

Both applications must communicate through the same backend API.

Expected API groups:

Authentication:
- Registration.
- Login.
- Logout.
- Session validation.
- Password reset.

Users:
- Get profile.
- Update profile.
- Search users.
- Block user.
- Report user.

Items:
- Create listing.
- Update listing.
- Delete listing.
- Get listing.
- Search listings.
- Filter listings.
- Save listing.

Borrowing:
- Create request.
- Get requests.
- Accept request.
- Decline request.
- Cancel request.
- Get transaction details.

Agreements:
- Get agreement.
- Acknowledge agreement.

Condition:
- Submit handover condition.
- Confirm item receipt.
- Submit return condition.
- Confirm return.

Reviews:
- Create review.
- Get reviews.

Notifications:
- Get notifications.
- Mark as read.

Administration:
- Manage users.
- Manage listings.
- Review reports.
- Resolve disputes.

All APIs must validate authentication, permissions, input data and transaction state.

---

# 23. BUSINESS RULES

1. A user cannot borrow their own listing.
2. Only the listing owner can accept or decline a request.
3. Only authenticated users can request items.
4. A request must contain valid borrowing dates.
5. Borrowing duration must follow listing rules.
6. Overlapping confirmed reservations must not be allowed.
7. Availability must be rechecked on the server before acceptance.
8. A request cannot be accepted if the listing is no longer available.
9. Both parties must acknowledge the agreement before handover.
10. Handover must be documented.
11. Return must be documented.
12. Reviews are allowed only after completion.
13. A user cannot review the same transaction repeatedly.
14. Public listings must not reveal exact home addresses.
15. All important transaction changes must be recorded.
16. Users cannot perform actions outside their permissions.
17. Transaction state changes must be validated server-side.
18. Concurrent acceptance attempts must be handled safely.
19. A dispute must be associated with a valid transaction.
20. Administrative actions must be logged.

---

# 24. MVP SCOPE

The first release should focus on the essential borrowing experience.

## 24.1 Must Have

- User registration and login.
- User profiles.
- Item listing creation.
- Item image uploads.
- Item discovery.
- Search and filtering.
- Approximate location.
- Borrowing requests.
- Request acceptance and rejection.
- Digital agreement acknowledgement.
- Handover condition documentation.
- Active borrowing tracking.
- Return confirmation.
- Notifications.
- Reviews and ratings.
- Responsive website.
- Android application.
- iOS application.
- Shared backend.
- Admin moderation.

## 24.2 Should Have

- Map-based discovery.
- Saved listings.
- Advanced availability calendar.
- Push notifications.
- User blocking.
- User reporting.
- Dispute management.
- Community verification.

## 24.3 Could Have

- Payment gateway.
- Refundable deposits.
- Premium memberships.
- Community groups.
- Personalised recommendations.
- Referral programme.
- Lending analytics.
- In-app chat.

## 24.4 Out of Scope for Initial MVP

- Automated delivery services.
- Nationwide logistics.
- Complex insurance integrations.
- AI-powered item valuation.
- Fully automated identity verification.
- Advanced dynamic pricing.
- International expansion.

---

# 25. DEVELOPMENT PHASES

## Phase 1: Foundation

- Project setup.
- Monorepo setup.
- Design system.
- Database setup.
- Shared API structure.
- Authentication.

## Phase 2: User and Listing Management

- User profiles.
- Listing creation.
- Image upload.
- Listing management.
- Categories.

## Phase 3: Discovery

- Search.
- Filters.
- Sorting.
- Nearby listings.
- Map integration.

## Phase 4: Borrowing System

- Borrowing requests.
- Request management.
- Availability validation.
- Transaction state machine.

## Phase 5: Agreements and Handover

- Agreement generation.
- Acknowledgement.
- Condition reports.
- Handover confirmation.

## Phase 6: Return and Reputation

- Return initiation.
- Return confirmation.
- Overdue handling.
- Dispute workflow.
- Reviews.

## Phase 7: Notifications and Administration

- In-app notifications.
- Push notifications.
- Email notifications.
- Admin dashboard.
- Moderation tools.

## Phase 8: Cross-Platform Integration

- Website integration.
- Android integration.
- iOS integration.
- Shared API verification.
- End-to-end testing.

## Phase 9: Release

- Security testing.
- Performance testing.
- Bug fixing.
- Production deployment.
- Mobile builds.
- Pilot launch.

---

# 26. TESTING REQUIREMENTS

## 26.1 Functional Testing

Verify:
- Registration.
- Login.
- Listing creation.
- Search.
- Filters.
- Borrowing requests.
- Request acceptance.
- Agreement acknowledgement.
- Handover.
- Return.
- Reviews.

## 26.2 Cross-Platform Testing

A user must be able to:

1. Create a listing on the website.
2. Discover it on mobile.
3. Request it from mobile.
4. Accept the request on the website.
5. Complete the agreement on either platform.
6. Track the borrowing on both platforms.
7. Complete the return.
8. View the final transaction on both platforms.

All changes must remain synchronised.

## 26.3 Security Testing

Test:
- Unauthorised access.
- Ownership validation.
- Invalid transaction transitions.
- Malicious input.
- File upload restrictions.
- Location privacy.
- Rate limiting.
- Privilege escalation.

## 26.4 Performance Testing

Test:
- Search performance.
- Listing pagination.
- Image loading.
- API response times.
- Concurrent borrowing requests.

---

# 27. ACCEPTANCE CRITERIA

The product is ready for its initial release when:

1. Users can register and log in.
2. Users can create and manage listings.
3. Users can discover nearby items.
4. Users can submit borrowing requests.
5. Lenders can accept or decline requests.
6. Conflicting reservations cannot be confirmed.
7. Both parties can acknowledge borrowing terms.
8. Handover condition can be recorded.
9. Borrowing status can be tracked.
10. Return can be initiated and confirmed.
11. Completed transactions support reviews.
12. Users receive important notifications.
13. Admins can moderate users and listings.
14. Location privacy is maintained.
15. Website and mobile app use the same backend.
16. Core workflows work across both platforms.
17. Transaction state changes are validated by the server.
18. Critical user actions have appropriate error handling.

---

# 28. ASSUMPTIONS AND OPEN DECISIONS

The following decisions must be finalised before production launch:

- Initial launch city or community.
- Whether borrowing is free by default.
- Whether lenders can charge fees.
- Whether deposits are supported.
- Whether identity verification is mandatory.
- Whether chat is included in MVP.
- Which map provider will be used.
- Which image storage provider will be used.
- Which email provider will be used.
- Whether community groups are included.
- Applicable legal terms and liability policies.

Until these decisions are confirmed, implementation should use configurable settings rather than hard-coded assumptions.

---

# 29. FINAL PRODUCT PRINCIPLE

BorrowCircle is not simply another marketplace.

It is a community-first platform built around access, trust and sharing.

Every feature should support the central idea:

"Why buy something you only need once, when someone nearby already has it?"

The experience should make borrowing feel:
- Easy.
- Safe.
- Transparent.
- Local.
- Reliable.

The website and mobile application must work as two interfaces to the same BorrowCircle ecosystem.

END OF DOCUMENT