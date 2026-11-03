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
  mode: "preview" as "preview" | "live",

  siteUrl: "https://marriage-vikas.vercel.app",
  project: {
    name: "The Royal Aangan",
    tagline: "Two Hearts. Two Families. One Beautiful Beginning.",
  },

  couple: {
    bride: { name: "Vikas", initial: "V" },
    groom: { name: "Sakshi", initial: "S" },
  },

  /** The moment the countdown runs to. Sample date in January: replace it with your own. */
  weddingDateTime: "2027-02-11T00:00:00+05:30",
  city: "Ujjain, Rajasthan",

  invitation: {
    greetingHindi: "पधारो म्हारे आँगन",
    greetingEnglish: "Welcome to our courtyard",
    blessing: "॥ शुभ विवाह ॥",
    /** The invocation beside Ganesha on the first page and in the entry animation. */
    invocation: "॥ श्री गणेशाय नमः ॥",
    message:
      "With the blessings of our families, we invite you to join us as we celebrate the beginning of a beautiful journey.",
    brideFamily: "Mr. Aparabal",
    groomFamily: "Mamta Singh",
    familyWording: "request the pleasure of your company",
  },

  /** Sample functions. Dates, times and venues are examples only. Confirm each one before going live. */
  events: [
    {
      id: "haldi", name: "Haldi", illustration: "haldi", confirmed: false,
      start: "2027-02-09T02:30:00+05:30", end: "2027-01-14T13:00:00+05:30",
      venue: "[Haldi venue]", address: "[Full address], Kota, Rajasthan", mapsQuery: "Kota, Rajasthan",
      description: "Turmeric, laughter and a morning of family mischief.",
      dressCode: "[Dress code, for example shades of yellow]",
    },
    {
      id: "mehendi", name: "Mehendi", illustration: "mehendi", confirmed: false,
      start: "2027-01-14T15:00:00+05:30", end: "2027-01-14T18:00:00+05:30",
      venue: "[Mehendi venue]", address: "[Full address], Kota, Rajasthan", mapsQuery: "Kota, Rajasthan",
      description: "An unhurried afternoon of henna, folk songs and sweet chai.",
      dressCode: "[Dress code, for example shades of green]",
    },
    {
      id: "sangeet", name: "Sangeet", illustration: "sangeet", confirmed: false,
      start: "2027-01-14T19:30:00+05:30", end: "2027-01-14T23:30:00+05:30",
      venue: "[Sangeet venue]", address: "[Full address], Kota, Rajasthan", mapsQuery: "Kota, Rajasthan",
      description: "Both families take the floor. Practise your steps.",
      dressCode: "[Dress code, for example festive Indian]",
    },
    {
      id: "wedding", name: "Wedding Ceremony", illustration: "wedding", confirmed: false,
      start: "2027-01-15T19:00:00+05:30", end: "2027-01-15T23:59:00+05:30",
      venue: "[Wedding venue]", address: "[Full address], Kota, Rajasthan", mapsQuery: "Kota, Rajasthan",
      description: "The sacred fire, the seven steps and the promise at the heart of it all.",
      dressCode: "[Dress code, for example traditional Indian]",
    },
    {
      id: "reception", name: "Reception", illustration: "reception", confirmed: false,
      start: "2027-01-16T19:30:00+05:30", end: "2027-01-16T23:30:00+05:30",
      venue: "[Reception venue]", address: "[Full address], Kota, Rajasthan", mapsQuery: "Kota, Rajasthan",
      description: "Dinner, toasts and a first evening together as a married couple.",
      dressCode: "[Dress code, for example formal]",
    },
  ] as WeddingEvent[],

  /** The closing screen. Keep both lines short: they are meant to fit one phone screen. */
  farewell: {
    message: "Our aangan will be brighter with you by our side. We cannot wait to welcome you.",
    closing: "Until we meet in our royal aangan.",
  },

  destination: {
    venueName: "[Main venue name]",
    address: "[Full street address], Kota, Rajasthan [PIN]",
    mapsQuery: "Kota, Rajasthan",
    photo: { src: null, vignette: "courtyard", caption: "Painting: a courtyard in bougainvillea. Replace with a photograph of your venue." } as Photo,
    stays: [
      { name: "[Hotel one]", note: "[Distance from venue, and any group rate]" },
      { name: "[Hotel two]", note: "[Distance from venue, and any group rate]" },
    ],
    /** General Kota travel facts checked in November 2026. Review close to the wedding. */
    rail: "Kota Junction (station code KOTA) sits on the main Delhi to Mumbai line, so many direct trains stop here.",
    road: "By road, Kota is about four to five hours from Jaipur. Please check the route before you set out.",
    air: "Kota has no commercial flights yet. Its new airport is expected to open around late 2027. For January, fly to Jaipur (JAI), about 250 km by road, then take a car or train.",
  },

  assistance: {
    name: "[Contact person]",
    phone: "+91 00000 00000",
  },

  quiz: [
    { question: "Who said I love you first?", answer: "bride", reveal: "[Add the story behind this answer.]" },
    { question: "Who takes longer to get ready?", answer: "groom", reveal: "[Add the story behind this answer.]" },
    { question: "Who is the bigger foodie?", answer: "groom", reveal: "[Add the story behind this answer.]" },
    { question: "Who is more romantic?", answer: "bride", reveal: "[Add the story behind this answer.]" },
    { question: "Who is more likely to forget something?", answer: "bride", reveal: "[Add the story behind this answer.]" },
  ] as { question: string; answer: "bride" | "groom"; reveal: string }[],

  secretMessage:
    "[Your secret message to guests who find all three hearts, for example a thank-you, or a table where you left a surprise.]",

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

  dietaryOptions: ["Vegetarian", "Jain", "Vegan", "No onion or garlic", "Non-vegetarian"],
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
