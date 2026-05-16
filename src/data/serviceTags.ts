export const SERVICE_TAGS = [
  { en: 'Graphic Design', ar: 'تصميم جرافيك' },
  { en: 'Branding', ar: 'هوية بصرية' },
  { en: 'UI/UX Design', ar: 'تصميم واجهات' },
  { en: 'Web Development', ar: 'تطوير مواقع' },
  { en: 'Mobile Design', ar: 'تصميم تطبيقات' },
  { en: 'Printing', ar: 'طباعة' },
  { en: 'Social Media', ar: 'سوشيال ميديا' },
  { en: 'Motion Graphics', ar: 'موشن جرافيك' },
];

// Quick lookup: English tag name → Arabic translation
export const SERVICE_TAG_AR: Record<string, string> = {};
SERVICE_TAGS.forEach(tag => {
  SERVICE_TAG_AR[tag.en] = tag.ar;
});

// Helper: normalize services from Firestore (could be string or string[])
export function normalizeServices(services: string | string[] | undefined): string[] {
  if (!services) return [];
  if (Array.isArray(services)) return services;
  // Old format: comma-separated string
  return services.split(',').map(s => s.trim()).filter(Boolean);
}
