export const categories = [
  "All",
  "Desktop",
  "Laptop",
  "Component",
  "Monitor",
  "Power",
  "Phone",
  "Tablet",
  "Office Equipment",
  "Camera",
  "Security",
  "Networking",
  "Software",
  "Server & Storage",
  "Accessories",
  "Gadget",
  "Gaming",
  "TV",
  "Appliance",
];

export const brands = [
  "All",
  "Intel",
  "AMD",
  "ASUS",
  "MSI",
  "Corsair",
  "GIGABYTE",
  "Samsung",
  "Hikvision",
  "TP-Link",
  "Apple",
];

export const navCategories = categories.filter((category) => category !== "All");

export const coupons = {
  TECH24: { type: "fixed", value: 1000, minTotal: 20000 },
  STARBUILD: { type: "percent", value: 5, minTotal: 50000 },
};

export const stores = [
  {
    name: "IDB Bhaban Branch (Flagship)",
    address: "Shop # SR-401 & 402, 4th Floor, BCS Computer City, Agargaon, Dhaka-1207",
    phone: "+880 1711-TECH24",
  },
  {
    name: "Multiplan Center Branch",
    address: "Shop # 312-315, Level 3, Multiplan Center, Elephant Road, Dhaka-1205",
    phone: "+880 1819-TECH24",
  },
  {
    name: "Uttara Experience Hub",
    address: "House # 08, Sector # 03, Uttara Tower, Level 4, Uttara, Dhaka-1230",
    phone: "+880 1912-TECH24",
  },
  {
    name: "Agrabad Chattogram Outlet",
    address: "Level 2, Akhtaruzzaman Center, 21/22 Agrabad C/A, Chattogram",
    phone: "+880 1313-TECH24",
  },
];

export const defaultUser = {
  isLoggedIn: false,
  name: "Anisur Rahman",
  email: "anisur.tech@gmail.com",
  phone: "01711223344",
  address: "House 42, Road 11, Block D, Banani, Dhaka-1213",
};

export const defaultFilters = {
  category: "All",
  brand: "All",
  searchQuery: "",
  maxPrice: 300000,
  inStockOnly: false,
  sortBy: "featured",
};

export function filterProducts(products, filters) {
  return products
    .filter((product) => {
      if (filters.category !== "All") {
        const slugs = product.category_slugs?.length ? product.category_slugs : [product.category_slug];
        if (!slugs.includes(filters.category)) return false;
      }
      if (filters.brand !== "All" && product.brand !== filters.brand) return false;
      if (Number(product.price) > Number(filters.maxPrice || 0)) return false;
      if (filters.inStockOnly && product.stock <= 0) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const haystack = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });
}
