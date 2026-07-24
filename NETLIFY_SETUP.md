# Netlify setup checklist

- [ ] Deploy this source from a Git repository (not static drag-and-drop)
- [ ] Confirm the project build succeeds
- [ ] Enable Netlify Database and redeploy if it was not provisioned automatically
- [ ] Confirm the `site_content` table appears in Database
- [ ] Enable Netlify Identity
- [ ] Change registration to **Invite only**
- [ ] Invite the website owner's email
- [ ] Assign that Identity user the exact role `admin`
- [ ] Accept the invitation and create a password
- [ ] Sign in at `/admin`
- [ ] Save a text change and refresh the public page
- [ ] Upload a test image and confirm it remains after a refresh
- [ ] Test availability toggles and every WhatsApp button

If a signed-in account sees “Admin role required,” assign `admin` in Netlify Identity and sign out/in so the refreshed token includes the role.
