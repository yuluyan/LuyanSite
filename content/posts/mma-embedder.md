---
type: posts
draft: false

title: "Embedding Mathematica notebook in web page"
subtitle: ""
date: 2019-10-05T18:00:00-06:00

authors:
  - me

preview:
  - Mathematica now has an official dynamic notebook renderer that enables us embedding notebooks inside a web page. This post describes how to use it.

tags:
  - Code
  - Web
  - Mathematica

---
Mathematica now has an official dynamic notebook renderer that enables us embedding notebooks inside a web page. With such renderer, what you can get is basically the style same as in the Wolfram online documentation center. This post describes how it is set up.

## Basic usage
* **STEP 0:** First of all, we need to publish our target notebook as a {{< mmaf CloudObject >}}. This can be done in various way, for example
{{< highlight mathematica "hl_lines=3" >}}
CloudPublish[
  Manipulate[Plot[x ^ n, {x, -3, 3}], {n, 0, 5, 1}],
  Permissions->"All"->{"Read", "Interact"}
]
{{< /highlight>}}
{{< mma 10d6bb97-84b8-4a0d-8a3a-d210b7a3e783 false >}}
Note that the {{< mmaf Permissions >}} should include {{< mmaf "\"Interact\"" false>}} for the rendered notebook to be interactive.
And we will get a {{< mmaf CloudObject >}} with some id looks like {{< mmaf 10d6bb97-84b8-4a0d-8a3a-d210b7a3e783 false >}}. 

* **STEP 1:** Now let's can install the required javascript file by npm:
{{< highlight plaintext >}}
npm install wolfram-notebook-embedder
{{< /highlight >}}

* **STEP 2:** Create container div for the notebook
{{< highlight html >}}
<div id="mma-notebook-container"></div>
{{< /highlight >}}

* **STEP 3:** Include the downloaded js file {{< mmaf "wolfram-notebook-embedder.min.js" false >}} in the target webpage.
And then we invoke the dynamic rendering process by the following code. In the function {{< mmaf "WolframNotebookEmbedder.embed" false >}}, the first argument is the target {{< mmaf CloudObject >}} to be embedded; the second argument is the DOM container; and the third argument is optional that specifies some properties of the rendering.
{{< highlight javascript >}}
var container = document.querySelector("#mma-notebook-container")
var embedding = WolframNotebookEmbedder.embed(
                'https://www.wolframcloud.com/obj/10d6bb97-84b8-4a0d-8a3a-d210b7a3e783',
                container,
                {
                    width: 640,
                    maxHeight: 480,
                    allowInteract: true,
                    showRenderProgress: true
                }
            )
{{< /highlight >}}

## Create a toggler for user
Sometimes we don't want the notebook to load when the page is loaded, since the rendering process takes some time.
Let's make a simple toggler that can let the user decide whether or not to trigger the rendering process. Just like this one:
{{< mma 10d6bb97-84b8-4a0d-8a3a-d210b7a3e783 false >}}
The html goes like this, where the {{< mmaf id false >}} of the outmost div should be the id of the {{< mmaf CloudObject >}}.
Everytime you need a expandable notebook, you put the following block of html with the corresponding {{< mmaf id false >}}
{{< highlight html >}}
<div class="mma-notebook" id="some-id" data-expand=false>
  <div class="mma-notebook-trigger">
    <img class="logo-img" src="/mma-logo.png">
      <span class="trigger-text mma">
        Open Mathematica Notebook
      </span>
  </div>
</div>
{{< /highlight >}}

Here is the javascript code to handle all the notebooks togglers on a web page.
{{< highlight javascript >}}
(function () {
  var handles = {}
  var currentEmbeddingId = 0

  var expandNotebook = function (event) {
      var notebook = document.getElementById(id)
      var trigger = notebook.querySelector(".mma-notebook-trigger")
      var container = document.createElement("div")
      container.classList.add("mma-notebook-container")
      notebook.appendChild(container)

      if (container && notebook.getAttribute("data-expand") == "false") {
          var embedding = WolframNotebookEmbedder.embed(
              'https://www.wolframcloud.com/obj/' + id,
              container,
              {
                  width: container.parentNode.offsetWidth,
                  maxHeight: 640,
                  allowInteract: true,
                  showRenderProgress: true
              }
          )

          handles[currentEmbeddingId] = embedding
          embedding.then(function (nb) {
              notebook.setAttribute("data-expand", "true")
              notebook.setAttribute("data-handle", currentEmbeddingId)
              currentEmbeddingId += 1
              trigger.removeEventListener("click", expandNotebook)
              trigger.addEventListener("click", collapseNotebook)
              trigger.lastElementChild.innerHTML = "Close Mathematica Notebook"
          })
      } else {
          console.log("Container with id: " + id + " does not exist.")
      }
  }

  var collapseNotebook = function (event) {
      var notebook = document.getElementById(id)
      var trigger = notebook.querySelector(".mma-notebook-trigger")
      var container = notebook.querySelector(".mma-notebook-container")

      if (container && notebook.getAttribute("data-expand") == "true") {
          var embedId = parseInt(notebook.getAttribute("data-handle"))
          if (handles[embedId]) {
              handles[embedId].then((nb) => {
                  nb.detach()
                  container.parentNode.removeChild(container)
                  notebook.setAttribute("data-expand", "false")
                  trigger.removeEventListener("click", collapseNotebook)
                  trigger.addEventListener("click", expandNotebook)
                  trigger.lastElementChild.innerHTML = "Open Mathematica Notebook"
                  delete handles[embedId]
              })
          } else {
              notebook.querySelectorAll(".mma-notebook-container").forEach((e) => { e.parentNode.removeChild(e) })
              trigger.removeEventListener("click", collapseNotebook)
              trigger.addEventListener("click", expandNotebook)
              trigger.lastElementChild.innerHTML = "Open Mathematica Notebook"
              notebook.setAttribute("data-expand", "false")
          }
      } else {
          notebook.setAttribute("data-expand", "false")
      }
  }

  document.addEventListener('DOMContentLoaded', function (event) {
      document.querySelectorAll(".mma-notebook-trigger").forEach((e) => {
        e.addEventListener("click", expandNotebook)
      })
  })

})()
{{< /highlight >}}

Here is the scss code for to make it a little bit more Wolfram-y.
{{< highlight scss >}}
.mma-notebook {
  margin-top: 5px;
  text-align: center;
  .mma-notebook-trigger {
    user-select: none;
    transition-duration: 0.3s;
    transition-property: background-color, color;
    transition-timing-function: ease-out;
    cursor: pointer;
    border-radius: 20px;
    border: 0;
    padding: 0px 7px 1px 6px;
    text-decoration: none;
    display: inline-block;
    margin-bottom: 5px;
    &:hover {
      background: #d21c0049;
    }
    .logo-img {
      position: relative;
      top: 3.5px;
      left: 1px;
      width: 15px;
    }
    .trigger-text {
      margin-left: 1.5px;
      font-size: 14px;
      color: #d21c00;
      &:hover {
        color: rgb(216, 57, 32);
      }
    }
  }
  /* to hide the gray bar */
  .mma-notebook-container {
    & > div > div:nth-child(2) {
      display: none;
    }
  }
}
{{< /highlight >}}

### Serving static notebook
Wolfram also provides an method for loading static notebook html. It is very easy to use: just replace the url with the form: {{< mmaf "https://www.wolframcloud.com/statichtml/id" false >}}. Request the html from the that url and place it at desired place, or simply use {{< mmaf iframe false >}}. The result will look like this:

<iframe style="display:block" src="https://www.wolframcloud.com/statichtml/10d6bb97-84b8-4a0d-8a3a-d210b7a3e783" width="100%" height="380px" frameBorder="0"></iframe>

More information can be found [here](https://reference.wolfram.com/language/WolframNotebookEmbedder/docs/ServerSideRendering/).


