"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useStore } from "@/components/StoreProvider";

const EXPLORE_ITEMS = [
  {
    href: "/collections",
    title: "Products",
    eyebrow: "Curated edit",
    description: "Browse pieces chosen for craft, restraint, and everyday ritual.",
  },
  {
    href: "/about",
    title: "About",
    eyebrow: "Our story",
    description: "Learn how Orwas blends heritage, material, and quiet modern living.",
  },
  {
    href: "/journal",
    title: "Journal",
    eyebrow: "Notes & ideas",
    description: "Read the thinking behind the collections, materials, and makers.",
  },
];

const BRAND_COLLECTIONS = [
  {
    id: "clark-desert-boot",
    name: "Clarks Desert Boot",
    description: "British heritage footwear — iconic since 1950",
    price: 8500,
    originalPrice: 12000,
    stock: "in-stock",
    stockCount: 15,
    delivery: "24hr",
    badge: "Best Seller",
    image: "/collections/clark.jpeg",
    collection: "Heritage",
    inventory: 15,
    category: "Footwear" as const,
  },
  {
    id: "nairobi-street-style",
    name: "Nairobi Street Style",
    description: "Urban culture meets contemporary fashion",
    price: 3500,
    originalPrice: 5000,
    stock: "in-stock",
    stockCount: 8,
    delivery: "24hr",
    badge: "New Arrival",
    image: "/collections/wakadinali.jpeg",
    collection: "Street",
    inventory: 8,
    category: "Clothing" as const,
  },
  {
    id: "clarks-wallabee",
    name: "Clarks Wallabee",
    description: "Timeless suede silhouette — street culture staple",
    price: 7200,
    originalPrice: null,
    stock: "in-stock",
    stockCount: 3,
    delivery: "48hr",
    badge: "Limited",
    image: "/collections/clark-2.jpeg",
    collection: "Heritage",
    inventory: 3,
    category: "Footwear" as const,
  },
  {
    id: "urban-essentials",
    name: "Urban Essentials",
    description: "Everyday pieces for the modern wardrobe",
    price: 2800,
    originalPrice: 3500,
    stock: "in-stock",
    stockCount: 22,
    delivery: "24hr",
    badge: "Popular",
    image: "/collections/collection-1.jpeg",
    collection: "Essentials",
    inventory: 22,
    category: "Clothing" as const,
  },
  {
    id: "heritage-edit",
    name: "Heritage Edit",
    description: "Classic styles reimagined for today",
    price: 4500,
    originalPrice: null,
    stock: "low-stock",
    stockCount: 2,
    delivery: "48hr",
    badge: "Almost Gone",
    image: "/collections/collection-2.jpeg",
    collection: "Heritage",
    inventory: 2,
    category: "Clothing" as const,
  },
  {
    id: "street-culture",
    name: "Street Culture",
    description: "Nairobi-inspired contemporary wear",
    price: 3200,
    originalPrice: 4000,
    stock: "out-of-stock",
    stockCount: 0,
    delivery: "-",
    badge: "Sold Out",
    image: "/collections/collection-3.jpeg",
    collection: "Street",
    inventory: 0,
    category: "Clothing" as const,
  },
  {
    id: "archive-collection",
    name: "Archive Collection",
    description: "Rare finds and vintage pieces",
    price: 5500,
    originalPrice: null,
    stock: "in-stock",
    stockCount: 6,
    delivery: "48hr",
    badge: "Exclusive",
    image: "/collections/collection-4.jpeg",
    collection: "Archive",
    inventory: 6,
    category: "Clothing" as const,
  },
];

export default function CollectionsGrid() {
  const { addToCart } = useStore();

  const handleAddToCart = (product: typeof BRAND_COLLECTIONS[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      collection: product.collection,
      inventory: product.inventory,
      category: product.category,
      description: product.description,
      image: product.image,
    });
  };

  return (
    <Section label="Explore" className="py-section bg-orwas-cream">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-display-lg font-display text-orwas-ink reveal">
            Look through
            <br />
            <span className="text-orwas-clay italic">Our world</span>
          </h2>
          <Button href="/collections" variant="underline" className="reveal">
            Shop all →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXPLORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-sm bg-orwas-sand/40 p-8 reveal transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/70 via-orwas-ink/10 to-transparent opacity-90" />
              <div className="relative z-10">
                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-orwas-amber">
                  {item.eyebrow}
                </p>
                <h3 className="mb-3 font-display text-4xl text-orwas-cream">
                  {item.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-orwas-cream/75">
                  {item.description}
                </p>
                <span className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-orwas-amber">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Brand Collections */}
        <div className="mt-16">
          <h3 className="text-display-md font-display text-orwas-ink mb-8 reveal">
            Brand <span className="text-orwas-clay italic">Collections</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRAND_COLLECTIONS.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-orwas-sand/30 reveal transition-transform duration-500 hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/70 via-orwas-ink/10 to-transparent opacity-90" />
                
                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-block px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                      item.badge === 'Sold Out' ? 'bg-orwas-ink/80 text-orwas-cream' :
                      item.badge === 'Almost Gone' ? 'bg-orwas-amber/90 text-orwas-ink' :
                      item.badge === 'Best Seller' ? 'bg-orwas-amber text-orwas-ink' :
                      'bg-orwas-cream/90 text-orwas-ink'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                )}
                
                {/* Stock Status */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-medium ${
                    item.stock === 'in-stock' ? 'bg-green-500/90 text-white' :
                    item.stock === 'low-stock' ? 'bg-yellow-500/90 text-orwas-ink' :
                    'bg-red-500/90 text-white'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.stock === 'in-stock' ? 'bg-white' :
                      item.stock === 'low-stock' ? 'bg-orwas-ink' :
                      'bg-white'
                    }`} />
                    {item.stock === 'in-stock' ? 'In Stock' :
                     item.stock === 'low-stock' ? `Only ${item.stockCount} left` :
                     'Out of Stock'}
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="font-display text-xl text-orwas-cream mb-1">
                    {item.name}
                  </h4>
                  <p className="text-orwas-cream/75 text-xs mb-2">
                    {item.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orwas-cream font-medium">
                      KSh {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-orwas-cream/50 text-xs line-through">
                        KSh {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Delivery */}
                  <div className="flex items-center gap-1 mb-3">
                    <svg className="w-3 h-3 text-orwas-amber" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                    <span className="text-orwas-cream/80 text-[10px]">
                      {item.delivery === '24hr' ? '24hr Delivery' :
                       item.delivery === '48hr' ? '48hr Delivery' :
                       'Delivery unavailable'}
                    </span>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  {item.stock !== 'out-of-stock' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-orwas-amber hover:bg-orwas-amber-light text-orwas-ink text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orwas-cream/20 hover:bg-orwas-cream/30 text-orwas-cream text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300"
                      >
                        Quick Buy
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-orwas-ink/50 text-orwas-cream/50 text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm cursor-not-allowed">
                      Notify Me
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
