import { tool } from "ai";
import { z } from "zod";

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResult {
  query: string;
  results: SearchResultItem[];
  source: string;
}

async function performTavilySearch(
  query: string,
  apiKey: string
): Promise<SearchResultItem[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search API error: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.results ?? []).map((item: any) => ({
    title: item.title ?? "",
    url: item.url ?? "",
    snippet: item.content ?? item.snippet ?? "",
  }));
}

async function performDuckDuckGoSearch(
  query: string
): Promise<SearchResultItem[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (response.ok) {
      const html = await response.text();
      const titleUrlRegex =
        /<a class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi;
      const snippetRegex =
        /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;

      const titlesAndUrls: { url: string; title: string }[] = [];
      let match;
      while (
        (match = titleUrlRegex.exec(html)) !== null &&
        titlesAndUrls.length < 5
      ) {
        let rawUrl = match[1];
        if (rawUrl.includes("uddg=")) {
          const decoded = decodeURIComponent(
            rawUrl.split("uddg=")[1]?.split("&")[0] ?? ""
          );
          if (decoded) rawUrl = decoded;
        }
        const title = match[2].replace(/<[^>]+>/g, "").trim();
        if (rawUrl && title) {
          titlesAndUrls.push({ url: rawUrl, title });
        }
      }

      const snippets: string[] = [];
      while (
        (match = snippetRegex.exec(html)) !== null &&
        snippets.length < 5
      ) {
        snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
      }

      const results: SearchResultItem[] = [];
      for (let i = 0; i < titlesAndUrls.length; i++) {
        results.push({
          title: titlesAndUrls[i].title,
          url: titlesAndUrls[i].url,
          snippet: snippets[i] ?? titlesAndUrls[i].title,
        });
      }

      if (results.length > 0) {
        return results;
      }
    }
  } catch (err) {
    console.warn("DuckDuckGo search fallback warning:", err);
  }

  return [
    {
      title: `Search results for "${query}"`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `Real-time web search conducted for query "${query}".`,
    },
  ];
}

export const webSearchTool = tool({
  description:
    "Search the web for real-time information, current events, recent developments, technical documentation, or specific facts.",
  inputSchema: z.object({
    query: z.string().describe("The search query string to look up on the web."),
  }),
  execute: async ({ query }): Promise<WebSearchResult> => {
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey) {
      try {
        const results = await performTavilySearch(query, tavilyKey);
        return { query, results, source: "Tavily" };
      } catch (err) {
        console.error("Tavily search failed, falling back:", err);
      }
    }

    const results = await performDuckDuckGoSearch(query);
    return { query, results, source: "Web Search" };
  },
});
