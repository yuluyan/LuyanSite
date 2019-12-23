---
type: posts
draft: false

title: "PrettyColorize for Mathematica figure preparation"
subtitle: ""
date: 2019-05-10T18:00:00-06:00

authors:
  - me

preview:
  - Choosing colors inside a figure is always a difficult problem for me. So I developed a Mathematica package called PrettyColorize that can help me on this.

tags:
  - Mathematica
---

{{< oldpostflag >}}

# PrettyColorize
Tools for customizing the colors of your figures in Mathematica. You can download it from [GitHub](https://github.com/yuluyan/PrettyColorize). 

# Installation
1. Install {{< mmaf "PrettyRandomColor" false >}} following instructions [here](https://github.com/yuluyan/PrettyRandomColor#installation).
2. Open the Mathematica user application folder by 
{{< highlight mathematica >}}
SystemOpen @ FileNameJoin[{$UserBaseDirectory, "Applications"}];
{{< /highlight >}}

1. Create a folder called {{< mmaf "/PrettyColorize" false >}} and place {{< mmaf "PrettyColorize.wl" false >}} and {{< mmaf "/Kernel" false >}} inside.

# Usage
* Load package using {{< mmaf "<< PrettyColorize`" false >}}.
* Apply {{< mmaf "PrettyColorize" false >}} to any plotting function, e.g., Plot, ListPlot, Plot3D...

# Code example
## Minimal example
Wherever a color directive can be placed, you can instead put a {{< mmaf "Pretty[itemName_String]" false >}} as a placeholder.
{{< highlight mathematica >}}
PrettyColorize @ Plot[x, {x, -5, 5}, PlotStyle -> Pretty["Line"]]
{{< /highlight >}}

The above code generates a color palette shown below. Left-click on colors/storage changes the currently selected target item. Right-click on colors copies the clicked color to storage. Right-click on storage removes the clicked stored color.
{{< figure src="gPlot.PNG#center" width="500">}}

Pressing Confirm button will generate a runnable cell that replace the {{< mmaf "Pretty" false >}} placeholder to the selected colors:
{{< figure src="confirm.PNG#center" width="280">}}

## ContourPlot
Update and upgrade the server
{{< highlight mathematica >}}
PrettyColorize @
 ContourPlot[{Abs[Sin[x] Sin[y]] == 0.5, Abs[Cos[x] Cos[y]] == 0.5}, {x, -3, 3}, {y, -3, 3},
  ContourStyle -> {{Pretty["Contour1"]}, {Pretty["Contour2"], Dashed}},
  FrameTicks -> None,
  Epilog -> {
      Pretty["Points"],
      PointSize[0.025],
      Point[{{0, 0}, {\[Pi]/2, \[Pi]/2}, {-\[Pi]/2, \[Pi]/2}, {\[Pi]/2, -\[Pi]/2}, {-\[Pi]/2, -\[Pi]/2}}]
    }
 ]
{{< /highlight >}}
{{< figure src="gContour.PNG#center" width="400">}}

## Plot3D
{{< highlight mathematica >}}
PrettyColorize @
 Plot3D[{x^2 + y^2, 100 Exp[-0.5 (x^2 + y^2)]}, {x, -5, 5}, {y, -5, 5},
  PlotRange -> All,
  PlotStyle -> {Pretty["Surface1"], Pretty["Surface2"]},
  Mesh -> None,
  BoxStyle -> Directive[Pretty["Box"]],
  AxesStyle -> Directive[Pretty["Box"]],
  Ticks -> None
 ]
{{< /highlight >}}
{{< figure src="g3D.png#center" width="500">}}

## A more 'serious' example
[MaTeX developed by Szabolcs Horvát](https://github.com/szhorvat/MaTeX) is recommended when drawing scientific figures in Mathematica.
{{< highlight mathematica >}}
<< MaTeX`

PrettyColorize @ Plot[
  {
   Callout[(2 x)^2 Sin[x],
    MaTeX @ {"Min", "Max"},
    {Below, Above},
    Background -> Pretty["Callout"],
    FrameMargins -> 2,
    Appearance -> "Balloon"
    ],
   -10 x
  },
  {x, -3, 3},
  PlotRange -> {-40, 40},
  PlotStyle -> {{Pretty["Curve1"]}, {Pretty["Curve2"]}},
  Frame -> True,
  FrameStyle -> Black,
  FrameTicks -> {
    {Thread[{#, MaTeX @ #}] & /@ Range[-40, 40, 20], None}, {Thread[{#, MaTeX @ #}] & /@ Range[-3, 3, 1], None}
  },
  AxesStyle -> Directive[Pretty["Axes"], Dashed],
  Filling -> {1 -> {{2}, {Pretty["FillLeft"], Pretty["FillRight"]}}},
  ImageSize -> 600
 ]
{{< /highlight >}}
{{< figure src="gMoreSerious.png#center" width="500">}}

# TODO
## Known problems
* Random functions will be called during every dynamic update.

## Features
* New colors generation based on existing stored colors.
* A button for figure export.
* Performance improvement on dynamic control objects.
