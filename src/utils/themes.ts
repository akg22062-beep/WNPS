export interface WebsiteTheme {
  name: string;
  primary: string;
  primaryHover: string;
  accent: string;
  accentHover: string;
  soft: string;
  softBorder: string;
}

export const WEBSITE_THEMES: WebsiteTheme[] = [
  { name: 'Template 1', primary: '#4F6D7A', primaryHover: '#415A65', accent: '#89A894', accentHover: '#789683', soft: '#F2F4F2', softBorder: '#E2E8E2' },
  { name: 'Template 2', primary: '#1D4ED8', primaryHover: '#1E40AF', accent: '#60A5FA', accentHover: '#3B82F6', soft: '#EFF6FF', softBorder: '#BFDBFE' },
  { name: 'Template 3', primary: '#047857', primaryHover: '#065F46', accent: '#34D399', accentHover: '#10B981', soft: '#ECFDF5', softBorder: '#A7F3D0' },
  { name: 'Template 4', primary: '#7C3AED', primaryHover: '#6D28D9', accent: '#C084FC', accentHover: '#A855F7', soft: '#F5F3FF', softBorder: '#DDD6FE' },
  { name: 'Template 5', primary: '#BE123C', primaryHover: '#9F1239', accent: '#FB7185', accentHover: '#F43F5E', soft: '#FFF1F2', softBorder: '#FECDD3' },
  { name: 'Template 6', primary: '#B45309', primaryHover: '#92400E', accent: '#FBBF24', accentHover: '#F59E0B', soft: '#FFFBEB', softBorder: '#FDE68A' },
  { name: 'Template 7', primary: '#0F766E', primaryHover: '#115E59', accent: '#2DD4BF', accentHover: '#14B8A6', soft: '#F0FDFA', softBorder: '#99F6E4' },
  { name: 'Template 8', primary: '#4338CA', primaryHover: '#3730A3', accent: '#818CF8', accentHover: '#6366F1', soft: '#EEF2FF', softBorder: '#C7D2FE' },
  { name: 'Template 9', primary: '#9F1239', primaryHover: '#881337', accent: '#F472B6', accentHover: '#EC4899', soft: '#FDF2F8', softBorder: '#FBCFE8' },
  { name: 'Template 10', primary: '#334155', primaryHover: '#1E293B', accent: '#94A3B8', accentHover: '#64748B', soft: '#F8FAFC', softBorder: '#CBD5E1' },
];
