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
    console.log("  node cli/create-app.js <slug> --auth <required|optional> [--output <path>] [--with-mongo] [--with-s3]");
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

const parseSlug = (slug) => {
  if (typeof slug !== "string" || slug.trim() === "") {
    die("Missing <slug> argument.");
  }

  const normalized = slug.trim();
  if (normalized.includes("/") || normalized.includes("\\")) {
    die('Invalid slug. Use "--output" to control the destination directory.');
  }
  const parts = normalized.split("-").filter(Boolean);
  if (parts.length === 0) {
    die(`Invalid slug "${slug}".`);
  }

  const toBundleSegment = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (parts.length === 1) {
    const appSlugParts = [parts[0]];
    const appPascal = appSlugParts.map(toPascalSegment).join("");
    if (!appPascal) {
      die(`Invalid slug "${slug}".`);
    }

    const bundleApp = toBundleSegment(appSlugParts.join(""));
    return {
      slug: normalized,
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
    die(`Invalid slug "${slug}".`);
  }

  const dotnetPrefix = `${orgPascal}.${appPascal}`;

  const bundleOrg = toBundleSegment(orgSlug);
  const bundleApp = toBundleSegment(appSlugParts.join(""));
  const bundleIdBase = `com.${bundleOrg}.${bundleApp}`;

  return {
    slug: normalized,
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

  const slug = args[0];

  const flags = new Set(args.slice(1));
  const withMongo = flags.has("--with-mongo");
  const withS3 = flags.has("--with-s3");

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

  return { slug, authMode, outputDir, withMongo, withS3 };
};

const copyDir = (from, to) => {
  fs.cpSync(from, to, { recursive: true, errorOnExist: false });
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
        "        services.AddSingleton<IMongoExampleService, MockMongoExampleService>();",
        "        // services.AddSingleton<IMongoExampleService, MongoExampleService>();"
      ].join("\n")
    : "";

  const s3Block = withS3
    ? [
        "        // S3 (mock by default; uncomment real implementation when configured)",
        "        services.AddSingleton<IS3ExampleService, MockS3ExampleService>();",
        "        // services.AddSingleton<IS3ExampleService, S3ExampleService>();"
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
};

const writeRootReadme = (appRoot, { slug, dotnetPrefix }, { withMongo, withS3 }) => {
  const lines = [];

  lines.push(`# ${slug}`);
  lines.push("");
  lines.push("Bootstrap project generated from `5l-rn-bootstrap`.");
  lines.push("");
  lines.push("## Required manual configuration");
  lines.push("");
  lines.push("### Mobile (`*-mobile`)");
  lines.push("- Set `EXPO_PUBLIC_BUILD_ENVIRONMENT` to `development`, `staging`, or `production`.");
  lines.push("- Fill placeholders in `*-mobile/src/providers/ConfigurationProvider.tsx`:");
  lines.push("  - `PLACEHOLDER_WEBAPI_DEV_URL`, `PLACEHOLDER_WEBAPI_STG_URL`, `PLACEHOLDER_WEBAPI_PROD_URL`");
  lines.push("  - Google `PLACEHOLDER_GOOGLE_*_CLIENT_ID_*` values (web + iOS client IDs)");
  lines.push("- Fill placeholders in `*-mobile/app.config.ts`:");
  lines.push("  - `PLACEHOLDER_IOS_URL_SCHEME_*` (Google reverse client ID for iOS)");
  lines.push("  - `PLACEHOLDER_EAS_PROJECT_ID` (if using EAS)");
  lines.push("  - `PLACEHOLDER_SENTRY_ORG` / `PLACEHOLDER_SENTRY_PROJECT` (if using Sentry)");
  lines.push("");
  lines.push("### WebApi (`*-webapi`)");
  lines.push("- Set `ASPNETCORE_ENVIRONMENT` to `development`, `staging`, or `production`.");
  lines.push("- Fill placeholders in `*-webapi/src/appsettings*.json`:");
  lines.push("  - `Auth.GoogleClientId` (should match the mobile Google *web* client ID used to mint idTokens)");
  lines.push("  - `Auth.JwtIssuer`, `Auth.JwtAudience`, `Auth.JwtSigningKey`");
  lines.push("  - `Sentry.Dsn` (used in staging/production)");
  lines.push("- `App.MobileAppBundleId` must match the iOS bundle id; scaffold sets it from the slug.");
  if (withMongo) {
    lines.push("");
    lines.push("### Mongo (optional)");
    lines.push("- Config: fill `Mongo` placeholders in `*-webapi/src/appsettings*.json`.");
    lines.push("- Code: WebApi uses `MockMongoExampleService` by default. To enable real Mongo, uncomment `MongoExampleService` in `*-webapi/src/WebApplicationBuilderExtensions.cs`.");
  }
  if (withS3) {
    lines.push("");
    lines.push("### S3 (optional)");
    lines.push("- Config: fill `S3` placeholders in `*-webapi/src/appsettings*.json`.");
    lines.push("- Code: WebApi uses `MockS3ExampleService` by default. To enable real S3, uncomment `S3ExampleService` in `*-webapi/src/WebApplicationBuilderExtensions.cs`.");
  }
  lines.push("");
  lines.push("## Run (scaffold-only)");
  lines.push("");
  lines.push("### WebApi");
  lines.push("```bash");
  lines.push(`cd ${slug}/${slug}-webapi`);
  lines.push("dotnet restore");
  lines.push("dotnet build");
  lines.push("dotnet run --project src");
  lines.push("```");
  lines.push("");
  lines.push("### WebApi (Docker)");
  lines.push("```bash");
  lines.push(`cd ${slug}/${slug}-webapi`);
  lines.push("docker build -t webapi:dev .");
  lines.push("docker run --rm -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=development webapi:dev");
  lines.push("```");
  lines.push("");
  lines.push("### Mobile");
  lines.push("```bash");
  lines.push(`cd ${slug}/${slug}-mobile`);
  lines.push("npm install");
  lines.push("npm run ios");
  lines.push("```");
  lines.push("");
  lines.push("## Projects");
  lines.push(`- WebApi: ${dotnetPrefix}.WebApi`);
  lines.push(`- WebApi tests: ${dotnetPrefix}.WebApi.Tests`);
  lines.push("");

  fs.writeFileSync(path.join(appRoot, "README.md"), lines.join("\n"), "utf8");
};

const main = () => {
  const { slug, authMode, outputDir, withMongo, withS3 } = parseArgs(process.argv);
  const names = parseSlug(slug);

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

  const appRoot = path.resolve(outputBaseDir, names.slug);
  if (fs.existsSync(appRoot)) {
    die(`Destination already exists: ${appRoot}`);
  }

  fs.mkdirSync(appRoot, { recursive: true });

  const mobileRoot = path.join(appRoot, `${names.slug}-mobile`);
  const webapiRoot = path.join(appRoot, `${names.slug}-webapi`);

  copyDir(templatesMobile, mobileRoot);
  copyDir(templatesWebapi, webapiRoot);
  applyWebapiOptionalOverlays(webapiRoot, { withMongo, withS3 });

  const replacements = {
    "__SLUG__": names.slug,
    "__ORG_PASCAL__": names.orgPascal,
    "__APP_PASCAL__": names.appPascal,
    "__DOTNET_PREFIX__": names.dotnetPrefix,
    "__APP_DISPLAY_NAME__": names.displayName,
    "__AUTH_MODE__": authMode,
    "__BUNDLE_ID_BASE__": names.bundleIdBase
  };

  replaceInFiles(appRoot, replacements);
  renamePaths(appRoot, replacements);

  updateWebApiCsprojForOptionalPackages(path.join(webapiRoot, "src"), { withMongo, withS3 });
  updateAppSettingsForOptionals(path.join(webapiRoot, "src"), { withMongo, withS3 });
  updateWebApiOptionalRegistrations(path.join(webapiRoot, "src"), { withMongo, withS3 });

  writeRootReadme(appRoot, names, { withMongo, withS3 });

  console.log(`Created ${names.slug}/`);
};

main();
