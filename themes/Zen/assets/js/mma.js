(function () {

    var handles = {}
    var currentEmbeddingId = 0

    var expandNotebook = function (event) {
        var id = event
        if (typeof event !== "string") {
            id = event.target.parentNode.parentNode.id
        }
        var notebook = document.getElementById(id)
        var trigger = notebook.querySelector(".mma-notebook-trigger")
        var container = document.createElement("div")
        container.classList.add("mma-notebook-container")
        notebook.appendChild(container)
        if (container && notebook.getAttribute("data-expand") == "false") {
            //console.log("Expand " + id)
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
            //trigger.lastElementChild.innerHTML = "Opening Mathematica Notebook..."

            handles[currentEmbeddingId] = embedding
            embedding.then(function (nb) {
                notebook.setAttribute("data-expand", "true")
                notebook.setAttribute("data-handle", currentEmbeddingId)
                currentEmbeddingId += 1
                trigger.removeEventListener("click", expandNotebook)
                //console.log("remove expand event")
                trigger.addEventListener("click", collapseNotebook)
                trigger.lastElementChild.innerHTML = "Close Mathematica Notebook"
            })
        } else {
            console.log("Container with id: " + id + " does not exist.")
        }
    }
    var collapseNotebook = function (event) {
        var id = event
        if (typeof event !== "string") {
            id = event.target.parentNode.parentNode.id
        }
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

    var collapseNotebookWithCallback = function (event, callback) {
        var id = event
        if (typeof event !== "string") {
            id = event.target.parentNode.parentNode.id
        }
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
                    callback()
                })
            } else {
                notebook.querySelectorAll(".mma-notebook-container").forEach((e) => { e.parentNode.removeChild(e) })
                trigger.removeEventListener("click", collapseNotebook)
                trigger.addEventListener("click", expandNotebook)
                trigger.lastElementChild.innerHTML = "Open Mathematica Notebook"
                notebook.setAttribute("data-expand", "false")
                callback()
            }
        } else {
            notebook.setAttribute("data-expand", "false")
        }
    }

    document.addEventListener('DOMContentLoaded', function (event) {
        document.querySelectorAll(".mma-notebook-trigger").forEach((e) => {
            if (e.parentNode.getAttribute("data-expand") == "true") {
                e.parentNode.setAttribute("data-expand", "false")
                expandNotebook(e.parentNode.id)
                e.addEventListener("click", collapseNotebook)
            } else {
                e.addEventListener("click", expandNotebook)
            }
        })
    })

    var resizeNotebook = function () {
        document.querySelectorAll(".mma-notebook").forEach(notebook => {
            var container = notebook.querySelector(".mma-notebook-container")
            if (container && notebook.getAttribute("data-expand") == "true") {
                collapseNotebookWithCallback(notebook.id, () => { expandNotebook(notebook.id) })
            }
        })
    }
    var resizeTimeoutMMA;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeoutMMA);
        resizeTimeoutMMA = setTimeout(resizeNotebook, 100);
    })

})()