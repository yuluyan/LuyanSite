document.addEventListener('DOMContentLoaded', function (event) {

    // number of digits
    let NumDigits = 8
    let digitsDiv = document.querySelector('#pwd-digits')

    for (var i = 0; i < NumDigits; i++) {
        let digitField = document.createElement("input")
        digitField.setAttribute("id", i)
        digitField.setAttribute("class", "digit")
        digitField.setAttribute("type", "text")
        digitField.setAttribute("maxlength", 1)

        // Number keys
        digitField.onkeypress = function(e) {
            var id = parseInt(this.getAttribute("id"))
            if (e.keyCode >= 48 && e.keyCode <= 57) {
                this.value = e.keyCode - 48
                if (id < NumDigits - 1) {
                    document.getElementById(id + 1).focus()
                } else {
                    if (
                        document.getElementById("0").value == "2" &&
                        document.getElementById("1").value == "0" &&
                        document.getElementById("2").value == "0" &&
                        document.getElementById("3").value == "2" &&
                        document.getElementById("4").value == "0" &&
                        document.getElementById("5").value == "1" &&
                        document.getElementById("6").value == "1" &&
                        document.getElementById("7").value == "9"
                    ) {
                        document.getElementById("enter").style.display = "none"
                        document.getElementById("roller").style = ""
                        setTimeout(function() {
                            document.getElementById("pwd-input").style.display = "none"
                            document.getElementById("my-video").style.display = "block"
                        }, 1000)
                    }
                }
            } else {
                e.preventDefault()
            }

        }

        // Backspace and Delete
        digitField.onkeydown = function(e) {
            var id = parseInt(this.getAttribute("id"))
            if (e.keyCode == 8 || e.keyCode == 46) {
                if (this.value == "" && id > 0) {
                    var prevField = document.getElementById(id - 1)
                    prevField.focus()
                    prevField.value = ""
                } else {
                    this.value = ""
                }
            } 
        }
        digitsDiv.appendChild(digitField)
    }

    document.getElementById("0").focus()

  })
  