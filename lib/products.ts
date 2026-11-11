
export type Product = {
  slug: string;
  name: string;
  group: "whole" | "ground" | "combo";
  blurb: string;
  sizes: string[];
  image?: string;
};

export const GROUPS = [
  {
    id: "whole",
    title: "Whole Spices",
    intro: "Carefully selected, hygienically packed. Use whole or grind fresh.",
  },
  {
    id: "ground",
    title: "Ground Spices",
    intro: "Finely ground and ready to use, with no extra grinding.",
  },
  {
    id: "combo",
    title: "Combo Packs",
    intro: "Our everyday essentials together in one pack.",
  },
] as const;

export const PRODUCTS: Product[] = [
  {
    slug: "cardamom",
    name: "Cardamom",
    group: "whole",
    blurb: "Plump green pods with a sweet, floral aroma for chai, rice and desserts.",
    sizes: [],
    image: "cardamom",
  },
  {
    slug: "black-pepper",
    name: "Black Pepper",
    group: "whole",
    blurb: "Bold, pungent peppercorns for curries, soups, rice dishes and marinades.",
    sizes: ["50 g", "100 g", "200 g", "250 g"],
    image: "black-pepper",
  },
  {
    slug: "cloves",
    name: "Cloves",
    group: "whole",
    blurb: "Warm, rich aroma for tea, biryani, curries and festive recipes.",
    sizes: ["50 g", "100 g", "200 g", "250 g"],
    image: "cloves",
  },
  {
    slug: "cinnamon-sticks",
    name: "Cinnamon Sticks",
    group: "whole",
    blurb: "Naturally warm and aromatic sticks for tea, coffee, desserts and curries.",
    sizes: ["100 g", "150 g", "250 g"],
    image: "cinnamon-sticks",
  },
  {
    slug: "star-anise",
    name: "Star Anise",
    group: "whole",
    blurb: "A licorice-like aroma that lifts biryani, slow-cooked meals and garam masala.",
    sizes: ["60 g", "100 g", "200 g", "250 g"],
    image: "star-anise",
  },
  {
    slug: "cardamom-powder",
    name: "Cardamom Powder",
    group: "ground",
    blurb: "Fresh ground and sweetly aromatic, for tea, milk drinks, desserts and baking.",
    sizes: ["50 g", "100 g", "200 g", "250 g"],
    image: "cardamom-powder",
  },
  {
    slug: "pepper-powder",
    name: "Black Pepper Powder",
    group: "ground",
    blurb: "Finely ground with bold aroma, ready to blend into curries, soups and sauces.",
    sizes: ["80 g", "100 g", "150 g", "250 g"],
    image: "black-pepper-powder",
  },
  {
    slug: "cinnamon-powder",
    name: "Cinnamon Powder",
    group: "ground",
    blurb: "Smooth, warm powder that mixes easily into baking, beverages and everyday cooking.",
    sizes: ["50 g", "100 g", "200 g", "250 g"],
    image: "cinnamon-powder",
  },
  {
    slug: "black-coffee-powder",
    name: "Black Coffee Powder",
    group: "ground",
    blurb: "Dark, aromatic coffee powder. Message us for sizes and availability.",
    sizes: [],
    image: "black-coffee-powder",
  },
  {
    slug: "combo-3-powders",
    name: "Cardamom, Cinnamon & Pepper Powder Combo",
    group: "combo",
    blurb: "Three essential powders for tea, desserts, rice and curries.",
    sizes: ["3 × 100 g"],
    image: "spices-combo",
  },
  {
    slug: "combo-pepper-cardamom",
    name: "Pepper & Cardamom Whole Spice Combo",
    group: "combo",
    blurb: "Whole black pepper and green cardamom for chai blends and kitchen staples.",
    sizes: [],
    image: "pepper-cardamom-combo",
  },
];
