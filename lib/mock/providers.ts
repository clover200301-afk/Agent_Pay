import type { Provider } from "@/types/provider";

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: "vision-api",
    name: "VisionAPI",
    tagline: "High-fidelity image generation",
    priceUsdc: 3.2,
    uptime: 99.98,
    rating: 4.9,
    badge: "Top rated",
  },
  {
    id: "image-forge",
    name: "ImageForge",
    tagline: "Fast, low-cost diffusion",
    priceUsdc: 4.1,
    uptime: 99.82,
    rating: 4.7,
  },
  {
    id: "pixel-mind",
    name: "PixelMind",
    tagline: "Premium photoreal output",
    priceUsdc: 4.9,
    uptime: 99.95,
    rating: 4.8,
  },
];

export function pickCheapest(providers: Provider[] = MOCK_PROVIDERS) {
  return providers.reduce((a, b) => (a.priceUsdc <= b.priceUsdc ? a : b));
}
