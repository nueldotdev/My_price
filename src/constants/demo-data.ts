import { card } from "@/constants/prop";

const demoImage = require("../../assets/images/android-icon-background.png");

export const cardList: card[] = [
  {
    id: 1,
    recordedAt: "2026-08-25T14:35:00",
    img: demoImage,
    original_price: 279,
    suggested_price: 349,
    title: "Sony WH-1000XM5 Headphones",
    summary:
      "A strong price for Sony's flagship noise-cancelling headphones. The XM5 offers excellent sound, long battery life, and comfortable all-day wear.",
    details: ["Wireless noise cancellation", "Up to 30 hours of battery life"],
    verdict: "goodDeal",
  },
  {
    id: 2,
    recordedAt: "2026-08-25T11:20:00",
    img: demoImage,
    original_price: 299,
    suggested_price: 299,
    title: "Apple Watch Series 9",
    summary:
      "This matches the current market average. It is a reasonable purchase when the condition is good and the battery health is still strong.",
    details: ["45mm aluminum case", "GPS model"],
    verdict: "fair",
  },
  {
    id: 3,
    recordedAt: "2026-08-25T09:05:00",
    img: demoImage,
    original_price: 379,
    suggested_price: 349,
    title: "Nintendo Switch OLED",
    summary:
      "The asking price is a little above the typical market average. Check whether games, accessories, or a warranty are included before buying.",
    details: ["OLED display", "Includes original dock"],
    verdict: "overpriced",
  },
  {
    id: 4,
    recordedAt: "2026-08-24T16:45:00",
    img: demoImage,
    original_price: 449,
    suggested_price: 699,
    title: "Dyson V15 Detect Vacuum",
    summary:
      "A notably low price compared with similar listings. Confirm the battery condition and included attachments before completing the purchase.",
    details: ["Laser dust detection", "Cordless stick vacuum"],
    verdict: "goodDeal",
  },
  {
    id: 5,
    recordedAt: "2026-08-24T10:15:00",
    img: demoImage,
    original_price: 129,
    suggested_price: 119,
    title: "Le Creuset Cast Iron Skillet",
    summary:
      "This skillet is priced slightly above comparable listings. Inspect the enamel for chips and ask whether the original receipt is available.",
    details: ["Enameled cast iron", "10.25-inch cooking surface"],
    verdict: "overpriced",
  },
  {
    id: 6,
    recordedAt: "2026-08-23T13:40:00",
    img: demoImage,
    original_price: 119,
    suggested_price: 149,
    title: "Kindle Paperwhite 16GB",
    summary:
      "A good price for a recent Paperwhite in working condition. Verify that the screen has no dead spots and that the device is not account locked.",
    details: ["6.8-inch glare-free display", "Waterproof design"],
    verdict: "goodDeal",
  },
  {
    id: 7,
    recordedAt: "2026-08-23T08:30:00",
    img: demoImage,
    original_price: 89,
    suggested_price: 99,
    title: "Patagonia Better Sweater Fleece",
    summary:
      "The price is below the usual market average for this fleece. Look for pilling, stains, and the condition of the zipper before making an offer.",
    details: ["Recycled polyester fleece", "Full-zip jacket"],
    verdict: "goodDeal",
  },
];
