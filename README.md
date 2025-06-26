# Catalyst Demo

To run the Catalyst demo, first install the npm dependencies:

```bash
npm install
```

Create a `.env.local` file with your Supabase credentials:

```bash
cp .env.example .env.local
# then edit .env.local with your values
```

- `NEXT_PUBLIC_SUPABASE_URL` should be the URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anonymous API key

Make sure the Site URL and Redirect URLs in Supabase match your local URL, e.g. `http://localhost:3000/auth/callback`.

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.
