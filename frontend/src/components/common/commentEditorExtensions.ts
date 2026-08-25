import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Link from "@tiptap/extension-link";

export const commentEditorExtensions = [
  StarterKit,

  Underline,

  Image,

  Emoji.configure({
    emojis: gitHubEmojis,
    enableEmoticons: true,
  }),

  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    protocols: ["http", "https"],
  }),
];
