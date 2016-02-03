// Variable for the length of each grid square
var squareLen;

/* Draw grid lines on canvas */
function draw() {
    var canvas = document.getElementById('canvas');
    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;
    var canvasContext = canvas.getContext('2d');

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate the length of each grid square
    squareLen = Math.round(canvasWidth / 30);

    // Draw horizontal lines
    for (var w = squareLen; w < canvasWidth; w += squareLen) {
        canvasContext.moveTo(w, 0);
        canvasContext.lineTo(w, canvasHeight);
    }

    // Draw vertical lines
    for (var h = squareLen; h < canvasHeight; h += squareLen) {
        canvasContext.moveTo(0, h);
        canvasContext.lineTo(canvasWidth, h);
    }

    canvasContext.strokeStyle = '#C0C0C0';
    canvasContext.stroke();
}

/* Resize canvas based on new window size */
function resizeCanvas() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    var canvas = document.getElementById('canvas');
    canvas.width = windowWidth * 0.7;
    canvas.height = windowHeight - 66;
    canvas.style.width = windowWidth * 0.7 + 'px';
    canvas.style.height = windowHeight - 66 + 'px';

    // draw();

    console.log('canvas resized');
}

/* Actions to perform when page DOM is ready */
function ready() {
    if (window.location.pathname == '/editor') { 
        console.log('editor page ready');

        resizeCanvas();

        draw();

        // var startX, startY, dropX, dropY;

        [].slice.call(document.querySelectorAll('.member-picture')).forEach(function(element) {
            $(element).draggable({
                containment: document.body,
                scroll: false,
                start: function(event) {
                    startX = event.clientX;
                    startY = event.clientY;
                    $(element).addClass('being-dragged');
                }, 
                drag: function(event) {
                    var canvas = document.getElementById('canvas');
                    var canvasHeight = canvas.height;
                    var canvasWidth = canvas.width;
                    var canvasContext = canvas.getContext('2d');

                    // X- and y-coordinates of cursor within canvas
                    var canvasX = event.clientX - canvas.offsetLeft;
                    var canvasY = event.clientY - canvas.offsetTop;

                    // If the cursor is within the boundaries of the canvas
                    if ((canvasX >= 0 && canvasX <= canvasWidth) && (canvasY >= 0 && canvasY <= canvasHeight)) {
                        draw();

                        // Variables for tracking grid intersection closest to cursor
                        var closestX, closestY;

                        var fourCorners = [];
                        var smallestDist = Number.MAX_VALUE;

                        var modX = Math.floor(canvasX / squareLen);
                        var modY = Math.floor(canvasY / squareLen);

                        fourCorners.push([modX * squareLen, modY * squareLen]);
                        fourCorners.push([(modX + 1) * squareLen, modY * squareLen]);
                        fourCorners.push([modX * squareLen, (modY + 1) * squareLen]);
                        fourCorners.push([(modX + 1) * squareLen, (modY + 1) * squareLen]);

                        for (var i = 0; i < fourCorners.length; i++) {
                            var currX = fourCorners[i][0];
                            var currY = fourCorners[i][1];
                            var currDist = Math.sqrt(Math.pow(canvasX - currX, 2) + Math.pow(canvasY - currY, 2));
                            if (currDist < smallestDist) {
                                smallestDist = currDist;
                                closestX = currX;
                                closestY = currY;
                            }
                        }
                        dropX = closestX;
                        dropY = closestY;

                        canvasContext.beginPath();
                        canvasContext.arc(closestX, closestY, 10, 0, 2*Math.PI);
                        canvasContext.strokeStyle = '#C0C0C0';
                        canvasContext.stroke();
                        canvasContext.fillStyle = '#C0C0C0';
                        canvasContext.fill();
                    }
                },
                stop: function(event) {
                    var canvas = document.getElementById('canvas');
                    $(element).removeClass('being-dragged');

                    // $(event.target).css('left', dropX - startX);
                    // $(event.target).css('top', dropY - startY);
                }
            });
        });
    }
}

$(window).load(function() {
    console.log('window loaded');

    $(document).ready(ready);
    // $(window).resize(resizeCanvas);
});