const colors = {
  background: "#fff",
  surface: "#fff",
  textPrimary: "#111",
  textSecondary: "#666",
  separator: "#eee",
  overlay: "rgba(0,0,0,0.4)",
  avatarBackground: "#111",
  avatarText: "#fff"
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
} as const;

const radii = {
  sm: 6,
  md: 12,
  lg: 16
} as const;

const sizes = {
  avatar: 34,
  primaryButtonHeight: 44
} as const;

const text = {
  title: 34,
  body: 16,
  bodyLineHeight: 22
} as const;

export const appStylesConstants = {
  colors,
  spacing,
  radii,
  sizes,
  text,
  buttons: {
    primary: {
      height: sizes.primaryButtonHeight,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.sm,
      backgroundColor: colors.textPrimary
    },
    primaryText: {
      color: colors.avatarText,
      fontSize: text.body,
      fontWeight: "600" as const
    }
  },
  activityIndicator: {
    color: "#777777"
  }
} as const;
