# 5l-rn-bootstrap

## Create a new app

```bash
# slug format:
# - recommended: org-appname
# - allowed: appname (no dash)

# required auth (opens login)
npm run create-app -- acme-demoapp --auth required

# optional auth (blank home + sign-in modal)
npm run create-app -- acme-demoapp --auth optional

# optional infra (generates code + registers mocks by default; real DI lines commented)
npm run create-app -- acme-demoapp --auth required --with-mongo --with-s3
```

## Output structure

```text
acme-demoapp/
  acme-demoapp-mobile/
    src/
    tests/
  acme-demoapp-webapi/
    src/
      Acme.Demoapp.WebApi.csproj
    tests/
      Acme.Demoapp.WebApi.Tests.csproj
```

## Smoke test

```bash
npm run smoke-test
```

## Configure

```bash
cat acme-demoapp/README.md
```
