# Keyshawn Jeannot — Cybersecurity Portfolio

Professional portfolio for cybersecurity, security operations, and aspiring security engineering roles.

## Tech stack

- Semantic HTML5
- Modern CSS (custom properties, responsive layout)
- Vanilla JavaScript
- Project content driven by `data/projects.json`

No React, Next.js, or Tailwind.

## Quick start

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

A local server is required so `data/projects.json` can load via `fetch`.

## Site map

| Section | Purpose |
|---------|---------|
| Hero | Name, headline, intro, CTAs, photo placeholder |
| About | Concise biography and career interests |
| Experience | SOC internship with 300+ workstation highlight |
| Projects | Cards + detail modal from JSON |
| Skills | Grouped tags (no percentage bars) |
| Leadership | NSBE President |
| Education | UMass Boston, CompTIA Security+ (earned), AWS Solutions Architect – Associate (expected October 2026), Terraform Associate (in progress) |
| Contact | Email placeholder, GitHub, LinkedIn |

## What you still need to provide

1. **Professional email** — replace `YOUR_EMAIL@example.com` in `index.html`
2. **Profile photo** — add `assets/images/profile.jpg`, then update the `src` on `#profile-photo` in `index.html`
3. **Résumé PDF** — `assets/resume/Keyshawn_Jeannot_Resume.pdf`
4. **Project screenshots** (optional, sanitized) — set `"screenshot": "assets/images/..."` in `data/projects.json`
5. **Open Graph image** (optional) — replace `assets/images/og-placeholder.svg` or point `og:image` to a PNG/JPG

## Updating projects

Edit `data/projects.json` only. Each project supports:

- card fields: title, summary, objective, workedOn, tools, skills, repoUrl
- optional: liveUrl, screenshot
- modal detail block: overview, businessProblem, environment, responsibilities, process, results

Do not publish real university usernames, emails, IPs, hostnames, tickets, credentials, or confidential SOC data.

## Accessibility & quality notes

- Sticky, keyboard-accessible navigation with visible focus states
- Skip link, semantic headings, reduced-motion support
- Lazy-loaded project images when screenshots are added
- SEO title, meta description, and Open Graph tags included

## Design notes

Inspired by the professionalism and clarity of mature technical sites—not copied from any specific template. Restrained dark theme, IBM Plex typography, teal accent, and recruiter-friendly scanning hierarchy.


## Design reference

Local clone of the visual/structure reference (ignored by git):

```bash
reference-portfolio/
```

Do not copy its branding or assets. Use it only for layout and professionalism cues.
