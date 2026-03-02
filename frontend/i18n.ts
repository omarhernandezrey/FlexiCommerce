import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

function detectLocale(): Locale {
  // Check cookie first (user preference)
  try {
    const cookieStore = cookies();
    const cookieLocale = cookieStore.get('locale')?.value;
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      return cookieLocale as Locale;
    }
  } catch {
    // cookies() may fail in some contexts
  }

  // Check Accept-Language header
  try {
    const acceptLanguage = headers().get('accept-language') || '';
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (locales.includes(preferredLang as Locale)) {
      return preferredLang as Locale;
    }
  } catch {
    // headers() may fail in some contexts
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = detectLocale();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
