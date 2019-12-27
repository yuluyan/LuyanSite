---
type: posts
draft: true

title: "Useful code snippets in Mathematica"
subtitle: ""
date: 2019-12-25T18:00:00-06:00

authors:
  - me

preview:
  - This post keeps notes of some useful Mathematica code snippets that are not obvious to come up with.

tags:
  - Mathematica

---

## Partition a list and keep the remaining
{{< highlight mathematica >}}
n = 3
Partition[list, n, n, {1, 1}, {}]
{{< /highlight >}}


## Test shortcode
{{< f CloudObject mma >}}
{{< f "CloudObject" mma >}}
{{< f "Nolink" mma "nolink" >}}
{{< f "Customlink" mma "//www.baidu.com" >}}

{{< f "Series" pd >}}
{{< f "DataFrame" pandas >}}
{{< f "exp" np >}}
{{< f "exp" numpy >}}

{{< f "print" py >}}
{{< f "print" python >}}

{{< f "Regular_code//432#@!G with out link" >}}
{{< f "regulare with link" link "//www.baidu.com">}}