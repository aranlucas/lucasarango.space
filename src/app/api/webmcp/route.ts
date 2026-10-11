import { getAllPosts, getPostBySlug } from "@/lib/api";
import { getResume } from "@/lib/resume";
import { createWebMCPHandler } from "@/lib/webmcp-handler";

export const GET = createWebMCPHandler({ getAllPosts, getPostBySlug, getResume });
