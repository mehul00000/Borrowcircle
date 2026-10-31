// BorrowCircle design tokens for React Native — mirrors the website CSS
// (design/src/index.css) so both platforms share one visual identity.

export const colors = {
  forest: '#176B52',
  forestDark: '#104B3B',
  deep: '#0D3B30',
  greenLight: '#E8F3EE',
  greenSoft: '#F2F8F4',
  cream: '#FAF9F6',
  sand: '#F4F0E8',
  ink: '#17211D',
  muted: '#66736C',
  faint: '#929C96',
  border: '#E3E9E5',
  white: '#FFFFFF',
  bg: '#F8F9F6',
  gold: '#D99A32',
  red: '#C94D4D',
  blue: '#3979BD',
  blueBg: '#EAF2FB',
  success: '#23865B',
  successBg: '#E9F6EE',
  warnBg: '#FFF5DF',
  warnText: '#8A6520',
  redBg: '#FCECEC',
  sage: '#A9BBAF',
  footer: '#092C25',
} as const;

export const spacing = (n: number) => n * 4;

export const font = {
  body: 'Inter_400',
  bodyMedium: 'Inter_500',
  bodySemi: 'Inter_600',
  bodyBold: 'Inter_700',
  display: 'Manrope_600',
  displayBold: 'Manrope_700',
} as const;

export const radius = {
  sm: 8,
  input: 12,
  button: 12,
  card: 16,
  cardLg: 20,
  hero: 24,
  pill: 999,
} as const;

export const shadow = {
  card: { shadowColor: '#142820', shadowOpacity: 0.09, shadowRadius: 19, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  floating: { shadowColor: '#142820', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
} as const;

export const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: colors.warnBg, text: colors.warnText },
  ACCEPTED: { bg: colors.blueBg, text: colors.blue },
  AWAITING_ACKNOWLEDGEMENT: { bg: colors.blueBg, text: colors.blue },
  READY_FOR_HANDOVER: { bg: colors.blueBg, text: colors.blue },
  ACTIVE: { bg: colors.greenLight, text: colors.forest },
  RETURN_INITIATED: { bg: colors.blueBg, text: colors.blue },
  COMPLETED: { bg: colors.successBg, text: colors.success },
  DECLINED: { bg: '#F0F2F1', text: colors.muted },
  CANCELLED: { bg: '#F0F2F1', text: colors.muted },
  EXPIRED: { bg: '#F0F2F1', text: colors.muted },
  OVERDUE: { bg: colors.redBg, text: colors.red },
  DISPUTED: { bg: colors.redBg, text: colors.red },
  DRAFT: { bg: '#F0F2F1', text: colors.muted },
  PAUSED: { bg: colors.warnBg, text: colors.warnText },
  REMOVED: { bg: colors.redBg, text: colors.red },
  UNAVAILABLE: { bg: colors.redBg, text: colors.red },
};
