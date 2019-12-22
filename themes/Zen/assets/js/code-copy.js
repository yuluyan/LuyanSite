document.addEventListener('DOMContentLoaded', function (event) {

    var addCopyButtons = function (clipboard) {
        document.querySelectorAll('.highlight > :first-child').forEach(function (codeBlock) {
            if (
                (codeBlock.firstElementChild.getAttribute("data-lang") !== "plaintext") ||
                (
                    codeBlock.firstElementChild.getAttribute("data-lang") == "plaintext" &&
                    codeBlock.firstElementChild.innerText.substr(0, 4) !== "[nc]"
                )
            ) {

                var code = ""

                if (codeBlock.firstElementChild.nodeName == "TABLE") {
                    // with line number
                    code = codeBlock.querySelectorAll("pre")[1].firstElementChild.innerText
                } else if (codeBlock.firstElementChild.nodeName == "CODE") {
                    // without line number
                    code = codeBlock.firstElementChild.innerText
                } else {
                    // unknown situation
                    console.log(codeBlock.firstElementChild)
                }

                var button = document.createElement('button');
                button.className = 'copy-code-button';
                button.type = 'button';
                button.innerText = 'Copy';

                button.addEventListener('click', function () {
                    clipboard.writeText(code).then(function () {
                        /* Chrome doesn't seem to blur automatically,
                           leaving the button in a focused state. */
                        //button.blur();
                        button.innerText = 'Copied!';
                        setTimeout(function () {
                            button.innerText = 'Copy';
                        }, 1200);
                    }, function (error) {
                        button.innerText = 'Error';
                    });
                });
                codeBlock.parentNode.parentNode.insertBefore(button, codeBlock.parentNode);
            } else {
                if (codeBlock.firstElementChild.innerText.substr(0, 4) == "[nc]") {
                    codeBlock.firstElementChild.innerText = codeBlock.firstElementChild.innerText.substr(4)
                }
            }
        })

    }

    if (navigator && navigator.clipboard) {
        addCopyButtons(navigator.clipboard);
    } else {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js';
        script.integrity = 'sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=';
        script.crossOrigin = 'anonymous';
        script.onload = function () {
            addCopyButtons(clipboard);
        };

        document.body.appendChild(script);
    }



})