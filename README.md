# Gulp Google Tag Manager Plugin

So that is basically [webpack-google-tag-manager-plugin](https://github.com/timjorjev/webpack-google-tag-manager-plugin),
but fixed some bugs and made it to use with gulp.

## Installation

```bash
$ npm i gulp-gtm-plugin -D
```

```bash
$ yarn add gulp-gtm-plugin -D
```

## How to use

```js
const gulp = require('gulp')
const gtm  = require('gulp-gtm-plugin')

gulp.task('html', () =>
  gulp.src('./index.html')
  .pipe(gtm({
      id: 'GTM-1234'
  }))
  .pipe(gulp.dest('./'))
)
```

## Default options

```js
gtm({
  id: '',
  events: {},
  dataLayer: {},
  dataLayerName: 'dataLayer',
  auth: '',
  preview: '',
  cookiesWin: '', // Add `gtm_cookies_win` query to url (cookiesWin: 'x' => gtm_cookies_win=x)
})
```
