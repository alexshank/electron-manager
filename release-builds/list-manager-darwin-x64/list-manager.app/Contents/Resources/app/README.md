# List Manager

The first Electron app I've written. It can store and manage a list of to-do items. Currently in a state that works, but needs to be heavily refactored since features have been added when immediately needed.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/alexshank/list_manager
# Go into the repository
cd list-manager
# Install dependencies
npm install
# Run the app
npm start
```

## To Debug

From within the main.js file, change
```javascript
// set environment variable ('production' for actual releases, 'dev' otherwise)
process.env.NODE_ENV = 'production'
```
to the following:
```javascript
// set environment variable ('production' for actual releases, 'dev' otherwise)
process.env.NODE_ENV = 'dev'
```


## To Package Yourself
(taken from https://www.christianengvall.se/electron-packager-tutorial/)
1. Install electron packager.
```bash
# for use in npm scripts
npm install electron-packager --save-dev

# for use from cli
npm install electron-packager -g
```

2. Set product name and electron version, then create build scripts (all in package.json)
```bash
{
 "name": "electron-tutorial-app",
 "productName": "Electron tutorial app",
 "version": "0.1.0",
 "main": "main.js",
 "devDependencies": {
  "electron": "^1.4.3",
  "electron-packager": "^8.1.0"
 },
 "scripts": {
  "package-mac": "electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds",
  "package-win": "electron-packager . electron-tutorial-app --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"Electron Tutorial App\"",    
  "package-linux": "electron-packager . electron-tutorial-app --overwrite --asar=true --platform=linux --arch=x64 --icon=assets/icons/png/1024x1024.png --prune=true --out=release-builds"
 }
}
```

3. Build based on your platform
```bash
npm run package-mac
npm run package-win
npm run package-linux
```


4. The executables will then be contained in the release-builds directory
