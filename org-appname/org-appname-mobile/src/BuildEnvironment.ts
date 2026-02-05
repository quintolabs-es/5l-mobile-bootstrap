export type BuildEnvironmentName = "development" | "staging" | "production";

export type BuildEnvironment = Readonly<{
  buildEnvironmentName: BuildEnvironmentName;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
}>;

const VALID_ENVIRONMENTS: readonly BuildEnvironmentName[] = ["development", "staging", "production"] as const;

let cachedBuildEnvironment: BuildEnvironment | null = null;

const isDevRuntime = (): boolean => {
  return typeof __DEV__ !== "undefined" && __DEV__ === true;
};

const resolveBuildEnvironmentName = (): BuildEnvironmentName => {
  const raw = process.env.EXPO_PUBLIC_BUILD_ENVIRONMENT;
  if (raw && (VALID_ENVIRONMENTS as readonly string[]).includes(raw)) {
    return raw as BuildEnvironmentName;
  }

  if (isDevRuntime()) {
    console.warn(
      `[BuildEnvironment] EXPO_PUBLIC_BUILD_ENVIRONMENT is missing/invalid (${JSON.stringify(raw)}). Defaulting to "development" for dev runtime.`
    );
    return "development";
  }

  throw new Error(
    `[BuildEnvironment] EXPO_PUBLIC_BUILD_ENVIRONMENT is missing/invalid (${JSON.stringify(raw)}). Expected one of: ${VALID_ENVIRONMENTS.join(", ")}.`
  );
};

export const getBuildEnvironment = (): BuildEnvironment => {
  if (cachedBuildEnvironment) {
    return cachedBuildEnvironment;
  }

  const buildEnvironmentName = resolveBuildEnvironmentName();

  cachedBuildEnvironment = {
    buildEnvironmentName,
    isDevelopment: buildEnvironmentName === "development",
    isStaging: buildEnvironmentName === "staging",
    isProduction: buildEnvironmentName === "production"
  };

  console.log(`[BuildEnvironment] Detected build environment: ${buildEnvironmentName}`);
  return cachedBuildEnvironment;
};

export const buildEnvironment = {
  get buildEnvironmentName() {
    return getBuildEnvironment().buildEnvironmentName;
  },
  get isDevelopment() {
    return getBuildEnvironment().isDevelopment;
  },
  get isStaging() {
    return getBuildEnvironment().isStaging;
  },
  get isProduction() {
    return getBuildEnvironment().isProduction;
  }
} as const;

