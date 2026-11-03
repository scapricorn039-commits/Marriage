/**
 * Content for the /friends page only. The /family page never loads this file,
 * so its words are not in the family page's code.
 */
import type { Photo } from "./wedding.config";

export const friendsOnly = {
  story: [
    {
      title: "The Beginning",
      caption: "[Two or three lines in your own words: where you met and what you first noticed.]",
      when: "[Year]",
      photo: { src: null, vignette: "moon", caption: "Painting: a couple beneath a moonlit arch" } as Photo,
    },
    {
      title: "The Journey",
      caption: "[A moment only the two of you would tell: a trip, a long call, a family dinner.]",
      when: "[Year]",
      photo: { src: null, vignette: "chambal", caption: "Painting: a lake palace at sunset" } as Photo,
    },
    {
      title: "The Promise",
      caption: "[How you decided, who asked, and who cried first.]",
      when: "[Year]",
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
