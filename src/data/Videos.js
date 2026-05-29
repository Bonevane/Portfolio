import { cards } from './Cards.js';

export const standaloneVideos = [
  { 
    type: 'video', 
    url: '/videos/oc-shoot.mp4', 
    title: 'Organizing Committee Reveal', 
    description: 'A short, fast-paced reveal trailer for the organizing committee of SEECS Got Talent 25\'.'
  },
  { 
    type: 'video', 
    url: '/videos/khaapa-ranchers.mp4', 
    title: 'Ranchers x Papa\'s Khaapa', 
    description: 'A short cinematic film, created as part of a collaboration between Ranchers and Papa\'s Khaapa. Directed, Filmed & Edited by yours truly.',
  },
  { 
    type: 'video', 
    url: '/videos/khaapa-teaser.mp4', 
    title: 'Papa\'s Khaapa - Coming Soon', 
    description: 'A slow paced reveal trailer following Avengers: Doomsday format, for Papa\'s Khaapa.'
  },
  {
    type: 'video',
    url: '/videos/dextra-full.mp4',
    title: 'Dextra - Logo Reveal',
    description: 'A cinematic logo reveal for Dextra IV.'
  }
];

const blenderMedia = cards
  .filter(c => c.section === "Blender")
  .flatMap(c => c.media ? c.media.map(m => ({
    ...m,
    title: m.title || c.title,
    description: m.description || c.description
  })) : []);

export const cinematicMedia = [
  ...blenderMedia.filter(m => m.type === 'video'),
  ...standaloneVideos,
  ...blenderMedia.filter(m => m.type !== 'video')
];
