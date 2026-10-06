# GreatInterview — landing page

A static, no-build-step waitlist/promo page for GreatInterview. Three files: `index.html`, `styles.css`, `script.js`. No framework, no npm install, no server — deploy it as-is to any static host.

## 1. Wire up email capture (Formspree)

The signup forms post to Formspree, a free form-backend service — no code or database needed on your side.

1. Go to https://formspree.io and sign up (free tier is enough for a waitlist).
2. Create a new form. Formspree gives you a form ID that looks like `xzzjgqko`.
3. In `index.html`, replace **both** occurrences of `YOUR_FORM_ID` in the `action="https://formspree.io/f/YOUR_FORM_ID"` attributes with your real form ID.
4. Submit a test signup from the live page once deployed — Formspree requires confirming your first submission's destination email before it starts forwarding silently.

Emails will show up in your Formspree dashboard, and Formspree can forward each one to your inbox or export them as CSV at any time.

If you'd rather use Mailchimp/ConvertKit/Buttondown instead, swap the `action` URL for that provider's form-submission endpoint — the JS in `script.js` posts as a plain `FormData` request and reads a JSON response, which is also what most of those providers' hosted forms expect.

## 2. Update the placeholders before launch

- `index.html` → `<meta property="og:url">` currently says `https://example.com/`; change it to your real domain once you know it.
- Swap the footer/legal text if you want anything beyond a copyright line.

## 3. Deploy to your domain

Any static host works. Two easy, free options:

### Netlify (drag-and-drop, easiest)
1. https://app.netlify.com/drop → drag this whole folder in. You get a live URL immediately.
2. Site settings → Domain management → Add a custom domain → follow Netlify's DNS instructions (usually a CNAME record, or Netlify DNS if you want to delegate the whole domain to them).

### Vercel
1. `npm i -g vercel` (one-time), then from this folder: `vercel --prod`.
2. `vercel domains add yourdomain.com` or add it from the Vercel dashboard → Project → Settings → Domains, then update your registrar's DNS as instructed.

### GitHub Pages (if you want it versioned in a repo)
1. Push this folder to a new GitHub repo.
2. Repo Settings → Pages → deploy from the `main` branch, root folder.
3. Add a `CNAME` file in this folder containing just your domain (e.g. `greatinterview.dev`) and point your registrar's DNS at GitHub Pages per https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site.

Whichever host you pick, your registrar just needs a DNS record pointed at that host — the host's own dashboard will give you the exact record to add.

## Local preview

No build step needed — just open `index.html` directly in a browser, or serve it locally:

```
cd greatinterview-landing
python3 -m http.server 8000
```

Then visit http://localhost:8000. (Form submission won't actually work with a placeholder Formspree ID until you complete step 1 above.)
