/**
 * Content for the /friends page only. The /family page never loads this file,
 * so its words are not in the family page's code.
 */
import type { Photo } from "./wedding.config";

export const friendsOnly = {
  story: [
    {
      title: "The Beginning",
      caption: "Our story began at VIT Bhopal, the college that will always hold the most special place in our hearts.\nBut little did we know that our story had actually started even before we stepped onto the campus.\nIt all began with a random group chat full of strangers, an unplanned and rather silly wedding ceremony over chat, and a group named Naamkaran.\nWho knew that a random conversation would turn into a forever kind of story?",
      when: "2019",
      photo: { src: null, vignette: "moon", caption: "Painting: a couple beneath a moonlit arch" } as Photo,
    },
    {
      title: "The Journey",
      caption: "Our journey was nothing short of a rollercoaster, filled with countless emotions, unexpected turns, and memories that shaped us into who we are today.\nWe went from being friends to best friends, then frenemies, and even strangers for a while.\nBut somehow, no matter how far life took us from each other, we always found our way back, falling for each other a little harder every time.",
      when: "2019-2025",
      photo: { src: null, vignette: "chambal", caption: "Painting: a lake palace at sunset" } as Photo,
    },
    {
      title: "The Promise",
      caption: "After all the laughter, tears, struggles, and countless emotions, we knew it was finally time to hold each other’s hands, not just for a moment, but for a lifetime.\nBringing our families together wasn’t an easy journey. It came with its share of tears, challenges, and heartfelt moments.\nBut on 24th April 2026, with our families by our side, we finally made it official. We got Rokafied!\n\nAnd just like that, two people who once met as strangers in a random group chat took their first step towards forever.",
      when: "2026",
      photo: { src: null, vignette: "marigold", caption: "Painting: a door hung with marigolds" } as Photo,
    },
  ],

  gallery: [
    { src: null, vignette: "peacock", caption: "Engagement photographs go here" },
    { src: null, vignette: "lanterns", caption: "A couple portrait goes here" },
    { src: null, vignette: "lotus", caption: "A candid moment goes here" },
    { src: null, vignette: "feather", caption: "A favourite memory goes here" },
    { src: null, vignette: "chambal", caption: "A trip you took together goes here" },
    { src: null, vignette: "marigold", caption: "A family moment goes here" },
    { src: null, vignette: "moon", caption: "A quiet evening goes here" },
  ] as Photo[],
};
