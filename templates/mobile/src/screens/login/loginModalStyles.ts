import { StyleSheet } from "react-native";

import { appStylesConstants } from "../../styles/appStylesConstants";

export default StyleSheet.create({
  container: {
    gap: appStylesConstants.spacing.md,
    padding: appStylesConstants.spacing.lg
  },
  appleLoginButton: {
    width: "100%",
    height: appStylesConstants.sizes.primaryButtonHeight
  }
});
