import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";
import listPosts from "./tools/list-posts";
import createPost from "./tools/create-post";
import listMessages from "./tools/list-messages";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "primegram-mcp",
  title: "Primegram",
  version: "0.1.0",
  instructions:
    "Tools for Primegram, a social + entertainment app. Act as the signed-in user: read their profile, list and create their posts, and read their direct messages. All access is scoped by the user's OAuth token via row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listPosts, createPost, listMessages],
});
