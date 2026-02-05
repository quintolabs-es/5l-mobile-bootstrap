Usage:
  npm run create-app -- <slug> --auth <required|optional> [--output <path>] [--with-mongo] [--with-s3]

Arguments:
  <slug>                       Project id used for folder names + bundle id + .NET prefix
                               Recommended: org-appname (e.g. acme-demoapp)
                               Allowed: appname (no dash)

Options:
  --auth <required|optional>    Required. Whether the app must require authentication or not:
                                required = app opens on login (auth gate)
                                optional = app opens on blank home; tap avatar to optionally sign in (modal)
  --output <path>               Optional. Output base dir (default "."); relative or absolute
                                In particular, '--output ..' creates the app folder in current's parent, next to the current directory
  --with-mongo                  Optional. Adds a Mongo example endpoint; uses a mock by default so it runs without Mongo
  --with-s3                     Optional. Adds an S3 example endpoint; uses a mock by default so it runs without S3
  -h, --help                    Show help: npm run create-app -- --help

