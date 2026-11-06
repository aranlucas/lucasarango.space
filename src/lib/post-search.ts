import type { Post, PostSummary } from "@/interfaces/post";
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

export type IndexedPost = PostSummary & { scores: Record<string, number> };

function postScores(post: Post): Record<string, number> {
  const scores = new Map<string, number>();

  for (const [text, weight] of [
    [post.title, 8],
    [post.summary, 4],
    [post.content, 1],
  ] as const) {
    for (const word of searchTerms(text)) {
      scores.set(word, (scores.get(word) ?? 0) + weight);
    }
  }

  return Object.fromEntries(scores);
}

/** Build on the server so the archive never ships full Markdown bodies to the browser. */
export function indexPosts(posts: Post[]): IndexedPost[] {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    readingMinutes: post.readingMinutes,
    scores: postScores(post),
  }));
}

/** Rank subject matches above incidental mentions; query wording need not match verbatim. */
export function searchPosts(posts: Post[], options: ListPostsArgs = {}) {
  return rankPosts(posts, options, postScores);
}

export function searchPostIndex(posts: IndexedPost[], options: ListPostsArgs = {}) {
  return rankPosts(posts, options, (post) => post.scores);
}

function rankPosts<T extends PostSummary>(
  posts: T[],
  { query = "", sort, limit }: ListPostsArgs,
  getScores: (post: T) => Record<string, number>,
) {
  const terms = searchTerms(query);
  const searching = query.trim().length > 0;
  const order = sort ?? (searching ? "relevance" : "newest");

  const ranked = posts.map((post) => {
    if (terms.length === 0) {
      return { post, score: 0 };
    }

    const scores = getScores(post);

    const score = terms.reduce(
      (sum, term) => sum + (Object.hasOwn(scores, term) ? (scores[term] ?? 0) : 0),
      0,
    );

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
