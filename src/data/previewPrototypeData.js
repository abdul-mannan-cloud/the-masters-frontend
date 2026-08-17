// TEMPORARY PROTOTYPE DATA
// Replace with tenant-configured preview assets in production.
//
// Backs the Super Admin-only visual prototype at src/pages/PreviewPrototype.jsx,
// which demonstrates the Product Type -> Selected Options -> Preview Enabled
// -> Garment Preview flow before real per-tenant garment assets exist. Every
// image below is a publicly accessible, non-branded photo (Wikimedia Commons /
// Flickr, Creative Commons licensed) used purely for illustration.
//
// This is intentionally NOT the same shape as the real preview architecture
// (Models/ProductType.js `preview.baseImage` + `preview.layers[]`, rendered by
// components/GarmentPreview.jsx) — that system layers per-option-value images
// over a base garment and is driven by real tenant-uploaded assets. This file
// is a flat, one-image-per-product stand-in so the demo doesn't require
// building a matching layered asset set just to look right. Nothing here is
// imported by, or written into, the real order/preview flow.
//
// All images are hosted on live.staticflickr.com (Flickr's own CDN, built
// for hotlinking) rather than upload.wikimedia.org — Wikimedia's file CDN
// rate-limits/blocks repeated hotlinked requests without a registered,
// descriptive User-Agent, which made images intermittently fail to load in
// the browser during development even though the URLs were individually
// valid. Flickr's CDN doesn't have that problem for this kind of use.

export const DEMO_CUSTOMER = {
  name: "Ahmed Khan",
  orderNumber: "DEMO-1001",
};

export const prototypePreviewProducts = [
  {
    productType: "Men's Kameez",
    image: "https://live.staticflickr.com/2932/33383192894_8a782b2e9b_b.jpg",
    previewEnabled: true,
    options: { Neck: "Chinese Collar", Sleeves: "Long", Length: "Long", Pocket: "Single" },
    measurements: { Chest: 42, Shoulder: 18, Sleeves: 24, Length: 40 },
    fabric: "White Cotton",
    price: 3500,
  },
  {
    productType: "Men's Shalwar",
    image: "https://live.staticflickr.com/45/140235601_0f3d151803_b.jpg",
    previewEnabled: true,
    options: { Waist: "Elastic + Drawstring", Style: "Straight Cut", Pocket: "Double" },
    measurements: { Waist: 34, Length: 41, Bottom: 16 },
    fabric: "Grey Cotton Blend",
    price: 1800,
  },
  {
    productType: "Women's Kameez",
    image: "https://live.staticflickr.com/4040/4386305761_3fb85fb4f9_b.jpg",
    previewEnabled: true,
    options: { Neck: "V-Neck", Sleeves: "3/4 Sleeve", Length: "Knee Length", Embroidery: "Zardozi" },
    measurements: { Chest: 36, Shoulder: 14, Sleeves: 16, Length: 38 },
    fabric: "Embroidered Lawn",
    price: 4200,
  },
  {
    productType: "Women's Shalwar",
    image: "https://live.staticflickr.com/7161/6387773781_8b4f9c4005_b.jpg",
    previewEnabled: true,
    options: { Style: "Patiala", Waist: "Elastic" },
    measurements: { Waist: 30, Length: 39, Bottom: 14 },
    fabric: "Cotton Lawn",
    price: 1600,
  },
  {
    productType: "Women's Frock",
    image: "https://live.staticflickr.com/2765/5791667380_bd84a6a133_b.jpg",
    previewEnabled: true,
    options: { Neck: "Round Neck", Sleeves: "Full Sleeve", Style: "A-Line" },
    measurements: { Chest: 34, Shoulder: 13, Sleeves: 22, Length: 42 },
    fabric: "Printed Chiffon",
    price: 3900,
  },
  {
    productType: "Men's Waistcoat",
    image: "https://live.staticflickr.com/7334/15792949914_91ff7585a8_b.jpg",
    previewEnabled: true,
    options: { Buttons: "4 Button", Pocket: "Double Welt", Fit: "Slim Fit" },
    measurements: { Chest: 40, Shoulder: 17, Length: 25 },
    fabric: "Black Suiting",
    price: 2200,
  },
  {
    productType: "Trouser",
    image: "https://live.staticflickr.com/1605/26002440912_0878d8b2cf_b.jpg",
    previewEnabled: true,
    options: { Style: "Flared", Waist: "Belted", Pocket: "Side" },
    measurements: { Waist: 34, Hip: 40, Length: 41 },
    fabric: "Navy Twill",
    price: 2000,
  },
  {
    productType: "Dupatta",
    image: "https://live.staticflickr.com/7156/6780878913_eabe678869_b.jpg",
    // Off by default here on purpose — illustrates the "no preview configured
    // for this product type yet" state the real GarmentPreview also has to
    // handle (see its `hasBaseImage` check), not every demo entry is enabled.
    previewEnabled: false,
    options: { Style: "Chiffon", Border: "Lace Trim" },
    measurements: { Length: 90, Width: 40 },
    fabric: "Chiffon",
    price: 900,
  },
];
