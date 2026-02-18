# React Native Mobile App

FlexiCommerce mobile application built with Expo and React Native.

## Setup

```bash
cd mobile
npm install
# or
yarn install
```

## Development

```bash
npm run dev
# or for specific platforms
npm run android
npm run ios
npm run web
```

## Project Structure

```
mobile/
├── app/                    # Expo Router navigation structure
│   ├── (auth)/            # Authentication screens (login/register)
│   ├── (app)/             # Main app screens (tab-based)
│   └── index.tsx          # Root/splash screen
├── components/            # Reusable UI components
├── lib/                   # Utilities and services
├── store/                 # Zustand stores (auth, cart)
├── assets/                # Icons, images, fonts
└── app.json              # Expo configuration
```

## Features

- **Authentication**: Login/Register with secure token storage
- **Product Catalog**: Browse products with search functionality
- **Shopping Cart**: Add/remove items with persistent storage
- **Product Reviews**: View and submit product ratings
- **Personalized Recommendations**: ML-powered product suggestions
- **User Profile**: Manage account and orders
- **Notifications**: Push notifications for orders

## Technologies

- React Native 0.73
- Expo 51
- Expo Router (Navigation)
- TypeScript
- Zustand (State Management)
- Axios (API Client)
- React Query (Data Fetching)
