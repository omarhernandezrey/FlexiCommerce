export const IMAGES = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_1Sie96e41ErWsdj8J7B7nGRPhe1SUhAfa-TTEgtrsDGNFxUxy90qZFQ5-As4UHVaD_RZhlR5Eb5bV8QBx94Tqqxoru602-RRLiK7vGj77xj_mwUSrg27g1Xe6URohoyy5yDYmvSAcm5W1aa3uIPE9ERADvbOrerJj493RosqlqLO83m-XR1_OfdmDzwS_k9MdUZvgTCQuwJPRDmLe26kyCWjyaL4EzbueU5hsZZGaRMiZdljCZg2g1YxYBdxqJe_B3auzV2HX44',
  userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUS6FsNkRc1s6_lXrtdQ9DkZwYF2SKw2RRL61uYzb0TEmAZxluqOjqUpJXkJfOm8BJjc9ANsD55pN47zvZr3-BaTPwDdfYyu3Kc7xqel3jkko11wlbJhawopEWUJ-OzyYMvZuI-POvBLbDQAA9hhNAz3iBvSZ-4tlINDqdqrnrand5e-BO8YgsDdeuF1lqPZE9OFny25-TwsOmTc1wA7qB-oO19VPA8USJdT9DhRp6d8t9w1tznOpIX5tto3B1K57Ma-0421cUB_k',
  analytics: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIy0gcHjwNSDqx62eBXIDCkKKbr1ZP1NYQJHKwE_bqBESTOE3udHLpRSACwXaeKlkW-TntKk5O5qedbaXfYis_tMoZ_RgQgTZCJHEuv_Mn_GSEUSZ3Jpfta0YO-i_0hmNHU6AbziO7hSPgHoEnsesnFDiE1piapFsOtIx5OpbX1U5Cby65f4KoV7L45cdYVrTOoAWt6MW_2Fxl-865DYWADWDC6e2eiW7_c2cU8FpLBAo6eXPRQ24nk9uF_DEtemAnHbLe5Ax4GiA',
  categories: {
    electronics: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqQhrhSQDw2c2s85SnDW8214Jht8Qkd8MxRx3L9OMCC7MHCp9f8fl31kpG-pciw_EoxNt8NNWiVxAxMnkaHLPaxEpka1w4DKSpbWBgF2uZIAt5jaC-MN6dVXtCOUxzRvO-Ykx5f1geVlkXDZlccb7uny5-5E2JjsPYMYTACs905CbfXuUKIwOglQGU1r--_oBrph6G5yWgdehmJS9eVB2rXtWpON65M7m8wqN8qxikt7Ru7_lt2OM1ZQG4HA1hEQR8bU3ESBs4qlo',
    fashion: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACCX4x-MyluX35o1uhl607qynsXtf0cw-5u6coEsw1fpqedijXVN5sdDduchqjFwUS5cf53rhjpxi78YAgM_-7tvBG7oaRrwExh61l2xrh7HQkPO1JE-FQUqmt66F3bkjH3bRoXCmXtwylVkXOoqGrouBst4Y2H_xKDHgdkSWBh2wCtSvtrn9fNhwv4EeH9XAc3hjcaULK4wP3bVE68zZP83OX9OUl5qlcGtcDRlWIpuwQs5Xz6BhXHUkABqknSEj_bKbrn_3qhQg',
    homeDecor: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhDmsJV7cztEXFlKYjUMAtq6dTpGxy6DKZE0C8dQPKOzoHbPoL2bqncIpyBdKQi8C10Sn6xvSYNzE-by9810xRF9rls_g7tXL9gRJYXhseAIoUoIYnr1lmkS1Z_C60dGW4w7FuxrKmWsiNKbw7ea0jQzjxIRoz94O3h6EDtUnThCN9u9bFeWWJPyk5PFm_s8Bgv97dZ_QoomeKiQogpVgSwGCxKuXHtWdS1B2Q-4S5QUEHd3sssWi9Tqve7lLLYtULFnCdaa9pLso',
    gadgets: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB40ADmCL3ZGNn9LOW7r_kZiY7hVabvbzsieP81spovW_3iPuVXSz9LRWbvc0JjkP7irrF8WumgAvC5MFsZOVOIG6narz1aINM06ZOh5c8Tn9c7mKYW3QL-d7xOhGi1w5S8q0fvADhIgww1ujEGHP_FBR8hKgT0uYxhu-RgIMCBL0uLUtdTsKulkvJ7fFwTbgtQilL0ORtVpaQN1piV1ng3eAuoMsO_kdTwDaovPMicycXOaOk5SiQ5FPMYxR-jjsPqg5vcgJMtthM',
  },
};

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    name: 'Acoustic Pro-X Wireless',
    category: 'Electronics',
    price: 299.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsRLZqCj7FPTBBjxRBIsAeCWi9IS2fOgBb2GtswkIb91SPBGd67oY_qXeVNoLs7hxAHHKLkm62G8xRgmoQkPpuq9R196SIDVxGNaMuFjgga0h4mZtpp6UJ7fLI9vFIYumBkt6P0jaXsGtkRlV5MgVDKzZ564IOgSSPeFkbHLtotiT1inZGj1NcudW1L_f8bJidqpsWVXE9N0dCy8hyXOqggp-4W7MS2tUQpBnlznJ4cTgrmyAvVVIgtq3118P9cs-U8l_uWZD6pc',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsRLZqCj7FPTBBjxRBIsAeCWi9IS2fOgBb2GtswkIb91SPBGd67oY_qXeVNoLs7hxAHHKLkm62G8xRgmoQkPpuq9R196SIDVxGNaMuFjgga0h4mZtpp6UJ7fLI9vFIYumBkt6P0jaXsGtkRlV5MgVDKzZ564IOgSSPeFkbHLtotiT1inZGj1NcudW1L_f8bJidqpsWVXE9N0dCy8hyXOqggp-4W7MS2tUQpBnlznJ4cTgrmyAvVVIgtq3118P9cs-U8l_uWZD6pc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCXTpVfxs1db62dokgKW758D77TDsVrhik1b_aLd5Ye3ogBXIo1XStPxpPoknzerd4ofRur1xQRSQvBrmSCsc0kprITAkRNjKvMbEH-6bXmBnzSt9h1Fym9uxPBvTJOiIp0FKH0IHFhjvXLqiKGIxwsKqp1xn0h15lbyR8THDHy8yGkqmZt9lRaaeuM0244zooz2tK5pLu8E2WY0RypRMtT_3_SBKAqBSuX7Rxu99KljBMAoT0vODTpz3_s_bLVYjjIv99WRTpQskk',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3STeNq8civLDlVuPkmcTIQ4SDguNu93vf1LqpN1q4q-I2_Ko_hjWygl9plMApINyRVzOeWPmjmfoNBLH6Zg1hb_O5Ns03-I6A9938zh2TTXfwdCOZAviCeCRhPKXZTaOokCxgbsEekLITcAsWOSR29RwNeru0mUDeOAJSj7YGEOKdTKLz5Kr7mX2IJ3z0HsKqieOn47XbSTb2j9mBJbQ8A9eI4rJdwrw-2uQaj5F-61WjYBKdmDOZorXciPE3JuF38UIDNCfxvWw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDk0b44OIdiuwXlXuwCj5ZV6koSwVR_i755DwBvADCbY3y5fJ4bp_V4G1IwwjQJvoc8Cy1R4r4zduQdrh4R2x09X4nPcR2P3mNf99iSfmAvJVu1M5phK7-8ZWfMP8tu_1ExZI1ZkwB3EDzxdvI6l9FLC5w_WGqkGSNSQQEFW_TPQ1r2u6ujUB4FFwS3mubBb9YG_IsHGJVLRV9_01sw5av817xaQ08Uiz34mDwLGD7Rzw7JIb6GxhWeS3y1Iv9KHU6M5SxlrsFFI5o',
    ],
    rating: 4.5,
    reviews: 128,
  },
  {
    id: '2',
    name: 'Series 8 Fusion Watch',
    category: 'Tech',
    price: 189.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXTpVfxs1db62dokgKW758D77TDsVrhik1b_aLd5Ye3ogBXIo1XStPxpPoknzerd4ofRur1xQRSQvBrmSCsc0kprITAkRNjKvMbEH-6bXmBnzSt9h1Fym9uxPBvTJOiIp0FKH0IHFhjvXLqiKGIxwsKqp1xn0h15lbyR8THDHy8yGkqmZt9lRaaeuM0244zooz2tK5pLu8E2WY0RypRMtT_3_SBKAqBSuX7Rxu99KljBMAoT0vODTpz3_s_bLVYjjIv99WRTpQskk',
    rating: 5,
    reviews: 45,
  },
  {
    id: '3',
    name: 'Apex Runner V2',
    category: 'Sports',
    price: 120.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3STeNq8civLDlVuPkmcTIQ4SDguNu93vf1LqpN1q4q-I2_Ko_hjWygl9plMApINyRVzOeWPmjmfoNBLH6Zg1hb_O5Ns03-I6A9938zh2TTXfwdCOZAviCeCRhPKXZTaOokCxgbsEekLITcAsWOSR29RwNeru0mUDeOAJSj7YGEOKdTKLz5Kr7mX2IJ3z0HsKqieOn47XbSTb2j9mBJbQ8A9eI4rJdwrw-2uQaj5F-61WjYBKdmDOZorXciPE3JuF38UIDNCfxvWw',
    rating: 4,
    reviews: 92,
  },
  {
    id: '4',
    name: 'Urban Canvas Loafers',
    category: 'Lifestyle',
    price: 65.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk0b44OIdiuwXlXuwCj5ZV6koSwVR_i755DwBvADCbY3y5fJ4bp_V4G1IwwjQJvoc8Cy1R4r4zduQdrh4R2x09X4nPcR2P3mNf99iSfmAvJVu1M5phK7-8ZWfMP8tu_1ExZI1ZkwB3EDzxdvI6l9FLC5w_WGqkGSNSQQEFW_TPQ1r2u6ujUB4FFwS3mubBb9YG_IsHGJVLRV9_01sw5av817xaQ08Uiz34mDwLGD7Rzw7JIb6GxhWeS3y1Iv9KHU6M5SxlrsFFI5o',
    rating: 4,
    reviews: 210,
  },
];

export const CATEGORIES = [
  { name: 'Electronics', items: '1.2k+', image: IMAGES.categories.electronics },
  { name: 'Fashion', items: '3.5k+', image: IMAGES.categories.fashion },
  { name: 'Home Decor', items: '800+', image: IMAGES.categories.homeDecor },
  { name: 'Smart Gadgets', items: '450+', image: IMAGES.categories.gadgets },
];

export const NAV_LINKS = [
  { label: 'Electronics', hasDropdown: true },
  { label: 'Fashion', hasDropdown: true },
  { label: 'Home & Living', hasDropdown: false },
  { label: 'Beauty', hasDropdown: false },
  { label: 'Sports', hasDropdown: false },
];

export const FOOTER_LINKS = {
  shop: [
    'Featured Arrivals',
    'Electronic Gadgets',
    'Luxury Fashion',
    'Home Interior',
    'Exclusive Collections',
  ],
  company: [
    'About FlexiCommerce',
    'Platform Features',
    'Partner Program',
    'B2B Solutions',
    'Careers',
  ],
  support: [
    'Customer Center',
    'Shipping & Delivery',
    'Returns Policy',
    'Secure Payments',
    'Contact Us',
  ],
};
