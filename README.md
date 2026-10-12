# Sati Tech IAC — Learning & Internship Platform

**Live demo:** https://satitech-iac.vercel.app  
**Repository:** https://github.com/satitech-admin/satitechiac

## Current visual system and delivery status\n- Premium **charcoal graphite / dark olive / copper-gold** theme (no white-and-blue background).\n- Responsive public About, course details, FAQ, internships, partners, forms, dashboards, and authentication-entry screens.\n- Public site: https://satitech-iac.vercel.app (Vercel Git-linked production build).\n- Static and runtime route smoke tests run through GitHub Actions on every push.\n\n## Current implementation
A responsive HTML/CSS/JavaScript prototype with public homepage, course catalog, program pricing, internship-interest registration, partner inquiries, certificate-verification placeholder, and interactive demo workspaces for Student, Intern, Trainer, Partner, and Admin.

## Program structure
- Learning + internship readiness: ₹1,999/month × 12 months
- Optional intensive project mentorship: ₹1,999/month × 3 months
- Applications, selection, and placement for host-company internships: **free**
- Partner acceptance, interviews, internships and third-party credentials are not guaranteed.

## Important demo limitations
All demo form records and progress entries are stored in the visitor's local browser only. No records are transmitted to a server. No payment, verified identity, real attendance, actual credential issuance, or live classroom session is processed. Existing sample openings are clearly labeled as samples. The dashboard role selector does **not** confer real permissions.

## Account integration preparation\n- `auth.js`: Login, signup, account page, optional Supabase JS integration; disabled until a dedicated Sati Tech IAC project is configured. The browser never stores demo passwords.\n- `auth-config.js`: **public URL / publishable key placeholders only**. Never store service-role or secret keys here.\n- `supabase/schema-auth.sql`: RLS-secured student profiles and server-controlled five-role assignments. SQL has **not been applied to any project**.\n- Only one personal project and one Sales OS project were available; neither has been repurposed. A separate project's organization, pricing and approval must be resolved first.\n\n## Next production integrations
1. Supabase database, Auth, Row Level Security, consent and role workflows.
2. Razorpay payment order creation, verified webhooks, receipts, subscriptions and refunds.
3. Instructor onboarding, meeting service, recording upload, secure playback and assignments.
4. Company verification, contracts, opportunities, applications and supervised engagements.
5. Verified certificates with QR and authorized sign-off.
6. Native Android/iOS clients with a shared secure API; app-store publication.
7. Automated browser E2E tests, security review, accessibility and real device QA (static and route smoke checks already configured).

## Development
This version is intentionally a dependency-free static site. Open index.html locally or deploy the repository to a static web host.

For production do not trust client-side role selection or localStorage for authorization, payment, or certificates.
