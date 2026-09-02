# My Price

My Price is a simple shopping helper for people who want a little more confidence before they buy. You can save a product idea, add the price, and check whether it looks like a good deal or something worth walking away from.

It is built for quick, everyday decision-making: snap a photo, paste a product link, add a few details, and the app gives you a quick summary of what the item might be worth and whether the price feels fair.

## What the app does

- Add a product description, listed price, and optional product link
- Upload a photo or take one from the camera
- Get a quick verdict on whether the price looks like a good deal, fair, overpriced, or suspicious
- Review past checks and keep a history of items you’ve looked at
- Open a saved product summary to see the reasoning behind the verdict

The experience is intentionally lightweight and practical. It feels more like a smart shopping assistant than a heavy product catalog.

## Why it exists

A lot of shopping decisions happen in a hurry. You see a product, wonder if the price is okay, and want a second opinion without doing a bunch of research yourself.

My Price helps with that by turning a few details into a clear, usable summary. It’s especially handy for comparing marketplace listings, checking pricing patterns, and keeping track of products you’ve already reviewed.

## Getting started

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Add your Gemini API key to a local environment file:

   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key
   ```

   Make sure this file is in the project root as `.env`.

3. Start the app:

   ```bash
   npx expo start
   ```

4. Open it in Expo Go, an emulator, or a simulator.

## How to use it

- Open the app and tap the add button
- Enter a product description or paste a product link
- Add the price if you know it
- Optional: attach a photo for extra context
- Submit the item and let the app review it
- Check the saved result in your product list

From there, you can revisit earlier checks and compare how each item was evaluated.

## Notes

This app uses Gemini to help interpret product details and pricing context. For a real production app, you would typically keep that API logic behind a safer backend layer instead of exposing the key directly on the client.

## Tech stack

- Expo / React Native
- TypeScript
- Expo Router
- SQLite for saved results
- Gemini for product analysis

## License

This project is licensed under the MIT License.
