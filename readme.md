# 5l-mobile-bootstrap

## Create a new app
```bash
npm run create-app -- <slug> --auth <required|optional> [--output <path>] [--with-mongo] [--with-s3]
```

Usage help:
```bash
npm run create-app -- --help
```

## Output structure

```text
org-appname/
  org-appname-mobile/
    src/
    tests/
  org-appname-webapi/
    src/
      Org.Appname.WebApi.csproj
    tests/
      Org.Appname.WebApi.Tests.csproj
```

## Generated app
```bash
cat org-appname/README.md
```
