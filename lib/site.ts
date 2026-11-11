export const SITE = {
  name: "Dhavam Spices",
  owner: "Shiyas A",
  email: "dhavamspices@gmail.com",
  phones: [
    { display: "+91 63830 73503", tel: "+916383073503" },
    { display: "+91 81481 23417", tel: "+918148123417" },
  ],
  whatsapp: "916383073503",
  address: ["Casagrand Northern Star,", "Madhavaram, Chennai 600110"],
};

export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
