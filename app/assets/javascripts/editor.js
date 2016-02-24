(function(window, document, $) {
    /*************
     * Variables *
     *************/

    // Document's client width
    var docClientWidth;
    // Document's client height
    var docClientHeight;
    // Main canvas
    var canvas;
    // HTML5 canvas context for main canvas
    var canvasContext;
    // Length of grid square in main canvas
    var squareLen;
    // Member icons
    var memberIcons;
    // Initial left and top offsets for member icons
    var startingOffsets = {};
    // Boolean toggle to track if member icons are in photos view or names view
    var isPhotoView = true;
    // List of all Formations
    var formations = [];
    // Current active Formation
    var currFormation;
    // List of all preview slide containers
    var slideContainers = [];
    // Current active preview slide container
    var currSlideContainer;
    // Current active preview slide canvas
    var currSlideCanvas;
    // HTML5 canvas context for current active preview slide canvas
    var currSlideContext;

    /*************
     * Formation *
     *************/

    /* Formation is an object representation of placements of members.
     *
     * @param {Object} sOffsets -- Object literal that maps member id's to the
     *                             member icon's starting left and top offsets. */
    function Formation(sOffsets) {
        // All member icons initialized to have starting offsets as their left and top offsets
        this.members = sOffsets;
    }

    /* Update a member's left and top offsets.
     *
     * @param {Object} memberToUpdate -- Object literal that maps the to-be-updated
     *                                   member's id to its icon's new left and top
     *                                   offsets. */
    Formation.prototype.updateMember = function(memberToUpdate) {
        for (var id in memberToUpdate) {
            // Check that the property is not from a prototype
            if (memberToUpdate.hasOwnProperty(id)) {
                if (id in this.members) {
                    this.members[id] = memberToUpdate[id];
                    // Updating member success
                    return true;
                } else {
                    // Updating member failure. Member not found.
                    return false;
                }
            }
        }
    };

    /* Add a member to a Formation.
     *
     * @param {Object} newMember -- Object literal that maps the new member's
     *                              id to its icon's starting left and top
     *                              offsets. */
    Formation.prototype.addMember = function(newMember) {
        for (var id in newMember) {
            // Check that the property is not from a prototype
            if (newMember.hasOwnProperty(id)) {
                if (id in this.members) {
                    // Adding member failure. Avoid overwriting an existing member's data.
                    return false;
                } else {
                    this.members[id] = newMember[id];
                    // Adding member success
                    return true;
                }
            }
        }
    };

    /********************
     * Helper Functions *
     ********************/

    /* Draw grid lines on main canvas */
    function drawGrid() {
        // Clear the canvas to avoid drawing over previous drawing
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate the length of each grid square based on the width of member icons
        var memberIcon = document.getElementsByClassName('member-icon')[0];
        squareLen = memberIcon.offsetWidth;

        // Setup drawing paths for vertical lines
        for (var x = squareLen; x < canvas.width; x += squareLen) {
            // Avoid drawing on edges of canvas near toggle button
            if (x === squareLen * 2) {
                canvasContext.moveTo(x, squareLen);
                canvasContext.lineTo(x, canvas.height);    
            } else {
                canvasContext.moveTo(x, 0);
                canvasContext.lineTo(x, canvas.height);
            }
        }

        // Setup drawing paths for horizontal lines
        for (var y = squareLen; y < canvas.height; y += squareLen) {
            // Avoid drawing on edges of canvas near toggle button
            if (y === squareLen) {
                canvasContext.moveTo(squareLen * 2, y);
                canvasContext.lineTo(canvas.width, y);
            } else {
                canvasContext.moveTo(0, y);
                canvasContext.lineTo(canvas.width, y);
            }
        }

        // Set stroke color
        canvasContext.strokeStyle = '#C0C0C0';
        // Draw the lines
        canvasContext.stroke();
    }

    /* Add HTML to create snap grid for draggable elements */
    function createSnapGrid() {
        var eWrapper = document.getElementById('editor-wrapper');

        // Vertical snap div's
        var vSnapDivs = [];
        // Horizontal snap div's
        var hSnapDivs = [];

        // Add vertical snap div's
        for (var i = 0; i < Math.floor(canvas.width / squareLen) - 1; i += 1) {
            vSnapDivs[i] = document.createElement('div');
            vSnapDivs[i].className += 'snap-div v-snap-div-' + (i + 1);
            vSnapDivs[i].style.position = 'absolute';
            vSnapDivs[i].style.width = '0px';
            vSnapDivs[i].style.height = (Math.floor(canvas.height / squareLen) - 1) * squareLen + 'px';
            vSnapDivs[i].style.left = canvas.offsetLeft + (squareLen / 2) + ((i + 1) * squareLen) - 1 + 'px';
            vSnapDivs[i].style.top = canvas.offsetTop + (squareLen / 2) + 'px';
            eWrapper.appendChild(vSnapDivs[i]);
        }

        // Add horizontal snap div's
        for (var j = 0; j < Math.floor(canvas.height / squareLen) - 2; j += 1) {
            hSnapDivs[j] = document.createElement('div');
            hSnapDivs[j].className += 'snap-div h-snap-div-' + (j + 1);
            hSnapDivs[j].style.position = 'absolute';
            hSnapDivs[j].style.width = (Math.floor(canvas.width / squareLen) - 1) * squareLen + 'px';
            hSnapDivs[j].style.height = '0px';
            hSnapDivs[j].style.left = canvas.offsetLeft + (squareLen / 2) + 'px';
            hSnapDivs[j].style.top = canvas.offsetTop + (squareLen / 2) + ((j + 1) * squareLen) - 1 + 'px';
            eWrapper.appendChild(hSnapDivs[j]);
        }
    }

    /* Resize main canvas based on new window size */
    function resizeCanvas() {
        canvas.width = docClientWidth * 0.67;
        canvas.height = docClientHeight - 66;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';

        // Redraw the grid after resizing canvas
        drawGrid();

        // Resize and reposition snap grid after resizing canvas
        createSnapGrid();
    }

    /* Reposition member icons based on the current Formation */
    function repositionIcons() {
        for (var i = 0; i < memberIcons.length; i += 1) {
            var repositionLeft = currFormation.members[memberIcons[i].id].left;
            var repositionTop = currFormation.members[memberIcons[i].id].top;
            memberIcons[i].style.left = repositionLeft + 'px';
            memberIcons[i].style.top = repositionTop + 'px';

            var membersPanel = document.getElementById('members-panel');
            var memberName;

            // If the member icon is outside of the main canvas, show its name
            if (repositionLeft > membersPanel.getBoundingClientRect().left) {
                // If member icons are in photos view
                if (isPhotoView) {
                    memberName = $(memberIcons[i]).siblings()[0];
                    $(memberName).show();
                }
            // If the member icon is inside the main canvas, hide its name
            } else {
                memberName = $(memberIcons[i]).siblings()[0];
                $(memberName).hide();
            }
        }
    }

    /* Add new formation object and preview slide */
    function addFormation() {
        /* Add new formation object */

        // Construct new Formation
        var newFormation = new Formation($.extend(true, {}, startingOffsets));
        // Append new Formation to list of all Formations
        formations.push(newFormation);
        // Set current Formation to the new Formation
        currFormation = newFormation;

        /* Add new formation preview slide */

        // Create HTML numbering of preview slide
        var numbering = document.createElement('span');
        numbering.className += 'slide-numbering';
        numbering.innerHTML = formations.length;

        // Create HTML of preview slide canvas
        var newSlideCanvas = document.createElement('canvas');
        newSlideCanvas.className += 'preview-slide';
        newSlideCanvas.width = Math.floor((canvas.width / canvas.height) * 85);
        newSlideCanvas.height = 85;
        newSlideCanvas.style.width = newSlideCanvas.width + 'px';
        newSlideCanvas.style.height = newSlideCanvas.height + 'px';

        // Create HTML preview slide container
        var newWrapper = document.createElement('div');
        newWrapper.className += 'preview-slide-container';

        // Append numbering and preview slide canvas as children of container
        newWrapper.appendChild(numbering);
        newWrapper.appendChild(newSlideCanvas);

        // Highlight clicked Formation and display its placement of member icons
        newWrapper.addEventListener('click', viewFormation, false);

        // Add preview slide container to formations container
        var formationsContainer = document.getElementById('formations-container');
        formationsContainer.appendChild(newWrapper);

        // If there is more than one Formation
        if (typeof currSlideContainer !== 'undefined') {
            // Change the current preview slide's styling back to normal
            currSlideContainer.style.backgroundColor = '#D66860';
            currSlideCanvas.style.borderColor = '#707070';
        }

        // Append new preview slide container to list of all containers
        slideContainers.push(newWrapper);
        // Set current slide container to the new container
        currSlideContainer = newWrapper;
        // Set current slide canvas to the new preview slide canvas
        currSlideCanvas = newSlideCanvas;
        // Set the current slide context to that of the current slide canvas
        currSlideContext = newSlideCanvas.getContext('2d');

        // Highlight the new slide as the currently active one
        currSlideContainer.style.backgroundColor = '#E6A39E';
        currSlideCanvas.style.borderColor = 'black';

        // Reposition member icons based on new current Formation
        repositionIcons();
    }

    /* Highlight clicked Formation and display its placement of member icons */
    function viewFormation(event) {
        // Change the current preview slide's styling back to normal
        currSlideContainer.style.backgroundColor = '#D66860';
        currSlideCanvas.style.borderColor = '#707070';

        var clickedFormationNum;

        // If preview slide canvas is clicked
        if (event.target.className === 'preview-slide') {
            // Set current slide container to the new container
            currSlideContainer = event.target.parentElement;
            // Set current slide canvas to the new preview slide canvas
            currSlideCanvas = event.target;
            // Set the current slide context to that of the current slide canvas
            currSlideContext = event.target.getContext('2d');

            // Highlight the new slide as the currently active one
            currSlideContainer.style.backgroundColor = '#E6A39E';
            currSlideCanvas.style.borderColor = 'black';

            // Define the clicked Formation's number
            clickedFormationNum = $(event.target).siblings()[0].innerHTML;
        // If slide container is clicked
        } else if (event.target.className === 'preview-slide-container') {
            // Set current slide container to the new container
            currSlideContainer = event.target;
            // Set current slide canvas to the new preview slide canvas
            currSlideCanvas = event.target.children[1];
            // Set the current slide context to that of the current slide canvas
            currSlideContext = event.target.children[1].getContext('2d');

            // Highlight the new slide as the currently active one
            currSlideContainer.style.backgroundColor = '#E6A39E';
            currSlideCanvas.style.borderColor = 'black';

            // Define the clicked Formation's number
            clickedFormationNum = event.target.children[0].innerHTML;
        // If slide numbering is clicked
        } else if (event.target.className === 'slide-numbering') {
            // Obtain the numbering's slide sibling
            var slideSibling = $(event.target).siblings()[0];

            // Set current slide container to the new container
            currSlideContainer = event.target.parentElement;
            // Set current slide canvas to the new preview slide canvas
            currSlideCanvas = slideSibling;
            // Set the current slide context to that of the current slide canvas
            currSlideContext = slideSibling.getContext('2d');

            // Highlight the new slide as the currently active one
            currSlideContainer.style.backgroundColor = '#E6A39E';
            currSlideCanvas.style.borderColor = 'black';

            // Define the clicked Formation's number
            clickedFormationNum = event.target.innerHTML;
        }

        // Set the clicked Formation as the current Formation
        currFormation = formations[clickedFormationNum - 1];

        // Reposition member icons based on new current Formation
        repositionIcons();
    }

    /* Change display of member icons between photos and names */
    function toggleIconView() {
        // True if checkbox is checked. Note: Click event listener is called before checkbox is checked.
        var checked = document.getElementById('toggle').checked;

        var membersPanel = document.getElementById('members-panel');
        var memberName;

        // Photos view
        if (checked) {
            // Member icons are in photos view
            isPhotoView = true;

            memberIcons.forEach(function(member){
                // Display member icons as photos
                $(member).removeClass('names');

                // If the member icon is outside of the main canvas
                if (member.offsetLeft > membersPanel.getBoundingClientRect().left) {
                    // Show member name below icon
                    memberName = $(member).siblings()[0];
                    $(memberName).show('400');
                }
            });
        // Names view
        } else {
            // Member icons are in names view
            isPhotoView = false;

            memberIcons.forEach(function(member) {
                // Display member icons as names
                $(member).addClass('names');

                // Hide member name below icon to avoid repetitive display
                memberName = $(member).siblings()[0];
                $(memberName).hide('400');
            });
        }
    }

    /* Redraw the current Formation's preview slide canvas */
    function redrawPreviewSlide() {
        // Clear the canvas to avoid drawing over previous drawing
        currSlideContext.clearRect(0, 0, currSlideCanvas.width, currSlideCanvas.height);

        for (var member in currFormation.members) {
            // Check that the property is not from a prototype
            if (currFormation.members.hasOwnProperty(member)) {
                // For each member, draw appropriately positioned dot on preview slide
                currSlideContext.beginPath();
                currSlideContext.arc((currFormation.members[member].left - canvas.offsetLeft) / (canvas.width / currSlideCanvas.width),
                                   (currFormation.members[member].top - canvas.offsetTop) / (canvas.width / currSlideCanvas.width),
                                   3, 0, 2 * Math.PI);
                currSlideContext.closePath();
                currSlideContext.fillStyle = '#556170';
                currSlideContext.fill();
            }
        }
    }

    /* Initialize drag and drop functionality */
    function initDragDrop() {
        // Enable jQuery draggable functionality for each member icon
        memberIcons.forEach(function(member) {
            $(member).draggable({
                // Constrained area allowed for dragging
                containment: [canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top,
                              docClientWidth,                        docClientHeight - 40],
                // No auto-scroll when dragging
                scroll: false,
                // Snap to snap div's
                snap: '.snap-div',
                // Callback function for when dragging starts
                start: function(event) {
                    // Add being-dragged styling
                    $(member).addClass('being-dragged');
                },
                // Callback function for whenever element is dragged
                drag: function(event) {
                    // For now, do nothing
                },
                // Callback function for when dragged element is dropped
                stop: function(event) {
                    // Remove being-dragged styling
                    $(member).removeClass('being-dragged');

                    // Members panel
                    var membersPanel = document.getElementById('members-panel');
                    // Left offset of the members panel
                    var membersPanelLeft = membersPanel.getBoundingClientRect().left;
                    // Member name for dropped member icon
                    var memberName;
                    // New offset coordinates for dropped member
                    var newOffsets = {};

                    // If the dragged member is dropped to the right of the members panel's left offset
                    if (event.clientX > membersPanelLeft) {
                        // If member icons are in photos view
                        if (isPhotoView) {
                            // Show member icon's name
                            memberName = $(event.target).siblings()[0];
                            $(memberName).show('400');
                        }

                        // Update left and top offsets of dropped member
                        newOffsets[event.target.id] = {
                            left: startingOffsets[event.target.id].left,
                            top: startingOffsets[event.target.id].top
                        };
                        currFormation.updateMember(newOffsets);

                        // Update preview slide with removal of member from canvas
                        redrawPreviewSlide();
                    } else {
                        // Drop member icon to last snapped location
                        var newLeft = event.target.offsetLeft;
                        var newTop = event.target.offsetTop;
                        event.target.style.left = newLeft + 'px';
                        event.target.style.top = newTop + 'px';

                        // Hide member icon's name
                        memberName = $(event.target).siblings()[0];
                        $(memberName).hide('400');

                        // Update left and top offsets of dropped member
                        newOffsets[event.target.id] = {
                            left: newLeft,
                            top: newTop
                        };
                        currFormation.updateMember(newOffsets);

                        // Update preview slide with dropped member's new location
                        redrawPreviewSlide();
                    }
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

        // Enable jQuery droppable functionality for the main canvas
        $(canvas).droppable();
    }

    /* Computations to perform when page DOM is ready */
    function ready() {
        if (window.location.pathname == '/editor') {
            // Define variables
            docClientWidth = document.documentElement.clientWidth;
            docClientHeight = document.documentElement.clientHeight;
            canvas = document.getElementById('canvas');
            canvasContext = canvas.getContext('2d');

            // Set up and draw canvas when editor page first loads
            resizeCanvas();

            // Style toggle button based on length of grid squares
            var toggleBtn = document.getElementById('toggle-btn');
            toggleBtn.style.height = squareLen - 4 + 'px';
            toggleBtn.style.width = squareLen * 2 - 4 + 'px';
            toggleBtn.style.lineHeight = squareLen - 4 + 'px';
            toggleBtn.style.marginLeft = 7 + 'px';
            toggleBtn.style.marginTop = 7 + 'px';

            var toggleContainer = document.getElementById('toggle-container');
            toggleContainer.style.left = canvas.offsetLeft - 10 + 'px';
            toggleContainer.style.top = canvas.offsetTop - 10 + 'px';
            toggleContainer.style.height = squareLen + 10 + 'px';
            toggleContainer.style.width = squareLen * 2 + 10 + 'px';

            // Create array of member icons
            memberIcons = [].slice.call(document.getElementsByClassName('member-icon'));

            // Track initial left and top offsets for member icons
            memberIcons.forEach(function(member) {
                startingOffsets[member.id] = { left: member.offsetLeft, 
                                               top:  member.offsetTop };
            });

            // Add formation when new formation button is clicked
            var newFormationBtn = document.getElementById('new-formation-btn');
            newFormationBtn.addEventListener('click', addFormation, false);

            // Add scroll functionality to filmstrip
            var formationsContainer = document.getElementById('formations-container');
            var membersPanel = document.getElementById('members-panel');
            $(formationsContainer).slimScroll({
                height: membersPanel.offsetHeight - $(newFormationBtn).outerHeight(true) + 'px',
                size: '4px',
                railVisible: true
            });

            // Toggle member icon view when toggle button is clicked
            toggleBtn.addEventListener('click', toggleIconView, false);

            // Set up first formation object and preview slide
            addFormation();

            // Initialize drag and drop functionality
            initDragDrop();
        }
    }

    $(document).ready(ready);
    // $(window).resize(resizeCanvas);
})(window, document, window.jQuery);