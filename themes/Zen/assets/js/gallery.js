document.addEventListener('DOMContentLoaded', function (event) {

    var maxImageDim = 900.0

    var initPhotoSwipeFromDOM = function (gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements 
        // (children of gallerySelector)
        var parseThumbnailElements = function (el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for (var i = 0; i < numNodes; i++) {
                figureEl = thumbElements[i]; // <figure> element
                // include only element nodes 
                if (figureEl.nodeType !== 1 || figureEl.classList.contains("gallery-figure-hide") || figureEl.classList.contains("travel-title")) {
                    continue;
                }
                linkEl = figureEl.children[0]; // <a> element
                size = linkEl.getAttribute('data-size').split('x');
                // create slide object
                if (size[0] > size[1]) {
                    if (size[0] > maxImageDim) {
                        size[1] = size[1] * maxImageDim / size[0]
                        size[0] = maxImageDim
                    }
                } else {
                    if (size[1] > maxImageDim) {
                        size[0] = size[0] * maxImageDim / size[1]
                        size[1] = maxImageDim
                    }
                }
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };
                if (figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }
                if (linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }
                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && (fn(el) ? el : closest(el.parentNode, fn));
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function (e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function (el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });
            if (!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;
            //console.log(numChildNodes)
            for (var i = 0; i < numChildNodes; i++) {
                if (childNodes[i].nodeType !== 1 || childNodes[i].classList.contains("gallery-figure-hide")) {
                    continue;
                }

                if (childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if (index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe(index, clickedGallery);
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function () {
            var hash = window.location.hash.substring(1),
                params = {};

            if (hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if (pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if (params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function (index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                }

            };

            // PhotoSwipe opened from URL
            if (fromURL) {
                if (options.galleryPIDs) {
                    // parse real index when custom PIDs are used 
                    // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    // in URL indexes start from 1
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            // exit if index not found
            if (isNaN(options.index)) {
                return;
            }

            if (disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll(gallerySelector);

        for (var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i + 1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if (hashData.pid && hashData.gid) {
            openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
        }

    };




    // initialize (sort and display) figures
    var initFigures = function () {
        Array.from(document.querySelectorAll(".gallery-figure[data-date]"))
            .sort(({ dataset: { date: a } }, { dataset: { date: b } }) => b.localeCompare(a))
            .forEach((item) => item.parentNode.appendChild(item))

        var figures = document.querySelectorAll(".gallery-figure")

        var totalWidth = figures[0].parentNode.getBoundingClientRect().width
        var columnCount = 4
        if (totalWidth < 640) {
            columnCount = 3
        }
        if (totalWidth <= 450) {
            columnCount = 2
        }
        if (totalWidth <= 300) {
            columnCount = 1
        }
        var figureWidth = (1.0 * totalWidth) / columnCount

        Array.from(figures).forEach((f, i) => {
            f.style.width = figureWidth + "px"
            //f.style.height = after[i][3] + "px"
            f.style.transform = transformString(1, 1, 0, 0)
            f.style.opacity = 1
        })

        return { "figures": figures, "initialFigureWidth": figureWidth }
    }

    var filterOnclick = function (figures, field, query, isTravel = false) {
        var filter = function (e) {
            e.preventDefault()
            if (e.target.classList.contains("badge-reverse")) return

            toggleSelector(e.target, ".gallery-selector")

            var changeInfo
            if (!isTravel) {
                removeTravelTitle()
                changeInfo = calculateAfter(figures, getFiguresId(figures, field, query))
            } else {
                changeInfo = calculateAfterTravel(figures)
            }
            performAnimation(figures, changeInfo)

            initPhotoSwipeFromDOM('.blog-gallery-block');
        }
        return filter
    }

    // Generate all tags
    var initGalleryTags = function (figures) {
        photoTags = []
        var tagList = document.querySelector("#gallery-taglist")
        for (var i = 0; i < figures['figures'].length; i++) {
            var tags = figures['figures'][i].getAttribute("data-tags").split(',')
            for (var j = 0; j < tags.length; j++) {
                if (photoTags.indexOf(tags[j]) === -1)
                    photoTags.push(tags[j]);
            }
        }
        photoTags.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase())
        })
        for (var i = 0; i < photoTags.length; i++) {
            var tag = document.createElement("li")
            var taglink = document.createElement("div")
            taglink.className = "btn-normal gallery-selector"
            taglink.innerHTML = photoTags[i]
            taglink.setAttribute("data-tag", photoTags[i])
            taglink.onclick = filterOnclick(figures, "data-tags", photoTags[i])

            tag.appendChild(taglink)
            tagList.appendChild(tag)
        }

        return photoTags
    }

    var initShowFigures = function (figures) {
        performAnimation(figures, calculateAfter(figures, getFiguresId(figures, "NONE", "")))
        figures['figures'].forEach((f) => {
            f.classList.remove("gallery-figure-initial")
        })
        performAnimation(figures, calculateAfter(figures, getFiguresId(figures, "ALL", "")))
    }

    var toggleSelector = function (self, type) {
        self.classList.remove("btn-normal")
        self.classList.add("badge-reverse")
        var all = document.querySelectorAll(type)
        for (var j = 0; j < all.length; j++) {
            if (all[j] !== self) {
                all[j].classList.add("btn-normal")
                all[j].classList.remove("badge-reverse")
            }
        }
    }

    var minMaxSum = function (a, k) {
        var n = a.length
        var high = 0, low = 0, mid = 0
        for (var i = 0; i < n; ++i) {
            high += a[i];
            low = Math.max(a[i], low);
        }
        mid = parseInt((low + high) / 2);

        while (high > low) {
            //console.log("low=",low,"mid=",mid,"high=",high)
            part_sum = 0;
            var parts = 1;
            for (var i = 0; i < n; ++i) {
                if (part_sum + a[i] > mid) {
                    part_sum = a[i];
                    parts++;
                } else {
                    part_sum += a[i];
                }
            }
            //console.log(parts)
            if (parts <= k) {
                high = mid;
            } else {
                low = mid + 1;
            }
            mid = parseInt((low + high) / 2);
        }
        return mid;
    }

    var calculateAfter = function (figures, figuresId) {
        var margin = 2.5

        var containerTop = figures['figures'][0].parentNode.offsetTop
        var containerLeft = figures['figures'][0].parentNode.offsetLeft

        var before = Array.from(figures['figures']).map((f) => {
            var bound = f.getBoundingClientRect()
            return [(parseInt(f.getAttribute("data-x")) || 0), (parseInt(f.getAttribute("data-y")) || 0), bound.width, bound.height, f.classList.contains("gallery-figure-show")]
        })

        var totalWidth = figures['figures'][0].parentNode.getBoundingClientRect().width
        var columnCount = 4
        if (totalWidth < 640) {
            columnCount = 3
        }
        if (totalWidth <= 450) {
            columnCount = 2
        }
        if (totalWidth <= 300) {
            columnCount = 1
        }
        var figureWidth = (1.0 * totalWidth - (columnCount - 1) * margin) / columnCount


        var totalFigureHeight = 0.0
        var figureHeights = figuresId.map((fid) => {
            var f = figures['figures'][fid]
            var size = f.querySelector("a").getAttribute('data-size').split('x');
            var aspectRatio = (1.0 * size[0]) / size[1]
            var height = figureWidth / aspectRatio
            totalFigureHeight += height
            return height
        })

        var figuresColumnIds = []

        //console.log(figureHeights.map((d)=>{return Math.ceil(d)}))
        var maxColumnHeight = minMaxSum(figureHeights.map((d) => { return Math.ceil(d) }), columnCount)
        //console.log(maxColumnHeight)
        var iter = 0
        var currCol = 0
        var currentColumnHeight = 0.0
        var containerHeightAfter = 0.0
        //console.log(figuresId.length)
        while (iter < figuresId.length && currCol < columnCount) {
            currCol += 1

            var figuresColumnIdTmp = []
            for (; iter < figuresId.length;) {
                currentColumnHeight += figureHeights[iter]
                //console.log(iter)
                //console.log(currentColumnHeight)
                if (currentColumnHeight <= maxColumnHeight) {
                    figuresColumnIdTmp.push(figuresId[iter])
                    iter += 1
                } else {
                    currentColumnHeight -= figureHeights[iter]
                    break
                }
            }

            figuresColumnIds.push(figuresColumnIdTmp)
            if (currentColumnHeight > containerHeightAfter)
                containerHeightAfter = currentColumnHeight
            currentColumnHeight = 0.0
        }
        //console.log(iter)

        var after = Array.from(figures['figures']).map((f) => {
            var bound = f.getBoundingClientRect()
            return [containerTop + Math.random() * figureWidth, containerLeft + Math.random() * (columnCount - 1) * figureWidth, bound.width, bound.height, false]
        })

        iter = 0
        accuHeight = 0.0
        for (var col = 0; col < figuresColumnIds.length; col++) {
            for (var j = 0; j < figuresColumnIds[col].length; j++) {
                var fid = figuresColumnIds[col][j]
                height = figureHeights[iter]

                after[fid][0] = accuHeight + containerTop
                after[fid][1] = col * figureWidth + (col - 1) * margin + containerLeft
                after[fid][2] = figureWidth
                after[fid][3] = height
                after[fid][4] = true

                accuHeight += height + margin
                iter += 1
            }
            accuHeight = 0.0
        }

        var containerHeightAfter = maxColumnHeight + 120
        if (columnCount == 1) {
            containerHeightAfter += 250
        }
        return { "before": before, "after": after, "containerHeightAfter": containerHeightAfter }
    }

    var calculateAfterTravel = function (figures) {
        var groupMargin = 75;
        var travelIdGroups = {}
        figures['figures'].forEach((f, id) => {
            if (f.getAttribute("data-category") === "Travel") {
                var date = f.getAttribute("data-date")
                if (date in travelIdGroups) {
                    travelIdGroups[date].push(id)
                } else {
                    travelIdGroups[date] = [id]
                }
            }
        })
        // date is already sorted
        var changeInfo = calculateAfter(figures, getFiguresId(figures, "data-category", "Travel"))
        var accuYOffset = groupMargin
        for (var date in travelIdGroups) {
            var partialInfo = calculateAfter(figures, travelIdGroups[date])
            travelIdGroups[date].forEach((id) => {
                changeInfo["after"][id] = partialInfo["after"][id]
                changeInfo["after"][id][0] += accuYOffset - 35
            })

            var firstFigureId = travelIdGroups[date][0]
            var travelTitle = document.createElement("div")

            var location = figures['figures'][firstFigureId].getAttribute("data-location")
            var dateString = new Date(date);
            dateString = dateString.toLocaleDateString("en-US", { year: 'numeric', month: 'long' });

            travelTitle.innerHTML = "<span class='travel-title-location'>" + location + "</span>" + ", " + dateString
            travelTitle.classList.add("travel-title")
            travelTitle.style.top = (changeInfo["after"][firstFigureId][0] - 50) + "px"
            travelTitle.style.opacity = 0
            document.querySelector(".blog-gallery-block").appendChild(travelTitle)


            accuYOffset += partialInfo["containerHeightAfter"] - 120 + groupMargin
        }
        var steps = 0
        var timer = setInterval(function () {
            travelTitles = document.querySelectorAll(".travel-title")
            steps++
            travelTitles.forEach(e => { e.style.opacity = easeInOutQuint(0.025 * steps) })
            if (steps >= 40) {
                clearInterval(timer)
                timer = undefined
            }
        }, 10)
        changeInfo["containerHeightAfter"] = accuYOffset
        return changeInfo
    }

    var easeInOutQuint = function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    var removeTravelTitle = function () {
        var steps = 0
        var timer = setInterval(function () {
            travelTitles = document.querySelectorAll(".travel-title")
            steps++
            travelTitles.forEach(e => { e.style.opacity = 1 - easeInOutQuint(0.025 * steps) })
            if (steps >= 40) {
                clearInterval(timer)
                timer = undefined
                travelTitles.forEach(e => {
                    e.parentNode.removeChild(e)
                });
            }
        }, 10)
    }

    var transformString = function (sx, sy, tx, ty) {
        return "translate(" + tx + "px," + ty + "px) scale(" + sx + "," + sy + ")"
    }

    var performAnimation = function (figures, changeInfo) {
        var before = changeInfo['before']
        var after = changeInfo['after']

        figures['figures'][0].parentNode.parentNode.style.height = changeInfo['containerHeightAfter'] + "px"

        var durationIndexMax = 8

        // get figures to animation starting position
        Array.from(figures['figures']).forEach((f, i) => {
            for (var ani = 1; ani <= durationIndexMax; ani++)
                f.classList.remove("gallery-figure-animation-" + ani)

            if (before[i][4]) {
                // visible at first
                var scale = before[i][2] / figures['initialFigureWidth']
                if (scale != 1) {
                    f.style.transformOrigin = "top left"
                }
                f.style.transform = transformString(scale, scale, before[i][1], before[i][0])
                f.style.opacity = 1
            } else {
                f.style.transform = transformString(0.001, 0.001, after[i][1], after[i][0])
                f.style.opacity = 0
            }

        })

        // make the transition
        Array.from(figures['figures']).forEach((f, i) => {
            f.setAttribute("data-x", after[i][1])
            f.setAttribute("data-y", after[i][0])
            var r = parseInt(Math.random() * durationIndexMax + 1)
            f.classList.add("gallery-figure-animation-" + r)

            if (after[i][4]) {
                //suppose to show
                var scale = after[i][2] / figures['initialFigureWidth']
                if (scale != 1) {
                    f.style.transformOrigin = "top left"
                }
                f.style.opacity = 1
                f.style.transform = transformString(scale, scale, after[i][1], after[i][0])

                f.classList.remove("gallery-figure-hide")
                f.classList.add("gallery-figure-show")
            } else {
                // supposed to hide
                f.style.opacity = 0
                f.style.transform = transformString(0.001, 0.001, after[i][1], after[i][0])

                f.classList.remove("gallery-figure-show")
                f.classList.add("gallery-figure-hide")
            }
        })
    }

    var getFiguresId = function (figures, field, query) {
        if (field === "ALL") {
            return Array.from(Array(figures['figures'].length).keys())
        } else if (field === "NONE") {
            return []
        }
        else {
            var ids = []
            figures['figures'].forEach((f, fid) => {
                if (f.getAttribute(field).toLowerCase().includes(query.toLowerCase())) {
                    ids.push(fid)
                }
            })
            return ids
        }
    }
    var getShownFiguresId = function (figures) {
        var ids = []
        figures['figures'].forEach((f, fid) => {
            if (f.classList.contains("gallery-figure-show"))
                ids.push(fid)
        })
        return ids
    }

    var initGallerySelectors = function (figures) {
        var selectors = document.querySelectorAll(".gallery-selector")
        for (var i = 0; i < selectors.length; i++) {
            var label = selectors[i].getAttribute('data-category')
            if (label === "Travel") {
                // Travel category
                selectors[i].onclick = filterOnclick(figures, "data-category", "Travel", true)
            } else if (label === "Daily") {
                // Daily category
                selectors[i].onclick = filterOnclick(figures, "data-category", "Daily")
            } else if (label === "All") {
                // All category
                selectors[i].onclick = filterOnclick(figures, "ALL", "")
            } else {
                // Other tags
            }
        }
    }


    var figures = initFigures()
    var photoTags = initGalleryTags(figures)

    initShowFigures(figures)
    initPhotoSwipeFromDOM('.blog-gallery-block');
    initGallerySelectors(figures)

    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            if (document.querySelector(".gallery-selector.badge-reverse").getAttribute("data-category") == "Travel") {
                removeTravelTitle()
                performAnimation(figures, calculateAfterTravel(figures))
            } else {
                performAnimation(figures, calculateAfter(figures, getShownFiguresId(figures)))
            }
        }, 100);
    })

})