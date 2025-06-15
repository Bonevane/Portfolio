import { useRef, useState, useEffect } from "react";
import "./Orbit.css";

const bonevaneIcon = new URL("../../assets/icons/bonevane.svg", import.meta.url)
  .href;
const emailIcon = new URL("../../assets/icons/email.svg", import.meta.url).href;
const githubIcon = new URL("../../assets/icons/github.svg", import.meta.url)
  .href;
const linkedinIcon = new URL("../../assets/icons/linkedin.svg", import.meta.url)
  .href;
const discordIcon = new URL("../../assets/icons/discord.svg", import.meta.url)
  .href;
const itchIcon = new URL("../../assets/icons/itch.svg", import.meta.url).href;
const instagramIcon = new URL("../../assets/icons/insta.svg", import.meta.url)
  .href;
const youtubeIcon = new URL("../../assets/icons/youtube.svg", import.meta.url)
  .href;
const twitterIcon = new URL("../../assets/icons/twitter.svg", import.meta.url)
  .href;

const socials = [
  {
    name: "Email",
    icon: emailIcon,
    link: "rahmad.atomic44@gmail.com",
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

export default function Orbit() {
  const centerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (centerRef.current) {
      const height = centerRef.current.offsetHeight;
      setOffsetY(height / 2);
    }
  }, []);

  const layerConfigs = [
    { radius: 180, duration: 20 },
    { radius: 260, duration: 25 },
    { radius: 350, duration: 30 },
    { radius: 440, duration: 35 },
  ];

  return (
    <div className="fixed top-[-40px] right-[-80px] w-[100vh] h-[100vh] z-40">
      <div
        className="absolute top-0 right-0 z-10 hover:scale-110 transition-transform"
        ref={centerRef}
      >
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="w-82 h-82 rounded-full p-12 border-1 border-[#757575]/50 bg-[#84AEFF]/25 backdrop-blur-xl"
        />
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="absolute top-0 right-0 w-82 h-82 rounded-full p-12 z-[-1]"
        />
      </div>
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/50 rounded-full z-[-1]"
        style={{ transform: "scale(1.55)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/30 rounded-full z-[-1]"
        style={{ transform: "scale(2.25)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/20 rounded-full z-[-1]"
        style={{ transform: "scale(3.025)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/10 rounded-full z-[-1]"
        style={{ transform: "scale(3.8)" }}
      />
      {socials.map((social, i) => {
        const iconsPerLayer = 2;
        const layer = Math.floor(i / iconsPerLayer);
        const indexInLayer = i % iconsPerLayer;
        const { radius, duration } = layerConfigs[layer];
        const angle = (360 / iconsPerLayer) * indexInLayer;

        return (
          <div
            key={social.name}
            className="absolute top-0 right-0"
            style={{
              "--start-rotation": `${i * 45}deg`,
              width: radius * 2,
              height: radius * 2,
              marginRight: -radius + offsetY,
              marginTop: -radius + offsetY,
              animation: `orbit ${duration}s linear infinite`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          >
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-20 h-20 absolute rounded-full border-1 border-[#757575]/80 left-0 top-0 hover:scale-110 transition-transform z-10 backdrop-blur-md"
              style={{
                backgroundColor: `#${social.color}40`,
                pointerEvents: "all",
                animation: `orbit-reverse ${duration}s linear infinite`,
              }}
            >
              <img
                src={social.icon}
                alt={social.name}
                className="w-20 h-20 p-4"
              />
            </a>
          </div>
        );
      })}
    </div>
  );
}
