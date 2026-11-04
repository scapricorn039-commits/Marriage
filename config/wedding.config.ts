/**
 * THE ROYAL AANGAN: everything about your wedding lives in this one file.
 *
 * How to use it:
 * 1. Replace each sample value below with your real detail.
 * 2. Set `confirmed: true` on each function that is really happening.
 * 3. When you are done, change `mode` to "live". This removes the dotted "sample"
 *    markings and hides every function that is not confirmed.
 * 4. Run `npm run check:config` to list anything you may have missed.
 *
 * All dates and times are in Indian Standard Time, written as
 * "YYYY-MM-DDTHH:MM:00+05:30".
 */

export type VignetteName = "moon" | "peacock" | "marigold" | "lotus" | "chambal" | "lanterns" | "feather" | "courtyard";

export type Photo = {
  /** Path to your photo, for example "/photos/engagement-1.jpg". Put files in public/photos. Leave null to show the painting. */
  src: string | null;
  /** Painting shown until a real photograph is supplied. */
  vignette: VignetteName;
  /** Describes the photo for screen readers and appears as its caption. */
  caption: string;
};

export type EventIllustration = "haldi" | "mehendi" | "sangeet" | "wedding" | "reception";

export type WeddingEvent = {
  id: string;
  name: string;
  illustration: EventIllustration;
  /** Set true only when this function is really happening. In live mode, unconfirmed functions are hidden. */
  confirmed: boolean;
  start: string;
  /** End time is used only for calendar entries. */
  end: string;
  venue: string;
  address: string;
  /** Exact Google Maps search text for this venue. */
  mapsQuery: string;
  description: string;
  dressCode: string | null;
};

export const wedding = {
  /** "preview" shows sample markings. "live" removes them and hides unconfirmed functions. */
  mode: "live",

  siteUrl: "https://marriage-sakshi.vercel.app",
  project: {
    name: "The Royal Aangan",
    tagline: "Two Hearts. Two Families. One Beautiful Beginning.",
  },

  couple: {
    bride: { name: "Sakshi", initial: "S" },
    groom: { name: "Vikas", initial: "V" },
  },

  /** The moment the countdown runs to. Sample date in January: replace it with your own. */
  weddingDateTime: "2027-02-11T14:00:00+05:30",
  city: "Ujjain, Madhya Pradesh",

  invitation: {
    greetingHindi: "पधारो म्हारे आँगन",
    greetingEnglish: "Welcome to our courtyard",
    blessing: "॥ शुभ विवाह ॥",
    /** The invocation beside Ganesha on the first page and in the entry animation. */
    invocation: "॥ श्री गणेशाय नमः ॥",
    message:
      "With the blessings of our families, we invite you to join us as we celebrate the beginning of a beautiful journey.",
    brideFamily: "Mr. Chandresh",
    groomFamily: "Rani Tiwari",
    familyWording: "request the pleasure of your company",
  },

  /** Sample functions. Dates, times and venues are examples only. Confirm each one before going live. */
  events: [
    {
      id: "mehendi", name: "Mehendi", illustration: "mehendi", confirmed: true,
      start: "2027-02-07T12:30:00+05:30", end: "2027-02-07T18:00:00+05:30",
      venue: "Tripti Kunj", address: "Plot No.70, Street No. 13, Vivekanand Nagar, Kohka, Bhilai, Chhattisgarh", mapsQuery: "689J+FV3 Bhilai, Chhattisgarh",
      description: "An unhurried afternoon of henna, folk songs and sweet chai.",
      dressCode: "Your Shade, Your Style",
    },
    {
      id: "haldi", name: "Haldi", illustration: "haldi", confirmed: true,
      start: "2027-02-10T10:00:00+05:30", end: "2027-02-10T12:00:00+05:30",
      venue: "Radhe Krishna Resort & Garden", address: "Indore-Ujjain Rd, Indore(Gothada), Madhya Pradesh", mapsQuery: "Radhe Krishna Resort & Garden, Indore",
      description: "Turmeric, laughter and a morning of family mischief.",
      dressCode: "Pastel Dreams",
    },
    {
      id: "sangeet", name: "Sangeet", illustration: "sangeet", confirmed: true,
      start: "2027-02-10T19:00:00+05:30", end: "2027-02-10T22:00:00+05:30",
      venue: "Radhe Krishna Resort & Garden", address: "Indore-Ujjain Rd, Indore(Gothada), Madhya Pradesh", mapsQuery: "Radhe Krishna Resort & Garden, Indore",
      description: "Our family takes the floor. Practise your steps.",
      dressCode: "Glamour & Glitter",
    },
    {
      id: "wedding", name: "Wedding Ceremony", illustration: "wedding", confirmed: true,
      start: "2027-02-11T14:00:00+05:30", end: "2027-02-12T04:00:00+05:30",
      venue: "Radhe Krishna Resort & Garden", address: "Indore-Ujjain Rd, Indore(Gothada), Madhya Pradesh", mapsQuery: "Radhe Krishna Resort & Garden, Indore",
      description: "The sacred fire, the seven steps and the promise at the heart of it all.",
      dressCode: "Draped in Tradition",
    },
    {
      id: "reception", name: "Reception", illustration: "reception", confirmed: true,
      start: "2027-02-23T19:00:00+05:30", end: "2027-02-24T00:00:00+05:30",
      venue: "Gayatri Palace", address: "Durg-Dhamdha Rd, Durg, Chhattisgarh", mapsQuery: "Gayatri Palace, Durg",
      description: "Dinner, toasts and a first evening together as a married couple.",
      dressCode: "Glamour After Dark",
    },
  ] as WeddingEvent[],

  /** The closing screen. Keep both lines short: they are meant to fit one phone screen. */
  farewell: {
    message: "Our aangan will be brighter with you by our side. We cannot wait to welcome you.",
    closing: "Until we meet in our royal aangan.",
  },

  destination: {
    /** The heading above the venue details. */
    venueHeading: "Reception in Bhilai",
    venueName: "Gayatri Palace",
    address: "Durg-Dhamdha Rd, Durg, Chhattisgarh",
    mapsQuery: "Gayatri Palace, Durg",
    photo: { src: null, vignette: "courtyard", caption: "Painting: a courtyard in bougainvillea. Replace with a photograph of your venue." } as Photo,
    /** The two travel buttons in the picture show these lines. */
    departure: "Our bus leaves from the home at 7:00 AM on 9th February. Join us for the celebrations!",
    arrival: "The return bus leaves the venue at 8:00 AM on 12th February.",
  },

  assistance: {
    name: "Mr. Chandresh Tiwari",
    phone: "+91 94241 24496",
  },

  quiz: [
    { question: "Who is more likely to convince everyone for a family trip?", answer: "bride", reveal: "Because she can turn a casual family chat into a fully booked holiday before anyone even realises!" },
    { question: "Who takes longer to get ready?", answer: "bride", reveal: "None! It was a trick question… Shhhh, just go with the answer!" },
    { question: "Who is the bigger foodie?", answer: "groom", reveal: "Because he wants to try every dish, taste every flavour, and leave no food unexplored!" },
    { question: "Who is more likely to spend unnecessarily on shopping?", answer: "bride", reveal: "Because every step brings a new find, and she just can't resist taking it home!" },
    { question: "Who is more likely to forget something?", answer: "bride", reveal: "Because she remembers everything… except the one thing she actually needs!" },
  ] as { question: string; answer: "bride" | "groom"; reveal: string }[],

  secretMessage:
  "You found three hearts, but you've had ours all along.\nNow come and eat!\nSakshi & Vikas",

  /**
   * BACKGROUND SOUND. To attach any sound file:
   *   1. Put the file in public/music/, for example public/music/shloka.mp3.
   *   2. Set src to "/music/shloka.mp3". A full https:// address also works.
   * MP3 and M4A play on every phone. Keep it under about 5 MB so it loads quickly on mobile data.
   * Use only a recording you have the rights to. Leave src as null for the built-in piece:
   * an original flute and tanpura melody in the rhythm of the Vakratunda Mahakaya shloka.
   * Browsers do not allow sound until a guest's first tap, click or key press, so it begins then.
   */
  music: {
    /** false removes the sound and its button from the site. */
    enabled: true,
    /** Path to your sound file, or null for the built-in piece. */
    src: null as string | null,
    /** How loud your file plays, from 0 (silent) to 1 (full). Phones using iOS ignore this and follow the device volume. */
    volume: 0.5,
    /** true repeats the file for as long as the guest stays. */
    loop: true,
    /** Seconds your file takes to rise to full volume when it starts. */
    fadeInSeconds: 2,
    /** true keeps it silent until a guest presses the sound button. */
    startMuted: false,
  },
};

/** friends: the full invitation. family: everything except Our Story and Moments. */
export type Audience = "family" | "friends";
export type Wedding = typeof wedding;

/** Functions guests should see. Preview shows the samples, live shows only confirmed ones. */
export function visibleEvents() {
  return wedding.mode === "live" ? wedding.events.filter((e) => e.confirmed) : wedding.events;
}
export const isPreview = () => wedding.mode === "preview";
export const coupleLine = () => `${wedding.couple.bride.name} & ${wedding.couple.groom.name}`;
