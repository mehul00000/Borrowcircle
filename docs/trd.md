# BORROWCIRCLE
# TECHNICAL REQUIREMENTS DOCUMENT (TRD)

Version: 1.0
Document Type: Technical Requirements Document
Product: BorrowCircle
Architecture: Cross-Platform Shared Backend
Platforms: Web, Android and iOS
Status: Technical Specification

============================================================
1. INTRODUCTION
============================================================

1.1 Purpose

This document defines the technical architecture, implementation
requirements, technology stack, database structure, API design,
security requirements and deployment strategy for BorrowCircle.

BorrowCircle is a hyperlocal peer-to-peer borrowing and lending
platform.

The platform will consist of:

1. Responsive web application.
2. Android mobile application.
3. iOS mobile application.
4. Shared backend API.
5. Central PostgreSQL database.
6. Shared authentication system.
7. Common business logic and transaction engine.

All platforms must communicate with the same backend.

The website and mobile application must never maintain separate
business rules or independent transaction records.

1.2 Architectural Principle

ONE PRODUCT
ONE BACKEND
ONE DATABASE
MULTIPLE CLIENT APPLICATIONS

The web and mobile applications are independent frontend clients
that consume the same versioned API.

1.3 Primary Technical Objectives

- Maintain consistent behaviour across platforms.
- Build a scalable and maintainable architecture.
- Protect user and transaction information.
- Support reliable borrowing workflows.
- Prevent conflicting reservations.
- Maintain accurate availability.
- Provide secure image storage.
- Support location-based discovery.
- Enable future payment integration.
- Allow independent deployment of web and mobile clients.


============================================================
2. TECHNOLOGY STACK
============================================================

2.1 Web Application

Framework:
Next.js

Language:
TypeScript

Routing:
Next.js App Router

Styling:
Tailwind CSS

UI:
Reusable React components

Forms:
React Hook Form

Schema Validation:
Zod

Data Fetching:
TanStack Query or equivalent

Responsibilities:

- Landing page.
- User authentication interface.
- Item discovery.
- Item details.
- Listing creation.
- User dashboard.
- Borrowing management.
- Agreement acknowledgement.
- Condition documentation.
- Notifications.
- Profile management.
- Admin dashboard.

2.2 Mobile Application

Framework:
React Native

Platform:
Expo

Language:
TypeScript

Routing:
Expo Router

UI:
Reusable native components

Forms:
React Hook Form

Validation:
Zod

Server State:
TanStack Query

Secure Storage:
Expo SecureStore

Notifications:
Expo Notifications

Camera and Images:
Expo Image Picker / Camera

Location:
Expo Location

Responsibilities:

- Mobile onboarding.
- Authentication.
- Item discovery.
- Item listing.
- Image uploads.
- Borrowing requests.
- Agreement acknowledgement.
- Handover and return.
- Push notifications.
- User profiles.
- Saved items.
- Activity management.

2.3 Backend

Initial Architecture:
Next.js Route Handlers

API Style:
REST API

API Version:
v1

Base Path:
/api/v1

Language:
TypeScript

Validation:
Zod

ORM:
Prisma

The backend should be organised into independent modules.

Suggested modules:

- Authentication
- Users
- Items
- Categories
- Search
- Availability
- Borrow Requests
- Agreements
- Condition Reports
- Reviews
- Notifications
- Reports
- Administration

Business logic must be implemented in reusable server-side
services rather than directly inside API route handlers.

2.4 Database

Database:
PostgreSQL

ORM:
Prisma

Requirements:

- Relational data modelling.
- Foreign key constraints.
- Database indexes.
- Transactions.
- Unique constraints.
- Safe concurrent updates.
- Automated backups.

2.5 Authentication

Provider:
Supabase Auth

Authentication methods:

- Email and password.
- Email verification.
- Password reset.
- Optional OAuth providers.

The backend must verify access tokens before allowing protected
operations.

The database must maintain a reliable relationship between
Supabase authentication identities and BorrowCircle user records.

2.6 Image Storage

Recommended options:

- Cloudinary.
- Amazon S3.
- Compatible object storage.

Images must not be stored directly inside PostgreSQL.

Use storage keys and metadata in the database.

Support:

- Listing images.
- Profile images.
- Handover condition images.
- Return condition images.

Condition evidence should use access-controlled storage.

2.7 Maps and Location

Recommended providers:

- Google Maps Platform.
- OpenStreetMap-based services.

Requirements:

- Location search.
- Approximate user location.
- Distance calculation.
- Nearby item discovery.
- Map display.
- Manual location selection.

2.8 Notifications

Mobile:
Expo Push Notifications.

Email:
Transactional email provider.

In-app:
PostgreSQL-backed notifications.

2.9 Deployment

Web and initial backend:
Vercel.

Database:
Managed PostgreSQL.

Mobile:
Expo EAS Build and EAS Submit.

Image Storage:
Cloudinary or S3-compatible service.

Monitoring:
Error monitoring and application logs.


============================================================
3. SYSTEM ARCHITECTURE
============================================================

3.1 High-Level Architecture

WEB APPLICATION
       |
       |
       v
SHARED REST API
       ^
       |
       |
MOBILE APPLICATION
       |
       |
       v
AUTHENTICATION AND API CLIENT
       |
       v
BACKEND SERVICE LAYER
       |
       +----------------------+
       |                      |
       v                      v
POSTGRESQL DATABASE      OBJECT STORAGE
       |
       |
       v
BACKGROUND JOBS
       |
       +----------------------+
       |          |           |
       v          v           v
    EMAIL      PUSH       REMINDERS
              ALERTS

3.2 Architectural Rules

1. Web and mobile must use the same API.
2. No direct database access from frontend applications.
3. All business logic must execute on the backend.
4. All transaction state changes must be validated server-side.
5. All sensitive operations must require authentication.
6. User permissions must be checked on the backend.
7. External service credentials must remain server-side.
8. Both clients must consume shared API contracts.
9. All database changes must use controlled migrations.

3.3 Modular Backend Architecture

The backend should follow a layered architecture:

API ROUTE
    |
    v
AUTHENTICATION MIDDLEWARE
    |
    v
REQUEST VALIDATION
    |
    v
SERVICE LAYER
    |
    v
REPOSITORY / DATABASE ACCESS
    |
    v
POSTGRESQL

Responsibilities:

API Route:
Receives HTTP requests and returns responses.

Authentication:
Validates user identity and permissions.

Validation:
Validates request parameters and payloads.

Service Layer:
Contains application business rules.

Repository:
Handles database queries.

Database:
Stores persistent application data.

3.4 Shared Business Logic

The following logic must not be duplicated between web and mobile:

- Borrowing request validation.
- Availability checking.
- Transaction state transitions.
- Agreement acknowledgement.
- Return confirmation.
- Review eligibility.
- User permissions.

The backend is the authoritative source for these operations.


============================================================
4. MONOREPO PROJECT STRUCTURE
============================================================

Use a monorepo to maintain both applications and shared packages.

Recommended structure:

borrowcircle/
|
|-- apps/
|   |
|   |-- web/
|   |   |-- app/
|   |   |   |-- (public)/
|   |   |   |-- (auth)/
|   |   |   |-- (dashboard)/
|   |   |   |-- discover/
|   |   |   |-- items/
|   |   |   |-- requests/
|   |   |   |-- borrowings/
|   |   |   |-- notifications/
|   |   |   |-- profile/
|   |   |   |-- settings/
|   |   |   |-- admin/
|   |   |
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- public/
|   |   |-- tests/
|   |   |-- next.config.ts
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |
|   |-- mobile/
|       |-- app/
|       |   |-- (auth)/
|       |   |-- (tabs)/
|       |   |-- items/
|       |   |-- requests/
|       |   |-- borrowings/
|       |   |-- notifications/
|       |   |-- profile/
|       |
|       |-- components/
|       |-- hooks/
|       |-- services/
|       |-- constants/
|       |-- assets/
|       |-- utils/
|       |-- package.json
|       |-- app.json
|       |-- tsconfig.json
|
|-- packages/
|   |
|   |-- api-client/
|   |-- contracts/
|   |-- domain/
|   |-- validation/
|   |-- design-tokens/
|   |-- config/
|
|-- prisma/
|   |-- schema.prisma
|   |-- migrations/
|   |-- seed.ts
|
|-- docs/
|   |-- PRD.md
|   |-- TRD.md
|   |-- DESIGN_SYSTEM.md
|   |-- API.md
|   |-- DATABASE.md
|
|-- tests/
|   |-- integration/
|   |-- e2e/
|   |-- fixtures/
|
|-- .env.example
|-- package.json
|-- pnpm-workspace.yaml
|-- turbo.json
|-- README.md

3.5 Shared Packages

packages/api-client:
Typed API client used by web and mobile.

packages/contracts:
Shared request and response TypeScript contracts.

packages/domain:
Shared domain types and enums.

packages/validation:
Reusable Zod schemas.

packages/design-tokens:
Shared colours, spacing, typography and design tokens.

packages/config:
Shared TypeScript, ESLint and project configuration.

3.6 Package Management

Recommended:

- pnpm.
- Turborepo.

The repository should use consistent dependency versions and
shared development scripts.


============================================================
5. ENVIRONMENT CONFIGURATION
============================================================

Create separate environments:

- Development.
- Testing.
- Staging.
- Production.

Example environment variables:

DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAPS_API_KEY=

EXPO_PUBLIC_API_URL=
NEXT_PUBLIC_API_URL=

EMAIL_PROVIDER_API_KEY=

EXPO_ACCESS_TOKEN=

Important:

1. Never expose database credentials.
2. Never expose Supabase service role keys.
3. Never expose Cloudinary secrets.
4. Never expose private API keys in mobile builds.
5. Public environment variables must contain only safe values.
6. Production secrets must be managed through deployment
   environment configuration.


============================================================
6. DATABASE DESIGN
============================================================

Database:
PostgreSQL

ORM:
Prisma

The following tables form the initial data model.

6.1 USERS

Purpose:
Stores BorrowCircle user profiles.

Fields:

id                  UUID PRIMARY KEY
auth_user_id        UUID UNIQUE
full_name           VARCHAR(150)
username            VARCHAR(50) UNIQUE
email               VARCHAR(255)
phone               VARCHAR(20) NULL
bio                 TEXT NULL
avatar_url          TEXT NULL
city                VARCHAR(100) NULL
locality            VARCHAR(150) NULL
latitude            DECIMAL NULL
longitude           DECIMAL NULL
is_verified         BOOLEAN DEFAULT FALSE
is_suspended        BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP

Notes:

- auth_user_id references the authentication provider identity.
- Email must remain consistent with the authentication account.
- Exact location must not be publicly exposed.
- Sensitive account information must be protected.

6.2 CATEGORIES

Purpose:
Stores listing categories.

Fields:

id                  UUID PRIMARY KEY
name                VARCHAR(100) UNIQUE
slug                VARCHAR(120) UNIQUE
description         TEXT NULL
icon                VARCHAR(100) NULL
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP

6.3 ITEMS

Purpose:
Stores item listings.

Fields:

id                  UUID PRIMARY KEY
owner_id            UUID REFERENCES USERS(id)
category_id         UUID REFERENCES CATEGORIES(id)
title               VARCHAR(200)
description         TEXT
condition           VARCHAR(30)
borrowing_fee       DECIMAL DEFAULT 0
security_deposit    DECIMAL DEFAULT 0
minimum_days        INTEGER DEFAULT 1
maximum_days        INTEGER
latitude            DECIMAL NULL
longitude           DECIMAL NULL
location_label      VARCHAR(200) NULL
status              VARCHAR(30)
created_at          TIMESTAMP
updated_at          TIMESTAMP

Listing status:

DRAFT
ACTIVE
PAUSED
UNAVAILABLE
REMOVED

6.4 ITEM_IMAGES

Purpose:
Stores listing image references.

Fields:

id                  UUID PRIMARY KEY
item_id             UUID REFERENCES ITEMS(id)
storage_key         TEXT
image_url           TEXT
display_order       INTEGER
created_at          TIMESTAMP

6.5 AVAILABILITY

Purpose:
Stores item availability periods.

Fields:

id                  UUID PRIMARY KEY
item_id             UUID REFERENCES ITEMS(id)
start_date          DATE
end_date            DATE
is_available        BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP

Availability must be checked against confirmed borrowing
requests before a request can be accepted.

6.6 BORROW_REQUESTS

Purpose:
Stores borrowing requests and transaction information.

Fields:

id                  UUID PRIMARY KEY
item_id             UUID REFERENCES ITEMS(id)
borrower_id         UUID REFERENCES USERS(id)
lender_id           UUID REFERENCES USERS(id)
start_date          DATE
end_date            DATE
message             TEXT NULL
borrowing_fee       DECIMAL
security_deposit    DECIMAL
status              VARCHAR(50)
created_at          TIMESTAMP
updated_at          TIMESTAMP

The agreed fee and deposit must be stored as transaction
snapshots so that later listing edits do not change existing
transactions.

6.7 AGREEMENTS

Purpose:
Stores the borrowing agreement snapshot and acknowledgement.

Fields:

id                  UUID PRIMARY KEY
borrow_request_id   UUID UNIQUE REFERENCES BORROW_REQUESTS(id)
version             INTEGER
agreement_content   JSONB
borrower_accepted_at TIMESTAMP NULL
lender_accepted_at  TIMESTAMP NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

The agreement content must remain immutable after finalisation.

If terms change, create a new version and require both parties
to acknowledge it again.

6.8 CONDITION_REPORTS

Purpose:
Stores handover and return condition reports.

Fields:

id                  UUID PRIMARY KEY
borrow_request_id   UUID REFERENCES BORROW_REQUESTS(id)
submitted_by        UUID REFERENCES USERS(id)
report_type         VARCHAR(30)
notes               TEXT NULL
created_at          TIMESTAMP

report_type:

HANDOVER
RETURN

6.9 CONDITION_IMAGES

Purpose:
Stores evidence images for condition reports.

Fields:

id                  UUID PRIMARY KEY
condition_report_id UUID REFERENCES CONDITION_REPORTS(id)
storage_key         TEXT
created_at          TIMESTAMP

6.10 REVIEWS

Purpose:
Stores transaction reviews.

Fields:

id                  UUID PRIMARY KEY
borrow_request_id   UUID REFERENCES BORROW_REQUESTS(id)
reviewer_id         UUID REFERENCES USERS(id)
reviewee_id         UUID REFERENCES USERS(id)
rating              INTEGER
comment             TEXT NULL
created_at          TIMESTAMP

Constraints:

- Rating must be between 1 and 5.
- Only completed transactions can be reviewed.
- A reviewer can review a given transaction only once.

6.11 NOTIFICATIONS

Purpose:
Stores user notifications.

Fields:

id                  UUID PRIMARY KEY
user_id             UUID REFERENCES USERS(id)
type                VARCHAR(100)
title               VARCHAR(200)
message             TEXT
reference_id        UUID NULL
is_read             BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP

6.12 SAVED_ITEMS

Purpose:
Stores users' saved listings.

Fields:

id                  UUID PRIMARY KEY
user_id             UUID REFERENCES USERS(id)
item_id             UUID REFERENCES ITEMS(id)
created_at          TIMESTAMP

Unique constraint:

(user_id, item_id)

6.13 USER_REPORTS

Purpose:
Stores user and listing reports.

Fields:

id                  UUID PRIMARY KEY
reporter_id         UUID REFERENCES USERS(id)
reported_user_id    UUID NULL REFERENCES USERS(id)
reported_item_id    UUID NULL REFERENCES ITEMS(id)
reason              VARCHAR(100)
description         TEXT NULL
status              VARCHAR(30)
created_at          TIMESTAMP
updated_at          TIMESTAMP

6.14 AUDIT_EVENTS

Purpose:
Records important application and administrative events.

Fields:

id                  UUID PRIMARY KEY
actor_id            UUID NULL REFERENCES USERS(id)
event_type          VARCHAR(100)
entity_type         VARCHAR(100)
entity_id           UUID NULL
metadata            JSONB
created_at          TIMESTAMP

Sensitive information must not be unnecessarily copied into
audit metadata.

6.15 ADDITIONAL TABLES

The architecture should support adding:

- UserBlocks.
- UserDevices.
- PushTokens.
- Disputes.
- PaymentTransactions.
- Refunds.
- CommunityGroups.
- CommunityMemberships.

These can be introduced as their corresponding features are
implemented.


============================================================
7. DATABASE RELATIONSHIPS
============================================================

USERS
 |
 +---- ITEMS
 |       |
 |       +---- ITEM_IMAGES
 |       |
 |       +---- AVAILABILITY
 |
 +---- BORROW_REQUESTS
         |
         +---- AGREEMENTS
         |
         +---- CONDITION_REPORTS
         |       |
         |       +---- CONDITION_IMAGES
         |
         +---- REVIEWS

USERS
 |
 +---- NOTIFICATIONS
 |
 +---- SAVED_ITEMS
 |
 +---- USER_REPORTS
 |
 +---- AUDIT_EVENTS

CATEGORIES
 |
 +---- ITEMS

Important database constraints:

1. One listing belongs to one owner.
2. One listing belongs to one category.
3. A borrowing request belongs to one listing.
4. A borrowing request has one borrower and one lender.
5. A borrower cannot borrow their own listing.
6. A borrowing request has one associated agreement record.
7. A transaction can have multiple condition reports.
8. A condition report can have multiple images.
9. Reviews must reference completed transactions.
10. Saved items must be unique per user and listing.

Use database indexes for:

- User email and username.
- Item owner.
- Item category.
- Item status.
- Item creation date.
- Item location.
- Borrow request status.
- Borrower ID.
- Lender ID.
- Transaction dates.
- Notification user ID and creation date.


============================================================
8. API ARCHITECTURE
============================================================

Base URL:

/api/v1

All endpoints must return consistent JSON responses.

8.1 Standard Success Response

{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}

8.2 Standard Error Response

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": []
  }
}

8.3 HTTP Status Codes

200 - Success
201 - Resource created
204 - Successful operation without response body
400 - Invalid request
401 - Unauthenticated
403 - Forbidden
404 - Resource not found
409 - State conflict or reservation conflict
422 - Validation failure
429 - Rate limit exceeded
500 - Internal server error

8.4 AUTHENTICATION APIs

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me

Authentication provider integration must be handled securely.

8.5 USER APIs

GET    /users/me
PATCH  /users/me
GET    /users/:userId
GET    /users/:userId/reviews
POST   /users/:userId/block
DELETE /users/:userId/block
POST   /users/:userId/report

8.6 CATEGORY APIs

GET /categories
GET /categories/:categoryId

8.7 ITEM APIs

POST   /items
GET    /items
GET    /items/:itemId
PATCH  /items/:itemId
DELETE /items/:itemId

GET    /items/nearby
GET    /items/search

POST   /items/:itemId/save
DELETE /items/:itemId/save

GET    /users/me/items

8.8 IMAGE UPLOAD APIs

POST /uploads/sign
POST /uploads/complete

Use signed upload URLs or provider-specific secure upload
mechanisms.

Validate:
- File type.
- File size.
- Upload ownership.
- Storage destination.
- Allowed image formats.

8.9 BORROW REQUEST APIs

POST /borrow-requests

GET /borrow-requests/sent

GET /borrow-requests/received

GET /borrow-requests/:requestId

POST /borrow-requests/:requestId/accept

POST /borrow-requests/:requestId/decline

POST /borrow-requests/:requestId/cancel

GET /borrowings

8.10 AGREEMENT APIs

GET  /borrow-requests/:requestId/agreement

POST /borrow-requests/:requestId/agreement/acknowledge

8.11 CONDITION REPORT APIs

POST /borrow-requests/:requestId/condition-reports

GET /borrow-requests/:requestId/condition-reports

8.12 HANDOVER AND RETURN APIs

POST /borrow-requests/:requestId/confirm-receipt

POST /borrow-requests/:requestId/initiate-return

POST /borrow-requests/:requestId/confirm-return

8.13 REVIEW APIs

POST /borrow-requests/:requestId/reviews

GET /borrow-requests/:requestId/reviews

8.14 NOTIFICATION APIs

GET  /notifications

PATCH /notifications/:notificationId/read

POST /notifications/read-all

8.15 ADMIN APIs

GET    /admin/users
PATCH  /admin/users/:userId/status

GET    /admin/items
PATCH  /admin/items/:itemId/status

GET    /admin/reports
PATCH  /admin/reports/:reportId

GET    /admin/disputes
PATCH  /admin/disputes/:disputeId

GET    /admin/analytics

All admin APIs require explicit administrative authorisation.


============================================================
9. BORROWING STATE MACHINE
============================================================

The borrowing lifecycle must be implemented as a centralised
server-side state machine.

9.1 Status Definitions

PENDING:
Request submitted and awaiting lender decision.

ACCEPTED:
Lender accepted the request.

AWAITING_ACKNOWLEDGEMENT:
Agreement created and awaiting both parties.

READY_FOR_HANDOVER:
Both parties acknowledged the agreement.

ACTIVE:
Borrower confirmed receipt of the item.

RETURN_INITIATED:
Borrower has initiated the return process.

OVERDUE:
The agreed return deadline has passed without completion.

DISPUTED:
A transaction issue requires investigation.

COMPLETED:
Return successfully confirmed.

DECLINED:
Lender declined the request.

CANCELLED:
Request or transaction cancelled through an allowed transition.

EXPIRED:
Request expired before acceptance or another defined
expiration condition.

9.2 Allowed Transitions

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
Terminal state.

DECLINED:
Terminal state.

CANCELLED:
Terminal state.

EXPIRED:
Terminal state.

9.3 State Transition Rules

- Only the lender can accept or decline a request.
- Only the borrower can initiate a return.
- Receipt must be confirmed by the borrower.
- Return confirmation must be authorised.
- Both parties must acknowledge agreement terms.
- Completed transactions cannot be reopened through normal APIs.
- All transitions must be recorded.
- Invalid transitions must return HTTP 409.
- Dispute resolution must follow an explicit administrative
  workflow.

9.4 Centralised Transition Service

Create a service:

BorrowingStateService

Responsibilities:

- Validate current status.
- Validate requested next status.
- Check actor permissions.
- Check transaction conditions.
- Execute database update.
- Record audit event.
- Trigger notification event.

Never allow a frontend client to directly update transaction
status fields.


============================================================
10. RESERVATION AND CONCURRENCY CONTROL
============================================================

This is a critical system requirement.

Two borrowers must not successfully reserve the same item for
overlapping dates.

10.1 Request Creation

When a borrower submits a request:

1. Validate the listing.
2. Validate listing ownership.
3. Validate borrower eligibility.
4. Validate start and end dates.
5. Validate borrowing duration.
6. Validate listing availability.
7. Create the pending request.

10.2 Acceptance

When the lender accepts:

1. Start a database transaction.
2. Lock or otherwise safely serialise access to the item.
3. Recheck listing availability.
4. Recheck overlapping confirmed reservations.
5. Validate request status.
6. Update transaction status.
7. Record acceptance.
8. Commit the transaction.

If another request has already reserved the same period:

Return:

HTTP 409

{
  "success": false,
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "The item is no longer available for these dates."
  }
}

10.3 Database-Level Protection

Where practical, use PostgreSQL range constraints or equivalent
database-level protections to prevent overlapping confirmed
reservations.

Use half-open date intervals where appropriate:

[start_date, end_date)

The exact definition of whether end_date is a return date or
last borrowing date must remain consistent across the product.

10.4 Pending Requests

Pending requests should not automatically block all other users
unless a reservation hold policy is deliberately introduced.

If a temporary hold is introduced, it must have an expiry time.

10.5 Idempotency

Important mutation endpoints should support idempotency keys
where duplicate submissions could cause problems.

Examples:
- Accept request.
- Create payment.
- Confirm receipt.
- Confirm return.

This prevents repeated network requests from creating
duplicate operations.


============================================================
11. AUTHENTICATION AND AUTHORISATION
============================================================

11.1 Authentication Flow

1. User logs in through Supabase Auth.
2. Authentication provider returns an access token.
3. Frontend stores the token using platform-appropriate storage.
4. Frontend sends the token with API requests.
5. Backend validates the token.
6. Backend resolves the BorrowCircle user record.
7. Backend checks permissions.
8. Backend processes the request.

11.2 Web Token Storage

Use secure, provider-recommended authentication practices.

Prefer secure cookie-based session handling where supported.

Avoid storing long-lived sensitive tokens in localStorage.

11.3 Mobile Token Storage

Use Expo SecureStore for sensitive authentication tokens.

Never store private credentials in ordinary application
preferences.

11.4 Authorisation Rules

Guest:
Public browsing only.

Member:
Own profile, own saved items, borrowing requests.

Lender:
Own listings and received requests.

Borrower:
Own sent requests and active borrowings.

Admin:
Administrative operations.

11.5 Ownership Checks

The backend must verify:

- Listing owner before editing or deleting.
- Request participants before viewing transaction details.
- Request lender before accepting or declining.
- Request borrower before initiating return.
- Transaction eligibility before submitting reviews.

Never rely on frontend route protection alone.


============================================================
12. LOCATION AND PRIVACY ARCHITECTURE
============================================================

12.1 Location Collection

Location may be obtained through:

- Device location permission.
- Manual location selection.
- Address or locality search.

12.2 Public Location

Public listings should display:

- Locality.
- General neighbourhood.
- Approximate distance.
- Approximate map location.

12.3 Private Location

Exact handover details must not be publicly available.

They may be shared with authorised transaction participants
when appropriate.

12.4 Distance Calculation

Use the Haversine formula or a database geospatial extension.

Haversine formula:

a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)

d = 2R × atan2(√a, √(1-a))

Where:

R = Earth's radius.
φ = Latitude.
λ = Longitude.

12.5 Search Radius

Allow configurable search radii.

Initial options may include:
- 1 km.
- 3 km.
- 5 km.
- 10 km.
- 25 km.

12.6 Permission Denial

If location access is denied:

- Continue application usage.
- Show manual location selection.
- Avoid blocking discovery.
- Do not repeatedly request permission without context.


============================================================
13. IMAGE UPLOAD ARCHITECTURE
============================================================

13.1 Upload Flow

1. Client requests an upload authorisation.
2. Backend validates the authenticated user.
3. Backend generates a signed upload URL.
4. Client uploads directly to storage.
5. Client confirms upload completion.
6. Backend validates the stored object.
7. Backend saves image metadata.
8. Image becomes available to the authorised feature.

13.2 Image Requirements

- JPEG.
- PNG.
- WebP where supported.

13.3 Validation

Validate:
- File size.
- MIME type.
- Actual file content where practical.
- Image dimensions.
- Upload ownership.

Do not trust a client-provided filename or MIME type alone.

13.4 Access Control

Listing images:
May be publicly accessible after publication.

Condition images:
Should use controlled access.

Profile images:
Should not expose private information.

13.5 Optimisation

- Resize large images.
- Generate thumbnails.
- Compress where appropriate.
- Use CDN delivery.
- Lazy-load listing images.


============================================================
14. NOTIFICATION ARCHITECTURE
============================================================

14.1 Notification Types

BORROW_REQUEST_RECEIVED
BORROW_REQUEST_ACCEPTED
BORROW_REQUEST_DECLINED
AGREEMENT_REQUIRED
AGREEMENT_COMPLETED
HANDOVER_REMINDER
BORROWING_STARTED
RETURN_REMINDER
RETURN_INITIATED
RETURN_COMPLETED
BORROWING_OVERDUE
DISPUTE_UPDATED
NEW_REVIEW

14.2 Notification Flow

Backend event
     |
     v
Notification service
     |
     +----------------+
     |                |
     v                v
Database         Push provider
     |
     v
In-app notification

Email may be sent for important account and transaction
events.

14.3 Reliability

- Notifications must not be duplicated unnecessarily.
- Failed delivery should be retried.
- Important events must remain stored in the database.
- Notification delivery must not determine transaction success.

14.4 Background Jobs

Use a background job mechanism for:

- Return reminders.
- Request expiration.
- Overdue detection.
- Email delivery.
- Push delivery.

For an initial deployment, a managed scheduler or queue service
may be used.

Jobs must be idempotent and safe to retry.


============================================================
15. FRONTEND ARCHITECTURE
============================================================

15.1 Web Application Structure

Organise the web application into:

app/
components/
features/
hooks/
lib/
services/
types/
styles/
tests/

Recommended feature modules:

features/auth
features/discover
features/items
features/borrow-requests
features/borrowings
features/agreements
features/notifications
features/profile
features/admin

15.2 Mobile Application Structure

Organise mobile features into:

app/
components/
features/
hooks/
services/
constants/
assets/
utils/
tests/

15.3 API Client

Both clients must use a shared typed API client package.

Responsibilities:

- API base URL configuration.
- Authentication headers.
- Request serialisation.
- Response parsing.
- Error handling.
- Token refresh handling.
- Retry policies where safe.
- Request cancellation.

15.4 Server State

Use TanStack Query or equivalent for:

- Item listings.
- Search results.
- User profiles.
- Borrowing requests.
- Notifications.
- Transaction details.

15.5 Local UI State

Use local component state or a lightweight state library
for temporary UI state.

Examples:

- Modal visibility.
- Selected filters.
- Form inputs.
- Active tab.
- Image preview.

Do not duplicate server-authoritative transaction state in
multiple independent stores.

15.6 Form Validation

Use shared Zod schemas where possible.

Validate on:
- Frontend for immediate feedback.
- Backend for security and correctness.


============================================================
16. UI AND DESIGN SYSTEM IMPLEMENTATION
============================================================

16.1 Design Tokens

Create shared design tokens for:

- Colours.
- Typography.
- Spacing.
- Border radius.
- Shadows.
- Component dimensions.
- Breakpoints.

16.2 Web and Mobile Consistency

The two applications should share:

- Brand identity.
- Colour palette.
- Component behaviour.
- Status colours.
- Form language.
- Icon conventions.
- Interaction principles.

The mobile UI may use native navigation and platform-specific
controls while preserving the same design language.

16.3 Design Quality References

Review:

https://github.com/jakubkrehel/skills

https://github.com/bergside/awesome-design-skills

Use these resources for:

- Interface quality review.
- Typography decisions.
- Colour selection.
- Accessibility.
- Layout quality.
- Component consistency.
- UX review.

Do not copy entire interfaces or introduce unnecessary
dependencies simply because a reference repository includes them.

16.4 UI States

Every important screen must support:

- Loading.
- Success.
- Empty.
- Error.
- Disabled.
- Offline or network failure where relevant.

16.5 Responsive Requirements

Web:
- Desktop.
- Tablet.
- Mobile browser.

Mobile:
- Android.
- iOS.
- Different screen sizes.
- Safe areas.
- Keyboard-aware forms.


============================================================
17. ERROR HANDLING
============================================================

17.1 Backend Errors

Use consistent error codes.

Examples:

UNAUTHENTICATED
FORBIDDEN
RESOURCE_NOT_FOUND
VALIDATION_ERROR
RESERVATION_CONFLICT
INVALID_TRANSACTION_STATE
UPLOAD_FAILED
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR

17.2 Frontend Behaviour

Display useful messages.

Do not expose:
- Database errors.
- Stack traces.
- Private server information.
- Authentication secrets.

17.3 Network Failures

Support:
- Retry for safe requests.
- Loading indicators.
- Request cancellation.
- Duplicate submission prevention.
- Clear offline messages.

Mutation retries must be idempotent or protected against
duplicate execution.


============================================================
18. SECURITY REQUIREMENTS
============================================================

18.1 General Security

- HTTPS in production.
- Secure authentication.
- Server-side authorisation.
- Input validation.
- Output sanitisation where appropriate.
- Rate limiting.
- Secure file uploads.
- Safe error messages.
- Dependency updates.
- Database backups.

18.2 API Security

Every protected endpoint must verify the authenticated user.

Validate:
- User identity.
- User status.
- Resource ownership.
- Transaction participation.
- Allowed operation.
- Input payload.

18.3 Database Security

- Use parameterised database operations through Prisma.
- Restrict database credentials.
- Use managed backups.
- Protect production database access.
- Apply migrations through controlled deployment steps.

18.4 Secrets

Never commit secrets to Git.

Maintain:

.env.example

Use separate secrets for development and production.

18.5 Location Security

Never expose exact home coordinates in public API responses.

Use approximate location data for discovery.

18.6 Abuse Prevention

Implement rate limits for:

- Login attempts.
- Registration.
- Password reset.
- Listing creation.
- Borrowing requests.
- Reporting.
- Image uploads.

18.7 Administrative Security

- Require admin authorisation.
- Log administrative actions.
- Restrict access to sensitive user data.
- Apply additional account protection where possible.


============================================================
19. PERFORMANCE REQUIREMENTS
============================================================

19.1 Web Performance

- Optimise images.
- Use appropriate caching.
- Lazy-load non-critical content.
- Avoid unnecessary client-side rendering.
- Paginate listing results.
- Reduce unnecessary API calls.

19.2 Mobile Performance

- Optimise image sizes.
- Avoid unnecessary re-renders.
- Use virtualised lists for large collections.
- Handle poor network conditions.
- Keep navigation responsive.

19.3 Database Performance

- Index frequently queried columns.
- Avoid N+1 query patterns.
- Use pagination.
- Limit selected fields.
- Monitor slow queries.
- Use connection pooling where required.

19.4 API Performance

Initial engineering targets:

- Typical read API response: under 500 ms.
- Typical mutation API response: under 800 ms.
- Search results: under 1 second for normal MVP workloads.

These are engineering targets, not guaranteed service levels.

Measure performance under realistic workloads.


============================================================
20. TESTING STRATEGY
============================================================

20.1 Unit Testing

Test:

- Validation schemas.
- Borrowing calculations.
- Availability checks.
- State transition rules.
- Permission checks.
- Review eligibility.
- Location calculations.

20.2 Integration Testing

Test:

- Authentication.
- Database operations.
- API endpoints.
- Listing management.
- Borrowing requests.
- Agreement acknowledgement.
- Condition reports.
- Notifications.

20.3 End-to-End Testing

Test complete workflows.

Scenario 1:

1. User A creates an account.
2. User A creates an item listing.
3. User B discovers the listing.
4. User B requests the item.
5. User A accepts the request.
6. Both acknowledge the agreement.
7. User B confirms receipt.
8. Borrowing becomes active.
9. User B initiates return.
10. User A confirms return.
11. Transaction becomes completed.
12. Both users can review each other.

Scenario 2:

Test overlapping borrowing requests.

Two borrowers request the same item for overlapping dates.

Verify that conflicting reservations cannot both be accepted.

Scenario 3:

Test cross-platform synchronisation.

1. Create listing on web.
2. Discover listing on mobile.
3. Submit request on mobile.
4. Accept request on web.
5. Verify updated status on mobile.
6. Complete the transaction on either platform.
7. Verify final status on both platforms.

20.4 Security Testing

Test:

- Unauthorised API access.
- Invalid JWT tokens.
- Cross-user data access.
- Listing ownership violations.
- Invalid state transitions.
- Malicious uploads.
- Privilege escalation.
- Location privacy.
- Rate limits.

20.5 Recommended Tools

- Vitest or Jest.
- React Testing Library.
- Playwright.
- Maestro or Detox.
- Postman or Bruno.


============================================================
21. CI/CD AND DEPLOYMENT
============================================================

21.1 Git Strategy

Recommended branches:

main
develop
feature/*
fix/*
release/*

21.2 Continuous Integration

For every pull request:

1. Install dependencies.
2. Run formatting checks.
3. Run linting.
4. Run TypeScript checks.
5. Run unit tests.
6. Run relevant integration tests.
7. Build affected applications.

21.3 Web Deployment

Deploy Next.js application to Vercel.

Use separate preview and production environments.

21.4 Database Deployment

- Use managed PostgreSQL.
- Run Prisma migrations.
- Back up production data.
- Test migrations before release.
- Avoid destructive schema changes without a migration plan.

21.5 Mobile Deployment

Use Expo EAS for:

- Development builds.
- Internal testing builds.
- Production Android builds.
- Production iOS builds.
- App submission.

21.6 Release Management

Every release should include:

- Version number.
- Release notes.
- Test results.
- Migration status.
- Known issues.


============================================================
22. MONITORING AND LOGGING
============================================================

Monitor:

- API response times.
- API error rates.
- Authentication failures.
- Database performance.
- Failed uploads.
- Notification delivery.
- Background job failures.
- Transaction conflicts.
- Mobile application crashes.

Maintain structured logs.

Do not log:
- Passwords.
- Access tokens.
- Private authentication credentials.
- Unnecessary personal information.

Use error monitoring to identify production issues.


============================================================
23. BACKUP AND RECOVERY
============================================================

Database:

- Automated backups.
- Point-in-time recovery where supported.
- Defined retention policy.
- Periodic recovery tests.

Images:

- Object storage backups or provider durability features.
- Controlled deletion.
- Storage metadata consistency.

Recovery:

- Document recovery procedures.
- Test restoration.
- Maintain environment configuration securely.

Define recovery point and recovery time objectives before
production launch.


============================================================
24. IMPLEMENTATION ROADMAP
============================================================

PHASE 1: PROJECT FOUNDATION

Tasks:
- Initialise monorepo.
- Configure pnpm.
- Configure Turborepo.
- Create Next.js application.
- Create Expo application.
- Configure TypeScript.
- Configure Tailwind.
- Configure shared packages.
- Set up Git workflow.
- Create environment files.

Deliverable:
Working web and mobile project skeletons.

PHASE 2: DATABASE AND AUTHENTICATION

Tasks:
- Configure PostgreSQL.
- Configure Prisma.
- Create initial schema.
- Configure Supabase Auth.
- Implement registration.
- Implement login.
- Implement logout.
- Implement protected routes.
- Implement user profile creation.

Deliverable:
Users can authenticate on both platforms.

PHASE 3: DESIGN SYSTEM

Tasks:
- Establish design tokens.
- Build shared visual guidelines.
- Build web navigation.
- Build mobile navigation.
- Create reusable UI components.
- Create loading and empty states.
- Implement responsive layouts.

Deliverable:
Consistent web and mobile interface foundations.

PHASE 4: LISTINGS

Tasks:
- Category management.
- Listing creation.
- Image uploads.
- Listing editing.
- Listing deletion.
- Availability management.
- Listing details.

Deliverable:
Users can publish and manage items.

PHASE 5: DISCOVERY

Tasks:
- Search API.
- Category filters.
- Distance filters.
- Sorting.
- Nearby listings.
- Map integration.
- Pagination.

Deliverable:
Users can discover nearby items.

PHASE 6: BORROWING ENGINE

Tasks:
- Borrowing request creation.
- Request management.
- Accept and decline operations.
- Reservation conflict protection.
- State transition service.
- Transaction history.

Deliverable:
Borrowing requests work reliably.

PHASE 7: AGREEMENTS AND CONDITION

Tasks:
- Agreement snapshots.
- Agreement acknowledgement.
- Handover condition reports.
- Condition image uploads.
- Receipt confirmation.

Deliverable:
Borrowing handover is documented.

PHASE 8: RETURN AND REPUTATION

Tasks:
- Return initiation.
- Return condition reports.
- Return confirmation.
- Overdue detection.
- Dispute workflow.
- Reviews and ratings.

Deliverable:
Complete borrowing lifecycle.

PHASE 9: NOTIFICATIONS AND ADMIN

Tasks:
- In-app notifications.
- Push notifications.
- Email notifications.
- Background jobs.
- Admin dashboard.
- Moderation.
- Reporting.

Deliverable:
Operational platform management.

PHASE 10: TESTING AND RELEASE

Tasks:
- Unit testing.
- Integration testing.
- End-to-end testing.
- Security testing.
- Performance testing.
- Production deployment.
- Android build.
- iOS build.
- Pilot launch.

Deliverable:
Production-ready MVP.


============================================================
25. TECHNICAL ACCEPTANCE CRITERIA
============================================================

The technical implementation is acceptable when:

1. Web and mobile use the same backend.
2. Both clients use shared API contracts.
3. Both clients use the same authentication system.
4. Database records remain synchronised.
5. Users can create and manage listings.
6. Users can search and discover items.
7. Borrowing requests work on both platforms.
8. Reservation conflicts are handled safely.
9. Transaction transitions are server-controlled.
10. Agreements are stored as snapshots.
11. Handover and return evidence can be recorded.
12. Reviews are restricted to completed transactions.
13. Important notifications are persisted.
14. Exact private locations are protected.
15. Admin endpoints are protected.
16. Database migrations are version controlled.
17. Automated tests cover critical business rules.
18. Production secrets are not exposed.
19. Errors are handled consistently.
20. The complete borrowing lifecycle works across web and mobile.


============================================================
26. FUTURE TECHNICAL EXTENSIONS
============================================================

The architecture should allow future development of:

- Payment gateway integration.
- Refundable security deposits.
- Automated refunds.
- In-app messaging.
- Community groups.
- University verification.
- Identity verification.
- Advanced recommendations.
- AI-powered listing assistance.
- Fraud detection.
- Lending analytics.
- Subscription plans.
- Community-based access controls.
- Delivery and logistics integrations.

These features should not unnecessarily complicate the MVP.

Build the initial architecture so that they can be added
without rewriting the core borrowing engine.


============================================================
27. FINAL ARCHITECTURAL PRINCIPLES
============================================================

BorrowCircle must follow these principles:

1. Shared backend for all platforms.
2. Single source of truth for transaction data.
3. Server-authoritative business logic.
4. Secure authentication and authorisation.
5. Database-enforced integrity.
6. Privacy-first location handling.
7. Modular and maintainable code.
8. Reusable UI and API contracts.
9. Reliable transaction state management.
10. Automated testing of critical workflows.
11. Incremental and controlled development.
12. Scalable architecture without premature complexity.

The web and mobile applications must behave as two interfaces
to the same BorrowCircle ecosystem.

The backend must remain the authority for all important
business operations.

END OF TECHNICAL REQUIREMENTS DOCUMENT