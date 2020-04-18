document.addEventListener('DOMContentLoaded', function (event) {

  // Load citation modal on 'BibTex' click.
  let modal = document.querySelector('#modal')
  if (modal !== null) {
    let codeField = modal.getElementsByClassName('code-bibtex')[0]
    let closeButton = modal.getElementsByClassName('close-bibtex')[0]
    let copyButton = modal.getElementsByClassName('copy-bibtex')[0]
    let downloadButton = modal.getElementsByClassName('download-bibtex')[0]
    let modalError = modal.getElementsByClassName('modal-error')[0];

    let modalCopied = document.querySelector('#modal-copied')

    var bibtexButton = document.querySelectorAll('.bibtex-btn')
    for (var i = 0; i < bibtexButton.length; i++) {
      bibtexButton[i].addEventListener('click', function (e) {
        e.preventDefault()

        let filename = this.getAttribute("data-filename")
        // load bibtex file content
        var request = new XMLHttpRequest()
        request.open('GET', filename, true)
        request.onload = function () {
          if (request.status >= 200 && request.status < 400) {
            var resp = request.responseText
            codeField.innerHTML = resp
            downloadButton.setAttribute('href', filename)
          } else {
            modalError.innerHTML = 'Error code: ' + request.status
          }
        }
        request.send()

        // display modal dialog
        modal.classList.add('visible')
        document.querySelector('body').classList.add('modal-open')
      }
      )
    }

    copyButton.onclick = function (e) {
      e.preventDefault()
      codeField.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        modalError.innerHTML = 'Failed to copy BibTex.'
      }
      modal.classList.remove('visible')
      modalCopied.classList.add('visible')
      setTimeout(function () {
        modalCopied.classList.remove('visible')
        document.querySelector('body').classList.remove('modal-open')
      }, 700)
    }

    closeButton.onclick = function () {
      modal.classList.remove('visible')
      document.querySelector('body').classList.remove('modal-open')
    }

    document.querySelector('body').onclick = function (e) {
      if (e.target == document.querySelector('#modal .modal-dialog') || e.target == modal) {
        modal.classList.remove('visible')
        document.querySelector('body').classList.remove('modal-open')
      }
      if (e.target == document.querySelector('#modal-copied .modal-dialog') || e.target == modalCopied) {
        modalCopied.classList.remove('visible')
        document.querySelector('body').classList.remove('modal-open')
      }
    }
    document.addEventListener('keydown', function (e) {
      if (e.keyCode == 27) {
        modal.classList.remove('visible')
        modalCopied.classList.remove('visible')
        document.querySelector('body').classList.remove('modal-open')
      }
    })


    // Read more abstract functions
    var readmoreButton = document.querySelectorAll('.read-more-btn a')
    for (var i = 0; i < readmoreButton.length; i++) {
      readmoreButton[i].addEventListener('click', function (e) {
        e.preventDefault()

        let box = e.target.parentNode.parentNode
        let absHeight = box.getAttribute('data-absHeight')
        let height = box.scrollHeight
        let mask = box.getElementsByClassName('read-more-mask')[0]

        if (e.target.innerHTML == '+ Abstract') {
          box.setAttribute('style', 'height: ' + height + 'px; max-height: 9999px;')
          mask.setAttribute('style', 'opacity: 0')
          e.target.innerHTML = '- Show less'
        } else {
          box.setAttribute('style', 'height: ' + height + 'px; max-height: 9999px;')
          setTimeout(function () {
            box.setAttribute('style', 'height: ' + absHeight + 'px; max-height: 9999px;')
          }, 1)
          setTimeout(function () {
            box.setAttribute('style', 'max-height: ' + absHeight + 'px;')
          }, 500)
          //box.setAttribute('style', 'height: ' + absHeight + 'px; max-height: ' + absHeight + 'px;')
          mask.setAttribute('style', 'opacity: 1')
          e.target.innerHTML = '+ Abstract'
        }

      }
      )
    }
  }


  // Set height of expanded abstract when change screen size
  window.addEventListener('resize', function () {
    var readmoreBox = document.querySelectorAll('.read-more-box')
    for (var i = 0; i < readmoreBox.length; i++) {
      if (readmoreBox[i].getElementsByClassName('read-more-btn')[0].firstChild.innerHTML == '- Show less') {
        readmoreBox[i].setAttribute('style', 'height: auto; max-height: 9999px;')
      }
    }
  })

})
