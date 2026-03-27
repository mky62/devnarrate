"use client";

import { Globe } from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";

interface SocialLinksData {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface SocialLinksProps {
  links: SocialLinksData;
}

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="flex gap-2 pt-1 flex-wrap">
      {links.github && (
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          title="GitHub"
        >
          <FaGithub size={16} />
        </a>
      )}
      {links.twitter && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          title="Twitter"
        >
          <FaXTwitter size={16} />
        </a>
      )}
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          title="LinkedIn"
        >
          <FaLinkedin size={16} />
        </a>
      )}
      {links.website && (
        <a
          href={links.website}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Website"
        >
          <Globe size={18} />
        </a>
      )}
    </div>
  );
}
