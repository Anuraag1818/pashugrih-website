# Pashuगृह — Netlify edition

This package contains the complete Pashuगृह website and a working Netlify backend.

## Included

- Responsive Hindi-first cattle catalogue and automatic three-image slideshow
- Breed-specific WhatsApp enquiries to `9942936647`
- PostgreSQL-backed editable website content using Netlify Database
- Durable logo, hero and breed-image uploads using Netlify Blobs
- Invite-only Admin login using Netlify Identity
- Server-side `admin` role checks on every content update and image upload
- Password recovery, invitation acceptance and secure sign-out

## Deploy

Do not use Netlify's static drag-and-drop deploy. The Admin and database require a normal source build.

1. Extract this ZIP and upload the extracted files to a GitHub repository.
2. In Netlify, choose **Add new project → Import an existing project**, select that repository and deploy. Netlify detects Next.js and reads `netlify.toml`.
3. Open **Database** in the Netlify project. Netlify should provision the database because `@netlify/database` is installed. If it is not created automatically, select **Create database**, then trigger a new deploy. The included migration creates `site_content` automatically.
4. Open **Project configuration → Identity** and select **Enable Identity**.
5. Set **Registration preferences** to **Invite only**.
6. Invite the owner's email address. After the account appears in Identity, assign it the role `admin`.
7. Open the invitation email, create the password, and visit `/admin`.

The first public request seeds the database with the existing Pashuगृह content. Images uploaded from Admin are stored in the site-wide `pashugrih-media` Blob store.

## Local development

Use Netlify CLI so Database, Blobs and Identity runtime context are available:

```bash
pnpm install
npx netlify dev
```

For a production compilation check:

```bash
pnpm run build
```

Never commit passwords, Netlify tokens or database connection strings.
