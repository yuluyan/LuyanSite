function detectColorScheme() {
    var theme = "light"    //default to light
    //local storage is used to override OS theme settings
    if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") == "dark") {
            var theme = "dark"
        }
    } else if (!window.matchMedia) {
        //matchMedia method not supported
        return false
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        var theme = "dark"
    }

    Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
        img.style.visibility = "hidden"
        img.style.opacity = 0
        img.style.transition = "opacity 0.9s ease-in-out;"
    })

    //dark theme preferred, set document with a `data-theme` attribute
    if (theme == "dark") {
        document.documentElement.setAttribute("data-theme", "dark")
        // change images with data-src-dark attribute
        Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
            if (img.src != img.getAttribute('data-src-dark')) {
                setTimeout(function () {
                    img.src = img.getAttribute('data-src-dark')
                    setTimeout(function () {
                        img.style.visibility = "visible"
                        img.style.opacity = 1
                    }, 100);
                }, 100);
            }
        })
    } else if (theme == "light") {
        document.documentElement.setAttribute("data-theme", "light")
        // change images with data-src-light attribute
        Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
            if (img.src != img.getAttribute('data-src-light')) {
                setTimeout(function () {
                    img.src = img.getAttribute('data-src-light')
                    setTimeout(function () {
                        img.style.visibility = "visible"
                        img.style.opacity = 1
                    }, 100);
                }, 100);
            }
        })
    }
}
detectColorScheme()

document.addEventListener('DOMContentLoaded', function (event) {

    detectColorScheme()

    //identify the toggle switch HTML element
    const toggleSwitch = document.querySelector('#theme-switch input[type="checkbox"]')

    //function that changes the theme, and sets a localStorage variable to track the theme between page loads
    function switchTheme(e) {
        if (e.target.checked) {
            localStorage.setItem('theme', 'dark')
            document.documentElement.setAttribute('data-theme', 'dark')

            // change images with data-src-dark attribute
            Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
                if (img.src != img.getAttribute('data-src-dark')) {
                    img.style.display = "none"
                    img.style.transition = ""
                    setTimeout(function () {
                        img.style.opacity = 0
                        img.src = img.getAttribute('data-src-dark')
                        img.style.display = "inline-block"
                        setTimeout(function () {
                            img.style.transition = "opacity 0.9s ease-in-out;"
                            img.style.opacity = 1
                        }, 900);
                    }, 100);
                }
            })

            toggleSwitch.checked = true
        } else {
            localStorage.setItem('theme', 'light')
            document.documentElement.setAttribute('data-theme', 'light')

            // change images with data-src-dark attribute
            Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
                if (img.src != img.getAttribute('data-src-light')) {
                    img.style.display = "none"
                    img.style.transition = ""
                    setTimeout(function () {
                        img.style.opacity = 0
                        img.src = img.getAttribute('data-src-light')
                        img.style.display = "inline-block"
                        setTimeout(function () {
                            img.style.transition = "opacity 0.9s ease-in-out;"
                            img.style.opacity = 1
                        }, 900);
                    }, 50);
                }
            })

            toggleSwitch.checked = false
        }
    }

    //listener for changing themes
    toggleSwitch.addEventListener('change', switchTheme, false)

    //pre-check the dark-theme checkbox if dark-theme is set
    if (document.documentElement.getAttribute("data-theme") == "dark") {
        toggleSwitch.checked = true
    }


})
