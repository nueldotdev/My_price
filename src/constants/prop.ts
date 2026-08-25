import { ImageSourcePropType } from "react-native";

export interface Prop {
  style?: object;
}

export type Verdict = "goodDeal" | "fair" | "overpriced" | "suspicious";

export type card = {
  id: number;
  recordedAt: string;
  img?: ImageSourcePropType;
  original_price?: number;
  suggested_price?: number;
  title?: string;
  summary: string;
  details?: string[];
  verdict: Verdict;
};
