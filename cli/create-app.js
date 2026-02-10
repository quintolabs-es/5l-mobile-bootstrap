import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const usage = () => {
  const helpPath = path.join(__dirname, "readme.help.md");
  try {
    const helpText = fs.readFileSync(helpPath, "utf8");
    process.stdout.write(helpText.endsWith("\n") ? helpText : helpText + "\n");
  } catch (error) {
    console.log("Help text not found. Expected cli/readme.help.md.");
    console.log("Basic usage:");
    console.log("  node cli/create-app.js <app-id> --auth <required|optional> [--output <path>] [--with-mongo-s3-infra]");
  }
};

const die = (message) => {
  console.error(message);
  process.exit(1);
};

const toPascalSegment = (segment) => {
  const clean = segment.replace(/[^a-zA-Z0-9]/g, "");
  if (!clean) return "";
  return clean[0].toUpperCase() + clean.slice(1);
};

const parseAppId = (appId) => {
  if (typeof appId !== "string" || appId.trim() === "") {
    die("Missing <app-id> argument.");
  }

  const normalized = appId.trim();
  if (normalized.includes("/") || normalized.includes("\\")) {
    die('Invalid app id. Use "--output" to control the destination directory.');
  }
  const parts = normalized.split("-").filter(Boolean);
  if (parts.length === 0) {
    die(`Invalid app id "${appId}".`);
  }

  const toBundleSegment = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (parts.length === 1) {
    const appSlugParts = [parts[0]];
    const appPascal = appSlugParts.map(toPascalSegment).join("");
    if (!appPascal) {
      die(`Invalid app id "${appId}".`);
    }

    const bundleApp = toBundleSegment(appSlugParts.join(""));
    return {
      appId: normalized,
      orgSlug: "",
      appSlugParts,
      orgPascal: "",
      appPascal,
      dotnetPrefix: appPascal,
      displayName: appPascal,
      bundleIdBase: `com.${bundleApp || "placeholder"}`
    };
  }

  const orgSlug = parts[0];
  const appSlugParts = parts.slice(1);

  const orgPascal = toPascalSegment(orgSlug);
  const appPascal = appSlugParts.map(toPascalSegment).join("");
  if (!orgPascal || !appPascal) {
    die(`Invalid app id "${appId}".`);
  }

  const dotnetPrefix = `${orgPascal}.${appPascal}`;

  const bundleOrg = toBundleSegment(orgSlug);
  const bundleApp = toBundleSegment(appSlugParts.join(""));
  const bundleIdBase = `com.${bundleOrg}.${bundleApp}`;

  return {
    appId: normalized,
    orgSlug,
    appSlugParts,
    orgPascal,
    appPascal,
    dotnetPrefix,
    displayName: appPascal,
    bundleIdBase
  };
};

const parseArgs = (argv) => {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const appId = args[0];

  const flags = new Set(args.slice(1));
  const knownOptions = new Set(["--auth", "--output", "--with-mongo-s3-infra"]);
  for (const token of args.slice(1)) {
    if (token.startsWith("--") && !knownOptions.has(token)) {
      die(`Unknown option "${token}".`);
    }
  }

  const withMongoS3Infra = flags.has("--with-mongo-s3-infra");

  const withMongo = withMongoS3Infra;
  const withS3 = withMongoS3Infra;

  const authIdx = args.indexOf("--auth");
  if (authIdx === -1 || authIdx === args.length - 1) {
    die('Missing required "--auth <required|optional>" argument.');
  }

  const authMode = args[authIdx + 1];
  if (authMode !== "required" && authMode !== "optional") {
    die(`Invalid auth mode "${authMode}". Expected "required" or "optional".`);
  }

  const outputIdx = args.indexOf("--output");
  let outputDir = null;
  if (outputIdx !== -1) {
    if (outputIdx === args.length - 1) {
      die('Missing required "--output <path>" value.');
    }
    outputDir = args[outputIdx + 1];
    if (!outputDir || outputDir.trim() === "" || outputDir.startsWith("--")) {
      die('Invalid "--output" value.');
    }
  }

  return { appId, authMode, outputDir, withMongo, withS3 };
};

const copyDir = (from, to) => {
  fs.cpSync(from, to, { recursive: true, errorOnExist: false });
};

const runGit = (cwd, args) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    ok: !result.error && result.status === 0,
    error: result.error,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
};

const initGitRepo = (appRoot) => {
  if (fs.existsSync(path.join(appRoot, ".git"))) return;

  const init = runGit(appRoot, ["init"]);
  if (!init.ok) {
    console.log("Skipped git init (git not available or init failed).");
    return;
  }

  runGit(appRoot, ["add", "-A"]);

  const commitMessage = "initial commit. app created from template";
  const commit = runGit(appRoot, ["commit", "-m", commitMessage]);
  if (!commit.ok) {
    console.log("Git repo initialized, but the first commit failed.");
    console.log("Run these commands inside the app folder:");
    console.log("  git add -A");
    console.log(`  git commit -m "${commitMessage}"`);
  }
};

const selectMobileAppEntrypoint = (mobileRoot, authMode) => {
  const requiredAppPath = path.join(mobileRoot, "App.required.tsx");
  const optionalAppPath = path.join(mobileRoot, "App.optional.tsx");
  const appTsxPath = path.join(mobileRoot, "App.tsx");

  const sourceAppPath = authMode === "optional" ? optionalAppPath : requiredAppPath;
  if (!fs.existsSync(sourceAppPath)) {
    die(`Missing ${sourceAppPath}`);
  }

  fs.copyFileSync(sourceAppPath, appTsxPath);

  if (fs.existsSync(requiredAppPath)) {
    fs.unlinkSync(requiredAppPath);
  }
  if (fs.existsSync(optionalAppPath)) {
    fs.unlinkSync(optionalAppPath);
  }
};

const writeMobileEnvFileIfMissing = (mobileRoot) => {
  const examplePath = path.join(mobileRoot, ".env.example");
  const envPath = path.join(mobileRoot, ".env");

  if (!fs.existsSync(examplePath)) return;
  if (fs.existsSync(envPath)) return;

  fs.copyFileSync(examplePath, envPath);
};

const isTextFile = (filePath) => {
  const baseName = path.basename(filePath);
  if (baseName === "Dockerfile") return true;
  if (baseName === ".dockerignore") return true;
  if (baseName === ".gitignore") return true;
  if (baseName === ".env" || baseName === ".env.example") return true;

  const ext = path.extname(filePath).toLowerCase();
  return [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".sh",
    ".json",
    ".md",
    ".txt",
    ".cs",
    ".csproj",
    ".sln",
    ".xml",
    ".yml",
    ".yaml",
    ".example"
  ].includes(ext);
};

const walk = (root) => {
  const out = [];

  const visit = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      out.push(fullPath);
      if (entry.isDirectory()) {
        visit(fullPath);
      }
    }
  };

  visit(root);
  return out;
};

const replaceInFiles = (root, replacements) => {
  const paths = walk(root);
  for (const p of paths) {
    if (!fs.statSync(p).isFile()) continue;
    if (!isTextFile(p)) continue;

    const before = fs.readFileSync(p, "utf8");
    let after = before;
    for (const [needle, value] of Object.entries(replacements)) {
      after = after.split(needle).join(value);
    }
    if (after !== before) {
      fs.writeFileSync(p, after, "utf8");
    }
  }
};

const renamePaths = (root, replacements) => {
  const paths = walk(root)
    .sort((a, b) => b.length - a.length); // deepest-first

  for (const p of paths) {
    const base = path.basename(p);
    let renamed = base;
    for (const [needle, value] of Object.entries(replacements)) {
      renamed = renamed.split(needle).join(value);
    }

    if (renamed !== base) {
      const next = path.join(path.dirname(p), renamed);
      fs.renameSync(p, next);
    }
  }
};

const updateWebApiCsprojForOptionalPackages = (webapiSrcDir, { withMongo, withS3 }) => {
  const csprojFiles = fs.readdirSync(webapiSrcDir).filter((f) => f.endsWith(".csproj"));
  if (csprojFiles.length !== 1) {
    die(`Expected exactly one .csproj in ${webapiSrcDir}, found ${csprojFiles.length}.`);
  }

  const csprojPath = path.join(webapiSrcDir, csprojFiles[0]);
  const xml = fs.readFileSync(csprojPath, "utf8");

  const mongoRefs = withMongo
    ? [
        '    <PackageReference Include="MongoDB.Driver" Version="2.24.0" />',
        '    <PackageReference Include="MongoDB.Driver.GridFS" Version="2.24.0" />'
      ].join("\n")
    : "";

  const s3Refs = withS3
    ? [
        '    <PackageReference Include="AWSSDK.Core" Version="3.7.400" />',
        '    <PackageReference Include="AWSSDK.S3" Version="3.7.400" />'
      ].join("\n")
    : "";

  const replaced = xml
    .split("<!-- __MONGO_PACKAGE_REFERENCES__ -->")
    .join(mongoRefs)
    .split("<!-- __S3_PACKAGE_REFERENCES__ -->")
    .join(s3Refs);

  fs.writeFileSync(csprojPath, replaced, "utf8");
};

const mergeJsonFile = (filePath, patchObject) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw);
  const merged = { ...json, ...patchObject };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n", "utf8");
};

const updateAppSettingsForOptionals = (webapiSrcDir, { withMongo, withS3 }) => {
  const appsettingsPaths = [
    path.join(webapiSrcDir, "appsettings.json"),
    path.join(webapiSrcDir, "appsettings.development.json"),
    path.join(webapiSrcDir, "appsettings.staging.json"),
    path.join(webapiSrcDir, "appsettings.production.json")
  ].filter((p) => fs.existsSync(p));

  for (const p of appsettingsPaths) {
    const patch = {};

    if (withMongo) {
      patch.Mongo = patch.Mongo ?? {
        ConnectionString: "PLACEHOLDER_MONGO_CONNECTION_STRING",
        DatabaseName: "PLACEHOLDER_MONGO_DATABASE_NAME"
      };
    }

    if (withS3) {
      patch.S3 = patch.S3 ?? {
        ServiceUrl: "PLACEHOLDER_S3_SERVICE_URL",
        AccessKeyId: "PLACEHOLDER_S3_ACCESS_KEY_ID",
        SecretAccessKey: "PLACEHOLDER_S3_SECRET_ACCESS_KEY",
        BucketName: "PLACEHOLDER_S3_BUCKET_NAME",
        PublicUrl: "PLACEHOLDER_S3_PUBLIC_URL"
      };
    }

    if (Object.keys(patch).length > 0) {
      mergeJsonFile(p, patch);
    }
  }
};

const updateWebApiOptionalRegistrations = (webapiSrcDir, { withMongo, withS3 }) => {
  const registrationFile = path.join(webapiSrcDir, "WebApplicationBuilderExtensions.cs");
  if (!fs.existsSync(registrationFile)) {
    die(`Missing ${registrationFile}`);
  }

  const before = fs.readFileSync(registrationFile, "utf8");

  const mongoBlock = withMongo
    ? [
        "        // MongoDB (mock by default; uncomment real implementation when configured)",
        "        services.AddSingleton<IPostsRepository, MockPostsRepository>();",
        "        // services.AddSingleton<IPostsRepository, MongoPostsRepository>();"
      ].join("\n")
    : "";

  const s3Block = withS3
    ? [
        "        // S3 (mock by default; uncomment real implementation when configured)",
        "        services.AddSingleton<IPostImagesStorageService, MockPostImagesStorageService>();",
        "        // services.AddSingleton<IPostImagesStorageService, S3PostImagesStorageService>();"
      ].join("\n")
    : "";

  const after = before
    .split("// __WITH_MONGO_SERVICES__")
    .join(mongoBlock)
    .split("// __WITH_S3_SERVICES__")
    .join(s3Block);

  fs.writeFileSync(registrationFile, after, "utf8");
};

const applyWebapiOptionalOverlays = (destWebapiRoot, { withMongo, withS3 }) => {
  if (withMongo) {
    const src = path.join(repoRoot, "templates", "webapi-optional", "mongo");
    copyDir(src, destWebapiRoot);
  }
  if (withS3) {
    const src = path.join(repoRoot, "templates", "webapi-optional", "s3");
    copyDir(src, destWebapiRoot);
  }
  if (withMongo && withS3) {
    const src = path.join(repoRoot, "templates", "webapi-optional", "mongo-s3");
    copyDir(src, destWebapiRoot);
  }
};

const writeRootReadme = (appRoot, { appId, dotnetPrefix }, { withMongo, withS3 }) => {
  const lines = [];

  lines.push(`# ${appId}`);
  lines.push("");
  lines.push("Bootstrap project generated from `5l-mobile-bootstrap`.");
  lines.push("");
  lines.push("## Docs");
  lines.push("");
  lines.push(`- Mobile: \`${appId}-mobile/README.md\``);
  lines.push(`- WebApi: \`${appId}-webapi/README.md\``);

  if (withMongo || withS3) {
    lines.push("");
    lines.push("## Optional infra");
    if (withMongo) lines.push("- Mongo example included.");
    if (withS3) lines.push("- S3 example included.");
  }

  lines.push("");
  lines.push("## Projects");
  lines.push(`- WebApi: ${dotnetPrefix}.WebApi`);
  lines.push(`- WebApi tests: ${dotnetPrefix}.WebApi.Tests`);
  lines.push("");

  fs.writeFileSync(path.join(appRoot, "README.md"), lines.join("\n"), "utf8");
};

const main = () => {
  const { appId, authMode, outputDir, withMongo, withS3 } = parseArgs(process.argv);
  const names = parseAppId(appId);

  const templatesMobile = path.join(repoRoot, "templates", "mobile");
  const templatesWebapi = path.join(repoRoot, "templates", "webapi");

  if (!fs.existsSync(templatesMobile) || !fs.existsSync(templatesWebapi)) {
    die("Missing templates. Expected `templates/mobile` and `templates/webapi` to exist.");
  }

  const outputBaseDir =
    !outputDir || outputDir === "."
      ? process.cwd()
      : path.isAbsolute(outputDir)
        ? outputDir
        : path.resolve(process.cwd(), outputDir);

  const appRoot = path.resolve(outputBaseDir, names.appId);
  if (fs.existsSync(appRoot)) {
    die(`Destination already exists: ${appRoot}`);
  }

  fs.mkdirSync(appRoot, { recursive: true });

  const mobileRoot = path.join(appRoot, `${names.appId}-mobile`);
  const webapiRoot = path.join(appRoot, `${names.appId}-webapi`);

  copyDir(templatesMobile, mobileRoot);
  selectMobileAppEntrypoint(mobileRoot, authMode);
  writeMobileEnvFileIfMissing(mobileRoot);
  copyDir(templatesWebapi, webapiRoot);
  applyWebapiOptionalOverlays(webapiRoot, { withMongo, withS3 });

  const expoSlug = `${names.appId}-mobile`;
  const replacements = {
    "__APP_ID__": names.appId,
    "__SLUG__": expoSlug,
    "__ORG_PASCAL__": names.orgPascal,
    "__APP_PASCAL__": names.appPascal,
    "__DOTNET_PREFIX__": names.dotnetPrefix,
    "__APP_DISPLAY_NAME__": names.displayName,
    "__BUNDLE_ID_BASE__": names.bundleIdBase
  };

  replaceInFiles(appRoot, replacements);
  renamePaths(appRoot, replacements);

  updateWebApiCsprojForOptionalPackages(path.join(webapiRoot, "src"), { withMongo, withS3 });
  updateAppSettingsForOptionals(path.join(webapiRoot, "src"), { withMongo, withS3 });
  updateWebApiOptionalRegistrations(path.join(webapiRoot, "src"), { withMongo, withS3 });

  writeRootReadme(appRoot, names, { withMongo, withS3 });

  initGitRepo(appRoot);

  console.log(`Created ${names.appId}/`);
};

main();
