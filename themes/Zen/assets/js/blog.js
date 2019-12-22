// A star * is where the break point is.
var quotes = [
        /* Physicists */
    [
        "If you can't explain it simply, *you don't understand it well enough.",
        "Albert Einstein"
    ],
    [
        "The more the universe seems comprehensible, *the more it seems pointless.",
        "Steven Weinberg"
    ],
    [
        "Why nature is mathematical is a mystery... *The fact that there are rules at all is a kind of miracle.",
        "Richard Phillips Feynman"
    ],
    [
        "Not only is the Universe stranger than we think, *it is stranger than we can think.",
        "Werner Heisenberg"
    ],
    [
        "There are only two kinds of math books. *Those you cannot read beyond the first sentence, **and those you cannot read beyond the first page.",
        "Chen Ning Yang"
    ],
    [
        "I don't like it, *and I'm sorry I ever had anything to do with it.",
        "Erwin Schr&ouml;dinger"
    ],
    [
        "Nobody ever figures out what life is all about, **and it doesn't matter. *Explore the world. **Nearly everything is really interesting ***if you go into it deeply enough.",
        "Richard Phillips Feynman"
    ],
    [
        "We are just an advanced breed of monkeys **on a minor planet of a very average star. *But we can understand the Universe. **That makes us something very special.",
        "Stephen Hawking"
    ],
    [
        "A passion for calculus can unlock new worlds",
        "Isaac Newton"
    ],
    [
        "One never notices what has been done; *one can only see what remains to be done.",
        "Marie Sk&#322;odowska Curie"
    ],
    /* Mathematicians */
    [
        "...it seemed to me that the effort **to instruct myself had no effect other than *the increasing discovery of my own ignorance.",
        "Ren&eacute; Descartes"
    ],
    [
        "I do not know.",
        "Joseph-Louis Lagrange"
    ],
    [
        "It is not knowledge, but the act of learning, not possession but the act of getting there, which grants the greatest enjoyment.",
        "Carl Friedrich Gauss"
    ],
    [
        "A mathematician is a device *for turning coffee into theorems",
        "Alfr&eacute;d R&eacute;nyi"
    ],
    [
        "$e^{i\\pi}+1 = 0$.",
        "Leonhard Euler"
    ],
    [
        "Mathematics is the art of *giving the same name to different things.",
        "Henri Poincar&eacute;"
    ],
    [
        "In mathematics you don't understand things. *You just get used to them.",
        "John von Neumann"
    ],
    [
        "The introduction of numbers as coordinates is an act of violence.",
        "Hermann Weyl"
    ],
    [
        "My brain is open.",
        "Paul Erd&otilde;s"
    ],
    [
        "I have discovered a truly marvellous proof of this, *which this margin is too narrow to contain.",
        "Pierre de Fermat"
    ],
    /* Musicians */
    [
        "The music is not in the notes, *but in the silence between.",
        "Wolfgang Amadeus Mozart"
    ],
    [
        "If I decide to be an idiot, *then I'll be an idiot on my own accord.",
        "Johann Sebastian Bach"
    ],
    [
        "I shall create a new world for myself.",
        "Fr&eacute;d&eacute;ric Chopin"
    ],
    [
        "Friends applaud, the comedy is over.",
        "Ludwig van Beethoven"
    ],
    [
        "When a man is in despair, *it means that he still believes in something.",
        "Dmitri Shostakovich"
    ],
    [
        "Too many pieces of music *finish too long after the end.",
        "Igor Stravinsky"
    ],
    [
        "I can't understand why **people are frightened of new ideas. *I'm frightened of the old ones.",
        "John Cage"
    ],
    [
        "There was no one near to confuse me, *so I was forced to become original",
        "Joseph Haydn"
    ],
    [
        "In order to compose, **all you need to do is *remembering a tune that nobody else has thought of.",
        "Robert Schumann"
    ],
    [
        "Music is the arithmetic of sounds *as optics is the geometry of light.",
        "Claude Debussy"
    ],
    /* Others */
    [
        "We learn from experience *that men never learn anything from experience.",
        "George Bernard Shaw"
    ],
    [
        "We are all in the gutter, *but some of us are looking at the stars.",
        "Oscar Wilde"
    ]
]

document.addEventListener('DOMContentLoaded', function (event) {
    var quoteId = Math.floor(Math.random() * quotes.length)
    if (quoteId == 14) {
        if (!window.location.href.includes("posts")) {
            quoteId = 15
        }
    }
    var quoteString = quotes[quoteId][0]
    var maxCount = 0, currCount = 0
    for (var i = 0; i < quoteString.length; i++) {
        if (quoteString[i] == '*') {
            currCount += 1
        } else {
            if (currCount > maxCount) maxCount = currCount
            currCount = 0
        }
    }

    var parseString = function (str, level) {
        var currStarCount = 0
        var stringStart = 0
        var ret = ""
        var hasStar = false
        for (var i = 0; i < str.length; i++) {
            if (str[i] == '*') {
                currStarCount += 1
                hasStar = true
            } else {
                if (currStarCount == level) {
                    ret += parseString(str.substring(stringStart, i - level), level + 1)
                    stringStart = i
                }
                currStarCount = 0
            }
        }
        if (!hasStar) return " <span>" + str + "</span>"

        ret += parseString(str.substring(stringStart), level + 1)
        return " <span>" + ret + "</span>"
    }
    document.querySelector(".quote").innerHTML = parseString(quoteString, 1)

    document.querySelector(".quote-name").innerHTML = "&mdash; " + quotes[quoteId][1]
})