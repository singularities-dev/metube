# Building MeTube from source

For add-on reviewers and anyone who wants to reproduce the release build.

**Requirements:** Node.js 22 or newer and npm 10 or newer. Release builds were made on macOS with Node 24.16.0; a clean `npm ci` and `npx wxt zip -b firefox` from this archive reproduced a byte-identical Firefox package (same SHA-256).

```sh
npm ci
npm run zip          # builds and packages Chrome and Firefox
# or just Firefox:
npx wxt zip -b firefox
```

Output in `.output/`:
- `metube-<version>-firefox.zip`: the add-on package (same as the upload).
- `metube-<version>-sources.zip`: this source archive.

The build uses WXT (Vite) with React and TypeScript. The minified code in the package comes from `src/` plus the dependencies pinned in `package-lock.json`; nothing is fetched at runtime and there's no remote code.

Run the tests with `npm test`.
