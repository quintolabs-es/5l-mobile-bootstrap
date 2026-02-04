import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_SLUG = "acme-demoapp";

const exists = (p) => fs.existsSync(p);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const assert = (condition, message) => {
  if (!condition) {
    fail(`Assertion failed: ${message}`);
  }
};

const ensureDir = (p) => {
  assert(exists(p) && fs.statSync(p).isDirectory(), `Missing directory: ${p}`);
};

const ensureFile = (p) => {
  assert(exists(p) && fs.statSync(p).isFile(), `Missing file: ${p}`);
};

const run = (cmd, args, opts = {}) => {
  const res = spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...opts
  });

  if (res.error) {
    throw res.error;
  }

  if (res.status !== 0) {
    if (res.stdout) console.error(res.stdout);
    if (res.stderr) console.error(res.stderr);
    fail(`Command failed (${res.status}): ${cmd} ${args.join(" ")}`);
  }

  return res;
};

const toPascalSegment = (segment) => {
  const clean = segment.replace(/[^a-zA-Z0-9]/g, "");
  if (!clean) return "";
  return clean[0].toUpperCase() + clean.slice(1);
};

const dotnetPrefixFromSlug = (slug) => {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) {
    throw new Error(`Invalid slug "${slug}".`);
  }

  if (parts.length === 1) {
    const appName = toPascalSegment(parts[0]);
    return appName;
  }

  const org = toPascalSegment(parts[0]);
  const appName = parts.slice(1).map(toPascalSegment).join("");
  return `${org}.${appName}`;
};

const resolveCreateAppEntrypoint = () => {
  const envPath = process.env.CREATE_APP_ENTRYPOINT;
  if (envPath) {
    const candidate = path.isAbsolute(envPath) ? envPath : path.join(repoRoot, envPath);
    if (!exists(candidate)) {
      fail(`CREATE_APP_ENTRYPOINT was set but file not found: ${candidate}`);
    }
    return candidate;
  }

  const candidate = path.join(repoRoot, "cli", "create-app.js");
  if (!exists(candidate)) {
    fail(
      `Create-app entrypoint not found at ${candidate}.\n` +
        `Set CREATE_APP_ENTRYPOINT to override.`
    );
  }
  return candidate;
};

const includesFlag = (args, flag) => args.includes(flag);

const readText = (p) => fs.readFileSync(p, "utf8");

const resetDir = (p) => {
  if (exists(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
  fs.mkdirSync(p, { recursive: true });
};

const main = () => {
  const entrypoint = resolveCreateAppEntrypoint();

  const slug = process.env.SMOKE_SLUG ?? DEFAULT_SLUG;
  const slugNoDash = process.env.SMOKE_SLUG_NO_DASH ?? "demoapp";

  const tmpRoot = path.join(repoRoot, ".tmp-smoke");
  resetDir(tmpRoot);

  const cases = [
    { name: "required-basic", slug, args: ["--auth", "required"] },
    { name: "optional-basic", slug, args: ["--auth", "optional"] },
    { name: "required-mongo", slug, args: ["--auth", "required", "--with-mongo"] },
    { name: "required-s3", slug, args: ["--auth", "required", "--with-s3"] },
    { name: "optional-mongo-s3", slug, args: ["--auth", "optional", "--with-mongo", "--with-s3"] },
    { name: "no-dash-required-basic", slug: slugNoDash, args: ["--auth", "required"] }
  ];

  for (const testCase of cases) {
    const caseDir = path.join(tmpRoot, testCase.name);
    fs.mkdirSync(caseDir, { recursive: true });

    const dotnetPrefix = dotnetPrefixFromSlug(testCase.slug);
    run(process.execPath, [entrypoint, testCase.slug, ...testCase.args], { cwd: caseDir });

    const appRoot = path.join(caseDir, testCase.slug);
    const mobileRoot = path.join(appRoot, `${testCase.slug}-mobile`);
    const webapiRoot = path.join(appRoot, `${testCase.slug}-webapi`);

    ensureDir(appRoot);
    ensureDir(mobileRoot);
    ensureDir(path.join(mobileRoot, "src"));
    ensureDir(path.join(mobileRoot, "tests"));

    ensureDir(webapiRoot);
    ensureDir(path.join(webapiRoot, "src"));
    ensureDir(path.join(webapiRoot, "tests"));

    const webapiCsproj = path.join(webapiRoot, "src", `${dotnetPrefix}.WebApi.csproj`);
    const webapiTestsCsproj = path.join(
      webapiRoot,
      "tests",
      `${dotnetPrefix}.WebApi.Tests.csproj`
    );
    ensureFile(webapiCsproj);
    ensureFile(webapiTestsCsproj);

    const webapiCsprojText = readText(webapiCsproj);

    const expectsMongo = includesFlag(testCase.args, "--with-mongo");
    const expectsS3 = includesFlag(testCase.args, "--with-s3");

    const hasMongo = /MongoDB\.Driver/.test(webapiCsprojText);
    const hasS3 = /AWSSDK\.S3/.test(webapiCsprojText);

    assert(
      expectsMongo ? hasMongo : !hasMongo,
      `${testCase.name}: MongoDB.Driver package reference ${expectsMongo ? "missing" : "unexpected"}`
    );
    assert(
      expectsS3 ? hasS3 : !hasS3,
      `${testCase.name}: AWSSDK.S3 package reference ${expectsS3 ? "missing" : "unexpected"}`
    );

    const authModeFile = path.join(mobileRoot, "src", "config", "authMode.ts");
    ensureFile(authModeFile);
    const authModeText = readText(authModeFile);
    assert(
      authModeText.includes(`"${testCase.args[1]}"`) || authModeText.includes(`'${testCase.args[1]}'`),
      `${testCase.name}: authMode not set to ${testCase.args[1]}`
    );
  }

  console.log(`Smoke-test OK (${cases.length} cases). Output: ${tmpRoot}`);
};

main();
