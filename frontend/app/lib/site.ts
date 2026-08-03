const fallbackSiteUrl = 'http://localhost';

export function getSiteUrl(): URL {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredSiteUrl || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
