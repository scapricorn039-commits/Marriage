# The Royal Aangan: minimal edition

A quiet invitation with one butterfly that follows the scroll, and a sky that turns from dawn to night.

A bespoke wedding invitation for Kota, Rajasthan. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP and Supabase.

## Replace the sample content

Everything personal lives in **`config/wedding.config.ts`** and **`config/friends-only.ts`**: names, initials, dates, venues, functions, story, photographs, quiz answers, secret message and the helpline number.

1. Replace each sample value.
2. Put photographs in `public/photos/` and set `src`, for example `src: "/photos/engagement-1.jpg"`. Until then, a painting stands in the frame.
3. Set `confirmed: true` on each function that is really happening.
4. Change `mode: "preview"` to `mode: "live"`. This removes the dotted sample markings and hides unconfirmed functions.
5. Run `npm run check:config` to list anything you missed.

The monogram, favicon and WhatsApp preview card update from the config automatically.

Check before going live: the wedding date is a sample (15 January 2027), and the wording "पधारो म्हारे आँगन" and "॥ शुभ विवाह ॥" should suit your family. The travel notes were checked in November 2026, so review them close to the day.

## Try it on your computer

Needs Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD. Leave the Supabase lines blank for now.
npm run dev
```

Open http://localhost:3000. Without Supabase, entries are saved to a local `.data` folder so you can test everything.

## Put it online

**1. Create the database (Supabase).** Create a project at supabase.com, choosing the Mumbai region. Open **SQL Editor**, paste all of `supabase/schema.sql` and run it. Copy the project URL and the **service role** key from Project Settings > API.

**2. Publish (Vercel).** Import this project at vercel.com. Under Environment Variables add:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Your project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `ADMIN_PASSWORD` | A password of at least 12 characters |
| `APP_SECRET` | Any long random text |

**3. Set your address.** Put the final web address in `siteUrl` in the config, so WhatsApp shows the preview card.

**4. Test it yourself.** Send one RSVP and one blessing, then sign in at `/admin` and confirm that both arrived.

Two warnings:

- The service role key can read and change everything. Keep it only in Vercel and in `.env.local`, and never in a variable that starts with `NEXT_PUBLIC_`.
- Changing `APP_SECRET` signs everyone out of `/admin`. It also restarts the spam counting, which is harmless.

## The couple's desk: `/admin`

- **RSVPs:** headcount, numbers per function, dietary notes and a spreadsheet download.
- **Blessings:** nothing appears publicly until you choose "Show in the book".
- **Songs:** the suggestions list.
- **Guest links:** create a private link per family, with an optional seat limit, and send it on WhatsApp. The guest is greeted by name, sees their seat limit and can change their reply later.

## How guest data is protected

- The browser only talks to this site's server. The database key never reaches a guest's phone.
- Row Level Security is on for every table with no public access, so the public Supabase key can read nothing.
- The public guest book only ever receives approved blessings, with name, family, message and date.
- Spam protection: a hidden bot field, hourly limits per connection (stored as a one-way hash, not the IP address) and a database rule against duplicate songs.

Personal links are private only if guests keep them private. Anyone holding a family's link can see and change that family's reply. The Share button on the site always shares the general link, without the private code.

## Music

The music button plays a soft tune generated in the browser, so there is no audio file to license. To use your own licensed instrumental, put the file in `public/music/` and set `music.src`. Music never starts unless a guest taps the button.

## Where things live

| Folder | Holds |
|---|---|
| `config/` | Wedding details |
| `components/art/` | Original SVG illustrations |
| `components/motion/` | Scroll and threshold animation |
| `components/sections/` | The ten rooms, in order |
| `components/activities/` | Quiz, hidden hearts and song box |
| `app/api/`, `lib/server/` | Backend |
| `lib/guest-context.tsx` | Personal invitation data |
| `supabase/` | Database setup |

`npm run build:preview` makes one self-contained HTML page for sharing a look. It has no server, so its entries stay in the viewer's browser.

## Family and friends pages

| Address | Who it is for | What it shows |
|---|---|---|
| `/friends` | Friends | Everything |
| `/family` | Family | Everything except Our Story and Moments |
| `/` | Anyone with the plain link | Same as `/family` |

Our Story and Moments live in `config/friends-only.ts`. The family page never loads that file, so those words are not in its code. Photographs in `public/` can still be opened by anyone with their exact address.

`/friends` is an ordinary address, so someone could guess it. It keeps things tidy but is not a password. In `/admin`, choose Family or Friends when you create each personal link.

If you already ran `supabase/schema.sql` on an earlier version, run it once more. It safely adds the new column and changes nothing else.

## Background sound

Everything is in the `music` block of `config/wedding.config.ts`:

1. Put your file in `public/music/`, for example `public/music/shloka.mp3`.
2. Set `src: "/music/shloka.mp3"`. A full `https://` address also works.
3. Adjust `volume`, `loop`, `fadeInSeconds` and `startMuted` if you wish. `enabled: false` removes sound and its button altogether.

MP3 and M4A play on every phone. Keep the file under about 5 MB, and use only a recording you have the rights to. If a file cannot be loaded, the built-in piece plays instead. That piece is an original instrumental, generated in the browser, phrased in the eight-syllable lines of the Vakratunda Mahakaya shloka.

Browsers do not allow sound until a guest first taps, clicks or presses a key, so it begins at that moment. A guest's choice to mute is remembered.

## The butterfly and the sky

`components/motion/ButterflyFlight.tsx` flies one butterfly through the page. Any element with a `data-perch` attribute becomes a stop: `tl`, `tc` or `tr` sets where along its top edge the butterfly lands, and `data-perch-dy` moves that point down. One smooth curve runs through every stop, swinging side to side between them, and stays inside the middle 72% of the page. The swing size, spacing and rest time are named constants at the top of the file.

Current stops, in order: first page, countdown, the "&" in the invitation, each Our Story photo (friends only), Celebrations, the travel scene, Moments (friends only), the quiz title, the guest book, the RSVP form, and the monogram on the closing screen, where it meets its partner. The path recalculates by itself, including when a page has fewer sections. It shies away from a mouse and hops when tapped near.

`components/motion/Sky.tsx` carries the page through one whole day: dawn, morning, midday, golden afternoon, dusk and night, with the sun on a single arc. Guests who choose reduced motion in their phone settings see still butterflies and a still sky.

## Ganesha

`components/art/Ganesha.tsx` is an original line drawing, shown at the top of the first page. `components/sections/Entrance.tsx` plays the short blessing when a guest presses Enter Our Aangan. The words come from `invitation.invocation` in the config.

## The pictures

Everything in `public/art/` is original. The first page and the travel scene are drawn in `scripts/paint/`, and `components/sections/Journey.tsx` moves the vehicles.
