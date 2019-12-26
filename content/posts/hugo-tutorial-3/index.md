---
type: posts
draft: true

title: "Hugo templating"
subtitle: "&mdash; Hugo static site generator walk-through (3)"
date: 2020-01-05T18:00:00-06:00

authors:
  - me

preview:
  - This will be a series of posts explaining the Hugo static site generator.

tags:
  - Web
---


## PostCSS
Install two useful package PostCSS and autoprefixer. They are part of the Hugo pipeline taking care of minifying CSS and adding cross-browser vendor prefixes. If you used {{< f "snap" >}} to install hugo, you should first create your site and install these two package locally, i.e., omit the {{< f "-g" >}} flag.
{{< highlight plaintext >}}
npm install -g postcss-cli
npm install -g autoprefixer
{{< /highlight >}}

After installation, create or modify the {{< f "postcss.config.js" >}} in the root of your site with the following content. Note that if you already have such file, it's highly likely there is a {{< f "browers" >}} key. This is obsolete and you should change it to {{< f "Browserslist" >}}.
{{< highlight javascript "hl_lines=4">}}
module.exports = {
    plugins: {
        autoprefixer: {
            Browserslist: [
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ]
        }
    },
}
{{< /highlight >}}

