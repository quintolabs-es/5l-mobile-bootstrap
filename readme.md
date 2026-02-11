# 5l-mobile-bootstrap

## Create a new app
Clone the repo and cd into the root folder.
```bash
npm run create-app -- <app-id> --auth <required|optional> [--output <path>] [--with-mongo-s3-infra]

# usage help
npm run create-app -- --help

# e.g, create app in a folder next to `5l-mobile-bootstrap` folder
npm run create-app -- org-coolapp --auth required --output .. --with-mongo-s3-infra
```

## Output structure

```text
org-coolapp/
  org-coolapp-mobile/
    src/
    tests/
  org-coolapp-webapi/
    src/
      Org.Coolapp.WebApi.csproj
    tests/
      Org.Coolapp.WebApi.Tests.csproj
```
