const through2 = require('through2')
const { stripIndent } = require('common-tags')

const isObject = instance => {
  const instanceClass = {}.toString.call(instance)
  return instanceClass.split(' ')[1].toLowerCase().includes('object')
}

class GTMPlugin {
  constructor(options = {}) {
    const defaultOptions = {
      id: '',
      events: {},
      dataLayer: {},
      dataLayerName: 'dataLayer',
      auth: '',
      preview: '',
    }

    this.options = { ...defaultOptions, ...options }

    if (!options.id) throw new Error(`The plugin option "id" has not been set.`)

    this.snippets = {
      script: stripIndent`
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js',${JSON.stringify(this.options.events).slice(
          1,
          -1
        )}});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl+ '${
          this.options.auth ? `&gtm_auth=${this.options.auth}` : ''
        }${
        this.options.preview ? `&gtm_preview=${this.options.preview}` : ''
      }&gtm_cookies_win=x';f.parentNode.insertBefore(j,f);
        })(window,document,'script','${this.options.dataLayerName}','${this.options.id}');</script>
        <!-- End Google Tag Manager -->
      `,
      noScript: stripIndent`
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${this.options.id}${
        this.options.auth ? `&gtm_auth=${this.options.auth}` : ''
      }${this.options.preview ? `&gtm_preview=${this.options.preview}` : ''}&gtm_cookies_win=x"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
      `,
      dataLayer: (() => {
        if (!isObject(this.options.dataLayer)) {
          throw new Error(
            `The plugin option "dataLayer" should be a plain object. "${this.options.dataLayer}" is not valid.`
          )
        }

        if (Object.keys(this.options.dataLayer).length > 0) {
          return `window.${this.options.dataLayerName}=window.${
            this.options.dataLayerName
          }||[];window.${this.options.dataLayerName}.push(${JSON.stringify(
            this.options.dataLayer
          )});`
        }

        return ''
      })(),
    }
  }

  apply(file, cb) {
    const headRegExp = /(<\/head>)/i
    const bodyRegExp = /(<body\s*>)/i

    let html = file.contents.toString()
    const { dataLayer, script, noScript } = this.snippets

    if (dataLayer) html = html.replace(headRegExp, match => `${dataLayer}\n${match}`)
    html = html.replace(headRegExp, match => `${script}\n${match}`)
    html = html.replace(bodyRegExp, match => `${match}\n${noScript}`)

    file.contents = Buffer.from(html)

    cb(null, file)
  }
}

const gtm = (options = {}) =>
  through2.obj((file, enc, cb) => {
    const gtm = new GTMPlugin(options)
    gtm.apply(file, cb)
  })

module.exports = gtm
