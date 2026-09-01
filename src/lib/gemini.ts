import { Verdict } from "@/constants/prop";
import { NewPriceCheck } from "@/lib/db";

export interface AnalyzePriceInput {
  description?: string;
  link?: string;
  price?: string;
}

export interface ExtractedProductInfo {
  productName: string;
  price: string;
  description: string;
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const model = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? "gemini-2.5-flash";

const responseSchema = {
  type: "object",
  properties: {
    productName: { type: "string" },
    pricePaid: { type: "number" },
    marketLow: { type: "number" },
    marketHigh: { type: "number" },
    verdict: {
      type: "string",
      enum: ["goodDeal", "fair", "overpriced", "suspicious"],
    },
    reasoning: { type: "string" },
    details: { type: "array", items: { type: "string" } },
  },
  required: [
    "productName",
    "pricePaid",
    "marketLow",
    "marketHigh",
    "verdict",
    "reasoning",
    "details",
  ],
};

function parseJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

function sanitizeText(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function normalizePriceInput(value: string): string {
  if (!value) return "";

  const cleaned = value
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^\d.\sKkMmBbNn₦$€£]/g, "")
    .trim();

  if (!cleaned) return "";

  const match = cleaned.match(/^([\d]+(?:\.\d+)?)(?:\s*([kKmMbB]))?$/);
  if (!match) {
    const numericOnly = cleaned.replace(/[^\d.]/g, "");
    return numericOnly;
  }

  const [, amountText, suffix] = match;
  const amount = Number(amountText);
  if (!Number.isFinite(amount)) return "";

  const multipliers: Record<string, number> = {
    k: 1000,
    K: 1000,
    m: 1000000,
    M: 1000000,
    b: 1000000000,
    B: 1000000000,
  };

  const normalized = suffix ? amount * (multipliers[suffix] ?? 1) : amount;
  return String(normalized);
}

function extractPriceHint(value: string): string {
  const matches = Array.from(
    value.matchAll(
      /(?:\$|₦|€|£|USD|NGN|EUR|GBP|KES|ZAR|RWF|GHS|MAD|AED|CAD|AUD)?\s*(\d[\d,]*(?:\.\d{1,4})?(?:\s*[kKmMbB])?)/gi,
    ),
  ).map((match) => normalizePriceInput(match[1] ?? ""));

  const valid = matches.filter(
    (candidate) => !!candidate && Number.isFinite(Number(candidate)),
  );
  if (!valid.length) return "";

  return valid.reduce((best, candidate) => {
    const bestValue = Number(best);
    const candidateValue = Number(candidate);
    return candidateValue > bestValue ? candidate : best;
  });
}

function extractMetadataFromHtml(html: string): Partial<ExtractedProductInfo> {
  const normalize = (value: string) =>
    sanitizeText(value.replace(/<[^>]+>/g, " "));
  const metaTitle =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ??
    html.match(
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDescription =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ??
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );

  const productName = normalize((metaTitle?.[1] ?? title?.[1] ?? "").trim());
  const description = normalize(metaDescription?.[1] ?? "");
  const price = extractPriceHint(html);

  return {
    productName: productName || "Product details",
    price: price || "",
    description: description || productName || "Product details",
  };
}

export async function extractProductInfoFromLink(
  link: string,
): Promise<ExtractedProductInfo> {
  const cleanedLink = link.trim();
  if (!cleanedLink) {
    throw new Error("Add a valid link first.");
  }

  let pageHtml = "";
  try {
    const response = await fetch(cleanedLink, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0",
      },
    });
    pageHtml = await response.text();
  } catch {
    pageHtml = "";
  }

  const htmlInfo = pageHtml ? extractMetadataFromHtml(pageHtml) : {};

  if (apiKey) {
    try {
      const prompt = [
        "You are extracting product details from a product listing URL.",
        "Return JSON only with keys: productName, price, description.",
        "If you cannot determine the price, use an empty string.",
        "Use the page content when available and prefer a short, natural description.",
        `URL: ${cleanedLink}`,
        pageHtml ? `Page preview: ${pageHtml.slice(0, 3500)}` : "",
      ].join("\n");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = (await response.json()) as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("")
          .trim();

        if (text) {
          const parsed = parseJson(text) as Partial<ExtractedProductInfo>;
          const productName = sanitizeText(
            String(
              parsed.productName || htmlInfo.productName || "Product details",
            ),
          );
          const price = sanitizeText(
            String(parsed.price || htmlInfo.price || ""),
          );
          const description = sanitizeText(
            String(parsed.description || htmlInfo.description || productName),
          );
          return {
            productName,
            price,
            description,
          };
        }
      }
    } catch {
      // Fall back to metadata extraction below.
    }
  }

  const fallbackProductName = sanitizeText(
    String(htmlInfo.productName || "Product details"),
  );
  const fallbackPrice = sanitizeText(String(htmlInfo.price || ""));
  const fallbackDescription = sanitizeText(
    String(htmlInfo.description || fallbackProductName || "Product details"),
  );

  return {
    productName: fallbackProductName,
    price: fallbackPrice,
    description: fallbackDescription,
  };
}

export async function analyzePrice(
  input: AnalyzePriceInput,
): Promise<NewPriceCheck> {
  if (!apiKey) {
    throw new Error(
      "Gemini is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your environment.",
    );
  }

  const prompt = [
    "Analyze this product listing for a buyer.",
    "Extract the product, compare the listed price with the likely current market range, and give a complete summary and verdict.",
    "Use evidence from the user input and the linked page. If evidence is weak, use suspicious and explain why.",
    "Return JSON only. Prices must be numbers in the listing currency, without symbols.",
    `Description: ${input.description?.trim() || "(none)"}`,
    `Listed price: ${input.price?.trim() || "(not provided)"}`,
    `Link: ${input.link?.trim() || "(none)"}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status}).`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned an empty analysis.");

    const result = parseJson(text);
    const verdict = result.verdict;
    if (
      !["goodDeal", "fair", "overpriced", "suspicious"].includes(
        String(verdict),
      )
    ) {
      throw new Error("Gemini returned an invalid verdict.");
    }

    return {
      productName: String(result.productName),
      pricePaid: Number(result.pricePaid),
      marketLow: Number(result.marketLow),
      marketHigh: Number(result.marketHigh),
      verdict: verdict as Verdict,
      reasoning: String(result.reasoning),
      source: input.link?.trim() ? "link" : "manual",
      sourceUrl: input.link?.trim() || undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini request failed.";
    console.error(error);
    throw new Error(`Gemini request failed. ${message}`);
  }
}
