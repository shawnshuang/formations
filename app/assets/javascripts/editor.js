(function(window, document, $) {
    var dClientWidth;
    var dClientHeight;
    var canvas;
    var canvasWidth;
    var canvasHeight;
    var canvasContext;

    // Variable for the length of each grid square
    var squareLen;

    // Initial left and top offsets for member icons
    var startingOffsets = {};

    // The currently active Formation
    var currFormation;
    // Miniature canvas in filmstrip for the currently active Formation
    var currMiniCanvas;
    var miniCanvasContext;

    /*************
     * Formation *
     *************/

    /* Formation is an object representation of placements of members in a single formation.
     *
     * @param {Object} sOffsets -- Object literal that maps member id's to the member 
     *                             icon's starting left and top offsets. */
    function Formation(sOffsets) {
        // All member icons initialized to have starting offsets as their coordinate offsets
        this.members = sOffsets;
    }

    /* Update a member's coordinate offsets.
     *
     * @param {Object} member -- Object literal that maps the to-be-updated member's id to its new
     *                           left and top offsets. */
    Formation.prototype.updateMember = function(memberToUpdate) {
        for (var id in memberToUpdate) {
            // Check that the property is not from a prototype
            if (memberToUpdate.hasOwnProperty(id)) {
                if (id in this.members) {
                    this.members[id] = memberToUpdate[id];
                    // Updating member operation succeeded
                    return true;
                } else {
                    // Adding member operation failed. Member not found.
                    return false;
                }
            }
        }
    }

    /* Add a member to a Formation.
     *
     * @param {Object} newMember -- Object literal that maps the new member's id to its icon's
     *                              starting left and top offsets. */
    Formation.prototype.addMember = function(newMember) {


        for (var id in newMember) {
            // Check that the property is not from a prototype
            if (newMember.hasOwnProperty(id)) {
                if (id in this.members) {
                    // Adding member operation failed. Avoid overwriting an existing member's data.
                    return false;
                } else {
                    this.members[id] = newMember[id];
                    // Adding member operation succeeded
                    return true;
                }
            }
        }
    }

    /*************
     * Functions *
     *************/

    /* Draw grid lines on canvas */
    function drawGrid() {
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        // Calculate the length of each grid square
        squareLen = Math.round(canvasWidth / 30);

        // Setup drawing paths for vertical lines
        for (var x = squareLen; x < canvasWidth; x += squareLen) {
            canvasContext.moveTo(x, 0);
            canvasContext.lineTo(x, canvasHeight);
        }

        // Setup drawing paths for horizontal lines
        for (var y = squareLen; y < canvasHeight; y += squareLen) {
            canvasContext.moveTo(0, y);
            canvasContext.lineTo(canvasWidth, y);
        }

        canvasContext.strokeStyle = '#C0C0C0';
        canvasContext.stroke();

        console.log('canvas grid drawn');
    }

    /* Add HTML to create snap grid for draggable elements */
    function createSnapGrid() {
        var eWrapper = document.getElementById('editor-wrapper');

        // Vertical snap div's
        var vSnapDivs = [];
        // Horizontal snap div's
        var hSnapDivs = [];

        // Add vertical snap div's
        for (var i = 1; i < Math.floor(canvasWidth / squareLen); i += 1) {
            vSnapDivs[i] = document.createElement('div');
            vSnapDivs[i].className += 'snap-div v-snap-div-' + (i+1);
            vSnapDivs[i].style.position = 'absolute';
            vSnapDivs[i].style.width = '0px';
            vSnapDivs[i].style.height = (Math.floor(canvasHeight / squareLen) - 1) * squareLen + 'px';
            vSnapDivs[i].style.left = canvas.offsetLeft + (squareLen / 2) + (i * squareLen) - 1 + 'px';
            vSnapDivs[i].style.top = canvas.offsetTop + (squareLen / 2) + 'px';
            eWrapper.appendChild(vSnapDivs[i]);
        }

        // Add horizontal snap div's
        for (var j = 1; j < Math.floor(canvasHeight / squareLen) - 1; j += 1) {
            hSnapDivs[j] = document.createElement('div');
            hSnapDivs[j].className += 'snap-div h-snap-div-' + (j+1);
            hSnapDivs[j].style.position = 'absolute';
            hSnapDivs[j].style.width = Math.floor(canvasWidth / squareLen) * squareLen + 'px';
            hSnapDivs[j].style.height = '0px';
            hSnapDivs[j].style.left = canvas.offsetLeft + (squareLen / 2) + 'px';
            hSnapDivs[j].style.top = canvas.offsetTop + (squareLen / 2) + (j * squareLen) - 1 + 'px';
            eWrapper.appendChild(hSnapDivs[j]);
        }

        console.log('canvas snap grid added');
    }

    /* Resize canvas based on new window size */
    function resizeCanvas() {
        canvas.width = dClientWidth * 0.67;
        canvas.height = dClientHeight - 66;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';

        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        drawGrid();

        createSnapGrid();

        console.log('canvas resized');
    }

    /* Redraws the current Formation's mini canvas in the filmstrip */
    function redrawMiniCanvas() {
        miniCanvasContext.clearRect(0, 0, currMiniCanvas.width, currMiniCanvas.height);

        for (var member in currFormation.members) {
            // Check that the property is not from a prototype
            if (currFormation.members.hasOwnProperty(member)) {
                miniCanvasContext.beginPath();
                miniCanvasContext.arc((currFormation.members[member].left - canvas.offsetLeft) / 6.90588235295,
                                      (currFormation.members[member].top - canvas.offsetTop) / 6.90588235295,
                                      3, 0, 2 * Math.PI);
                miniCanvasContext.closePath();
                miniCanvasContext.fillStyle = '#556170';
                miniCanvasContext.fill();
            }
        }
    }

    /* Initialize drag and drop functionality */
    function initDragDrop() {
        // // X- and y-coordinates of cursor respective to the canvas
        // var canvasX;
        // var canvasY;

        // // Variables for tracking coordinates of closest grid intersection for dropping member icons,
        // // relative to the canvas
        // var dropX;
        // var dropY;

        // Create array of member icons
        var members = [].slice.call(document.getElementsByClassName('member-icon'));

        // Track initial left and top offsets for member icons
        members.forEach(function(member) {
            startingOffsets[member.id] = { left: member.offsetLeft, 
                                           top:  member.offsetTop };
        });

        // Initialize first Formation with a copy of the starting offsets
        var startingOffsetsCopy = $.extend(true, {}, startingOffsets)
        currFormation = new Formation(startingOffsetsCopy);

        // Enable jQuery draggable functionality for each member icon
        members.forEach(function(member) {
            $(member).draggable({
                // Constrained area allowed for dragging
                containment: [canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top,
                              dClientWidth,                        dClientHeight - 40],
                // No auto-scroll when dragging
                scroll: false,
                // Snap to snap div's
                snap: '.snap-div',
                // Ccallback function for when dragging starts
                start: function(event) {
                    // Add being-dragged styling
                    member.className += ' ' + 'being-dragged';
                },
                // Callback function for whenever element is dragged
                drag: function(event) {
                    // // The four possible grid intersections closest to the cursor at any point
                    // var fourCorners = [];
                    // // X-coordinate of currently examined 'corner', relative to the canvas
                    // var currX;
                    // // Y-coordinate of currently examined 'corner', relative to the canvas
                    // var currY;
                    // // Computed distance between cursor and currently examined 'corner'
                    // var currDist;
                    // // X-coorindate of grid intersection closest to cursor, relative to the canvas
                    // var closestX;
                    // // Y-coorindate of grid intersection closest to cursor, relative to the canvas
                    // var closestY;
                    // // Computed distance between cursor and closest grid intersection
                    // var smallestDist = Number.MAX_VALUE;

                    // // X- and y-coordinates of cursor at this point of dragging
                    // canvasX = event.clientX - canvas.getBoundingClientRect().left;
                    // canvasY = event.clientY - canvas.getBoundingClientRect().top;

                    // // If the cursor is within the boundaries of the canvas
                    // if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
                    //     // Find grid intersection closest to cursor during dragging

                    //     var modX = Math.floor(canvasX / squareLen);
                    //     var modY = Math.floor(canvasY / squareLen);

                    //     fourCorners.push([modX * squareLen,       modY * squareLen]);
                    //     fourCorners.push([(modX + 1) * squareLen, modY * squareLen]);
                    //     fourCorners.push([modX * squareLen,       (modY + 1) * squareLen]);
                    //     fourCorners.push([(modX + 1) * squareLen, (modY + 1) * squareLen]);

                    //     // Calculate distance between cursor and each grid intersection
                    //     for (var i = 0; i < fourCorners.length; i += 1) {
                    //         currX = fourCorners[i][0];
                    //         currY = fourCorners[i][1];
                    //         currDist = Math.sqrt(Math.pow(canvasX - currX, 2) + Math.pow(canvasY - currY, 2));
                    //         // Track closest grid intersection
                    //         if (currDist < smallestDist) {
                    //             smallestDist = currDist;
                    //             closestX = currX;
                    //             closestY = currY;
                    //         }
                    //     }

                    //     // Save coordinates of closest grid intersection
                    //     dropX = closestX;
                    //     dropY = closestY;
                    // }
                },
                // Callback function for when dragging stops
                stop: function(event) {
                    // Remove being-dragged styling
                    member.className = 'member-icon';

                    // Left offset of the members panel
                    var membersPanel = document.getElementById('members-panel');
                    var membersPanelLeft = membersPanel.getBoundingClientRect().left;

                    // New offset coordinates for dopped member
                    var newOffsets = {};

                    // If the dragged member is dropped in the member's panel area
                    if (event.clientX > membersPanelLeft) {
                        // Show member icon's name from members panel
                        var memberName = $(member).siblings()[0]
                        $(memberName).show('100');

                        // Update coordinates of dropped member for the current Formation back to the starting location
                        newOffsets[event.target.id] = {
                            left: startingOffsets[event.target.id].left,
                            top: startingOffsets[event.target.id].top
                        };
                        currFormation.updateMember(newOffsets);

                        // Update mini canvas with removal of member from canvas
                        redrawMiniCanvas();
                    } else {
                        // Drop member icon to closest grid intersection
                        var newLeft = event.target.offsetLeft;
                        var newTop = event.target.offsetTop;
                        event.target.style.left = newLeft + 'px';
                        event.target.style.top = newTop + 'px';

                        // Hide member icon's name from members panel
                        var memberName = $(event.target).siblings()[0]
                        $(memberName).hide('200');

                        // Update coordinates of dropped member for the current Formation to the dropped location
                        newOffsets[event.target.id] = {
                            left: newLeft,
                            top: newTop
                        };
                        currFormation.updateMember(newOffsets);

                        // Update mini canvas with dragged member's new location
                        redrawMiniCanvas();
                    }

                    // // If the cursor is within the boundaries of the canvas
                    // if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
                    //     // Drop member icon to closest grid intersection
                    //     var newLeft = event.target.offsetLeft;
                    //     var newTop = event.target.offsetTop;
                    //     event.target.style.left = newLeft + 'px';
                    //     event.target.style.top = newTop + 'px';

                    //     // Hide member icon's name from members panel
                    //     var memberName = $(event.target).siblings()[0]
                    //     $(memberName).hide('200');

                    //     // Update coordinates of dropped member for the current Formation to the dropped location
                    //     newOffsets[event.target.id] = {
                    //         left: newLeft,
                    //         top: newTop
                    //     };
                    //     currFormation.updateMember(newOffsets);

                    //     // Update mini canvas with dragged member's new location
                    //     redrawMiniCanvas();
                    // } else {
                    //     // Show member icon's name from members panel
                    //     var memberName = $(member).siblings()[0]
                    //     $(memberName).show('100');

                    //     // Update coordinates of dropped member for the current Formation back to the starting location
                    //     newOffsets[event.target.id] = {
                    //         left: startingOffsets[event.target.id].left,
                    //         top: startingOffsets[event.target.id].top
                    //     };
                    //     currFormation.updateMember(newOffsets);

                    //     // Update mini canvas with removal of member from canvas
                    //     redrawMiniCanvas();
                    // }
                },
                // Reverts member icon to original position if not dropped on canvas.
                // Based off of: http://stackoverflow.com/questions/5735270/revert-a-
                // jquery-draggable-object-back-to-its-original-container-on-out-event-of
                revert: function(event) {
                    // Event is true when draggable is dropped on droppable. Else, event is false.
                    // jQuery reverts the draggable if the revert callback function returns true.

                    // Reposition the member icon to its original position
                    $(member).data('uiDraggable').originalPosition = {
                        left: startingOffsets[member.id].left,
                        top: startingOffsets[member.id].top
                    };

                    return !event;
                }
            });
        });

        // Enable jQuery droppable functionality for canvas
        $(canvas).droppable();
    }

    /* Computations to perform when page DOM is ready */
    function ready() {
        if (window.location.pathname == '/editor') {
            console.log('editor page ready');

            dClientWidth = document.documentElement.clientWidth;
            dClientHeight = document.documentElement.clientHeight;
            canvas = document.getElementById('canvas');
            canvasContext = canvas.getContext('2d');

            // Set up and draw canvas when editor page first loads
            resizeCanvas();

            // To Do: Add mini screenshot of first Formation

            var span = document.createElement('span');
            span.innerHTML = '1';
            span.style.position = 'relative';
            span.style.bottom = '70px';
            span.style.left = '10px';
            span.style.color = '#303030';
            span.style.fontWeight = 'bold';

            currMiniCanvas = document.createElement('canvas');
            miniCanvasContext = currMiniCanvas.getContext('2d');
            // 1.55877342419 is the width to height ratio of the main canvas
            currMiniCanvas.width = Math.floor(1.55877342419 * 85);
            currMiniCanvas.height = 85;
            currMiniCanvas.style.width = currMiniCanvas.width + 'px';
            currMiniCanvas.style.height = currMiniCanvas.height + 'px';
            currMiniCanvas.style.marginTop = '15px';
            currMiniCanvas.style.marginLeft = '15px';
            currMiniCanvas.style.marginRight = '14px';
            currMiniCanvas.style.borderStyle = 'solid';
            currMiniCanvas.style.borderWidth = '2px';
            currMiniCanvas.style.borderColor = '#505050';
            currMiniCanvas.style.backgroundColor = 'white';

            var filmstrip = document.getElementById('filmstrip');
            filmstrip.appendChild(span);
            filmstrip.appendChild(currMiniCanvas);

            initDragDrop();
        }
    }

    $(document).ready(ready);
    // $(window).resize(resizeCanvas);
})(window, document, window.jQuery);