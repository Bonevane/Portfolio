export const bonevaneIcon = new URL(
  "../assets/icons/bonevane.svg",
  import.meta.url
).href;

const emailIcon = new URL("../assets/icons/email.svg", import.meta.url).href;
const githubIcon = new URL("../assets/icons/github.svg", import.meta.url).href;
const linkedinIcon = new URL("../assets/icons/linkedin.svg", import.meta.url)
  .href;
const discordIcon = new URL("../assets/icons/discord.svg", import.meta.url)
  .href;
const itchIcon = new URL("../assets/icons/itch.svg", import.meta.url).href;
const instagramIcon = new URL("../assets/icons/insta.svg", import.meta.url)
  .href;
const youtubeIcon = new URL("../assets/icons/youtube.svg", import.meta.url)
  .href;
const twitterIcon = new URL("../assets/icons/twitter.svg", import.meta.url)
  .href;

export const socials = [
  {
    name: "Email",
    icon: emailIcon,
    link: "mailto:rahmad.atomic44@gmail.com",
    color: "C9FF9F",
  },
  {
    name: "GitHub",
    icon: githubIcon,
    link: "https://github.com/bonevane",
    color: "AE86FF",
  },
  {
    name: "LinkedIn",
    icon: linkedinIcon,
    link: "https://linkedin.com/in/rafay-ahmad",
    color: "9FD5FF",
  },
  {
    name: "Discord",
    icon: discordIcon,
    link: "https://discord.com/users/bonevane",
    color: "9FA9FF",
  },
  {
    name: "Itch.io",
    icon: itchIcon,
    link: "https://bonevane.itch.io",
    color: "FFE29F",
  },
  {
    name: "Instagram",
    icon: instagramIcon,
    link: "https://instagram.com/rafay_ahmad44",
    color: "F8AEFF",
  },
  {
    name: "YouTube",
    icon: youtubeIcon,
    link: "https://youtube.com/@bonevane",
    color: "FF8B8B",
  },
  {
    name: "Twitter",
    icon: twitterIcon,
    link: "https://x.com/Bonevane_YT",
    color: "D9D9D9",
  },
];
