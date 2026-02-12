import { StyleSheet } from "react-native";

import { appStylesConstants } from "./appStylesConstants";

const avatarSize = appStylesConstants.sizes.avatar;

export const appGlobalStyles = StyleSheet.create({
  avatarButton: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStylesConstants.colors.avatarBackground
  },
  avatarButtonText: {
    color: appStylesConstants.colors.avatarText,
    fontWeight: "700"
  },
  textButtonText: {
    fontSize: appStylesConstants.text.body,
    fontWeight: "600",
    color: appStylesConstants.colors.textPrimary
  },
  primaryButton: {
    height: appStylesConstants.buttons.primary.height,
    paddingHorizontal: appStylesConstants.buttons.primary.paddingHorizontal,
    borderRadius: appStylesConstants.buttons.primary.borderRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStylesConstants.buttons.primary.backgroundColor
  },
  primaryButtonText: {
    color: appStylesConstants.buttons.primaryText.color,
    fontSize: appStylesConstants.buttons.primaryText.fontSize,
    fontWeight: appStylesConstants.buttons.primaryText.fontWeight
  }
});

