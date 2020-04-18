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

    //dark theme preferred, set document with a `data-theme` attribute
    if (theme == "dark") {
        document.documentElement.setAttribute("data-theme", "dark")
        // change images with data-src-dark attribute
        Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
            img.src = img.getAttribute('data-src-dark')
        })
    }
}
detectColorScheme()

document.addEventListener('DOMContentLoaded', function (event) {



    //identify the toggle switch HTML element
    const toggleSwitch = document.querySelector('#theme-switch input[type="checkbox"]')

    //function that changes the theme, and sets a localStorage variable to track the theme between page loads
    function switchTheme(e) {
        if (e.target.checked) {
            localStorage.setItem('theme', 'dark')
            document.documentElement.setAttribute('data-theme', 'dark')

            // change images with data-src-dark attribute
            Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
                img.src = img.getAttribute('data-src-dark')
            })

            toggleSwitch.checked = true
        } else {
            localStorage.setItem('theme', 'light')
            document.documentElement.setAttribute('data-theme', 'light')

            // change images with data-src-dark attribute
            Array.from(document.querySelectorAll("[data-src-dark]")).forEach(img => {
                img.src = img.getAttribute('data-src-light')
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
