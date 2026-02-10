# 5l-mobile-bootstrap

## Create a new app
Clone the repo and cd into the root folder.
```bash
npm run create-app -- <app-id> --auth <required|optional> [--output <path>] [--with-mongo-s3-infra]

# e.g, create app in a folder next to `5l-mobile-bootstrap` folder
npm run create-app -- org-coolapp --auth required --output .. --with-mongo-s3-infra
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
