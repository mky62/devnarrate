BuildFund

Product Requirements Document

Developer Project Fundraising Platform

1. Product Overview

BuildFund is a developer-first crowdfunding platform that lets developers showcase what they are building, explain why it matters, and collect funds from supporters — all in a transparent and simple way. Unlike general-purpose fundraising tools, BuildFund is designed specifically for indie developers and open-source contributors who want to get paid for what they build.

The platform is inspired by the transparency model of Open Collective but keeps the architecture lightweight and India-friendly by integrating Razorpay as the primary payment processor — supporting UPI, credit/debit cards, and net banking out of the box.

2. Problem Statement

Developers building side projects, tools, or open-source software face a common challenge: they spend time and resources building things but have no easy way to get funded by the community that benefits from their work.

Existing solutions have shortcomings:

GitHub Sponsors is invite-only and not easily available in India.

Open Collective requires fiscal hosts, legal entities, and complex setup.

General crowdfunding platforms (Kickstarter, Indiegogo) are not tailored for developers.

Payment processors like Stripe have limited UPI support and are invite-only in India.

BuildFund solves this by combining a developer-focused content platform with simple Razorpay-powered fundraising campaigns — no legal entity required, no complex setup.

3. Goals & Non-Goals

3.1 Goals

Allow developers to create posts describing their projects and funding needs.

Enable a fundraising campaign per post with a clear target amount.

Accept payments via Razorpay (UPI, cards, net banking) with INR support.

Display real-time fundraising progress on each post.

Allow contributors to remain anonymous on the public page.

Provide creators with a private dashboard showing transactions and campaign status.

GitHub authentication via Better Auth for frictionless sign-up.

3.2 Non-Goals (MVP)

Recurring / subscription-based funding.

Multi-currency support (INR only for now).

Mobile app — web only for MVP.

Open Collective integration (deferred to a later phase).

Team accounts or organization-level campaigns.

4. User Personas

4.1 The Creator (Developer)

An Indian indie developer building a side project, tool, or open-source library.

Has a GitHub account and wants to showcase their work.

Needs funds to cover hosting, domains, APIs, or just their time.

Wants transparency — to show backers exactly what the money is for.

4.2 The Backer (Supporter)

A developer or tech enthusiast who wants to support projects they find valuable.

Prefers paying via UPI for speed and convenience.

May want to remain anonymous or be publicly credited.

Wants to see how their money will be used before contributing.

5. User Stories

5.1 Authentication

As a user, I can sign in with my GitHub account so that I don't need to create a new account.

As a user, I am redirected to my private dashboard after signing in.

5.2 Creating a Post

As a creator, I can write a post describing my project, what I am building, and what I need.

As a creator, I can connect my GitHub repository to a post.

As a creator, I can optionally enable a fundraising campaign when creating a post.

As a creator, I can set a funding target amount (in INR) for my campaign.

As a creator, I can publish the post so it is visible to all users.

5.3 Fundraising

As a backer, I can view a post and see the funding goal and current progress.

As a backer, I can click 'Fund this Project' and enter any amount I choose.

As a backer, I can pay via UPI, credit card, or net banking through Razorpay.

As a backer, I can choose to contribute anonymously.

As a backer, I receive confirmation after a successful payment.

5.4 Dashboard

As a creator, I can view all my posts and their campaign status from my dashboard.

As a creator, I can see a list of all contributors (with anonymous ones masked) and amounts.

As a creator, I can track how close I am to my funding target.

6. Feature Specifications

6.1 Authentication

Implemented via Better Auth with GitHub as the OAuth provider.

GitHub OAuth login and callback handling.

Session management with secure cookies.

Protected routes — dashboard and post creation require authentication.

Public routes — individual post pages are publicly accessible.

6.2 Posts

Each post is a rich content card that tells the story of a project.

6.3 Fundraising Campaigns

Each post can have one associated campaign. When a creator enables funding on a post, a campaign record is created automatically.

Campaign stores target amount, amount raised so far, and campaign status (active / completed / paused).

A progress bar on the post page shows percentage funded.

When the target amount is reached, the campaign status updates to 'Goal Reached' — contributions can still be accepted.

6.4 Payment Flow (Razorpay)

The payment flow follows these steps:

Backer clicks 'Fund this Project' on a post page.

A modal appears asking for the contribution amount and whether to stay anonymous.

Backend creates a Razorpay order via the Razorpay Orders API.

Frontend opens the Razorpay checkout modal with the order ID.

Backer completes payment via UPI / card / net banking.

Razorpay sends a webhook to the backend confirming payment.

Backend verifies the webhook signature, creates a transaction record, and updates the campaign's raised amount.

Backer sees a success confirmation. Post page updates in real time.

6.5 Anonymity

Contributors can opt to remain anonymous. Implementation details:

The transaction record stores the contributor's user ID (if logged in) or email, but also an isAnonymous flag.

On the public post page, anonymous contributors appear as 'Anonymous Supporter'.

On the creator's private dashboard, real contributor details are always visible for record-keeping.

Note: UPI transactions will still show the sender's name to the receiving bank account holder — this is a UPI regulatory requirement and cannot be hidden at the infrastructure level.

7. Data Model

7.1 Users

7.2 Posts

7.3 Campaigns

7.4 Transactions

8. Technical Stack

9. API Endpoints

10. Pages & Routes

11. MVP Scope & Phases

Phase 1 — Core (MVP)

GitHub OAuth via Better Auth.

Create, publish, and view posts.

Enable a fundraising campaign on a post with a target amount.

Razorpay payment integration (UPI + cards).

Webhook handler to confirm payments and update campaign totals.

Anonymity toggle for contributors.

Basic creator dashboard with campaign progress and transaction list.

Phase 2 — Polish

Real-time progress bar updates (WebSockets or polling).

Email notifications to creator on new contributions.

Share post via social links (Twitter, LinkedIn).

Rich text / Markdown editor for post content.

Post search and tag filtering on the home feed.

Phase 3 — Growth (Future)

Open Collective integration for transparency and expense management.

GitHub repository stats displayed on post (stars, forks, language).

Creator profile pages.

Recurring monthly contributions.

12. Success Metrics

For a portfolio/side project, success is defined as:

End-to-end payment flow works correctly with Razorpay in test mode.

A creator can go from sign-up to live campaign in under 5 minutes.

All major user stories from Section 5 are implemented and functional.

The app is deployed publicly and accessible via a live URL.

Code is well-structured, readable, and demonstrates architectural understanding.

13. Open Questions

Should unauthenticated users be able to contribute, or is a GitHub login required for backers too?

What happens to raised funds if a campaign is cancelled — refund policy?

Should there be a minimum contribution amount (e.g., ₹10)?

Will the platform take a platform fee on top of Razorpay's fee?

How to handle Razorpay KYC and settlement account setup for creators?

End of Document

