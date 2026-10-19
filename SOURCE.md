# Building MeTube from source

For add-on reviewers and anyone who wants to reproduce the release build.

**Requirements:** Node.js 20 or newer (built with Node 22), npm 10, any OS.

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
