# Pashuगृह catalogue preview

## Included in this preview

- Dynamic breed groups and cattle listing cards managed from the authenticated Admin panel
- Exact 4 × 3 starter inventory with only Holstein Friesian 1 available
- Six supplied Holstein Friesian 1 photographs and one supplied video in a mixed-media carousel
- HEIC photographs converted to optimized WebP; HEVC MOV converted to H.264 MP4
- Availability, cattle details, public-price controls, WhatsApp messages and media ordering
- Netlify Database persistence, Netlify Blob uploads and Netlify Identity `admin` role protection
- Private-by-default supplement management, ready for future activation
- Hindi-first public contact and footer details for Jawaripur, Tilkamanjhi, Bhagalpur
- Versioned v5 migration that preserves v4 edits/deletions and seeds the new gallery only when the old gallery is empty

## Verification completed

- 9 automated tests passed
- TypeScript typecheck passed
- ESLint passed
- Next.js production build passed
- Desktop public page: 3-column listing grid, 7-item carousel, no horizontal overflow
- Mobile public page: 1-column listing grid, exactly centered header brand, no horizontal overflow
- Video loaded and played in the carousel; no public-page console errors
- `/admin` redirected to `/admin/login`; desktop and mobile login layouts verified with no console errors

## Deploy-time checks still required

Real Netlify Identity sign-in, Database writes and Blob upload persistence require a Netlify deploy with those services enabled. Follow `NETLIFY_SETUP.md`, then test one saved edit and one image/video upload before approving production.
