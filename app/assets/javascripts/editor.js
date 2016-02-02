/* Draws grid lines on formation canvas */
function draw() {
    var fCanvas = document.getElementById('formation-canvas');
    var fHeight = fCanvas.height;
    var fWidth = fCanvas.width;
    var fCtx = fCanvas.getContext('2d');

    fCtx.clearRect(0, 0, fWidth, fHeight);
    fCtx.strokeStyle = '#C0C0C0';

    var squareLen = Math.round(fWidth / 30);
    for (var w = squareLen; w < fWidth; w += squareLen) {
        fCtx.moveTo(w, 0);
        fCtx.lineTo(w, fHeight);
    }
    for (var h = squareLen; h < fHeight; h += squareLen) {
        fCtx.moveTo(0, h);
        fCtx.lineTo(fWidth, h);
    }
    fCtx.stroke();
}

/* Resizes formation canvas based on new window size */
function resizeCanvas() {
    var width = $(window).width();
    var height = $(window).height();

    var fCanvas = document.getElementById('formation-canvas');
    fCanvas.width = width * 0.7;
    fCanvas.height = height - 66;
    fCanvas.style.width = width * 0.7 + 'px';
    fCanvas.style.height = height - 66 + 'px';

    draw();

    console.log('canvases resized');
}

/* Actions to perform when page DOM is ready */
function ready() {
    if (window.location.pathname == '/editor') { 
        console.log('editor page ready');

        resizeCanvas();

        draw();

        // initialize draggable's
        [].slice.call(document.querySelectorAll('.member-picture')).forEach(function(element) {
            new Draggable(element);
        });
    }
}

$(window).load(function() {
    console.log('window loaded');

    $(document).ready(ready);
    $(window).resize(resizeCanvas);
});