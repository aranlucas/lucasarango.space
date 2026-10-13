import type { Post } from "@/interfaces/post";
import type { ListPostsArgs } from "@/lib/site-agent-inputs";

// Question wording and site context should not outweigh the subject being sought.
const STOP_WORDS = new Set(
  "a an and are as at be been by can could did do does for from had has have how i in into is it its me my of on or our that the their them these they this to was we were what when where which who why will with would you your lucas arango tell show find about post posts article articles wrote write written"
    .split(" ")
    .map((word) => normalize(word)),
);

function normalize(word: string) {
  if (word.length > 4 && word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }

  return word;
}

function words(text: string) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((word) => normalize(word));
}

function searchTerms(query: string) {
  return [...new Set(words(query).filter((word) => !STOP_WORDS.has(word)))];
}

/** Rank subject matches above incidental mentions; query wording need not match verbatim. */
export function searchPosts(posts: Post[], { query = "", sort, limit }: ListPostsArgs = {}) {
  const terms = searchTerms(query);
  const searching = query.trim().length > 0;
  const order = sort ?? (searching ? "relevance" : "newest");

  const ranked = posts.map((post) => {
    const title = new Set(words(post.title));
    const summary = new Set(words(post.summary));
    const body = new Set(words(post.content));
    let score = 0;

    for (const term of terms) {
      if (title.has(term)) {
        score += 8;
      }

      if (summary.has(term)) {
        score += 4;
      }

      if (body.has(term)) {
        score += 1;
      }
    }

    return { post, score };
  });

  const matches = ranked
    .filter(({ score }) => !searching || score > 0)
    .toSorted((a, b) => {
      if (order === "relevance" && a.score !== b.score) {
        return b.score - a.score;
      }

      const dates = a.post.date.localeCompare(b.post.date);

      return (order === "oldest" ? dates : -dates) || a.post.slug.localeCompare(b.post.slug);
    });

  return {
    posts: matches.slice(0, limit).map(({ post }) => post),
    total: matches.length,
    sort: order,
    terms,
  };
}
