// Based off of: https://github.com/codrops/DragDropInteractions

function Draggable(draggableElement) {
    this.element = draggableElement;

    // Draggabilly is a Javascript library for making elements draggable
    this.draggie = new Draggabilly(this.element, this.options.draggabilly);

    this.initEvents();
}

Draggable.prototype.options = {
    // options for Draggabilly
    draggabilly: { containment: document.body },
    // if the element should animate back to its original position
    animBack: true
};

Draggable.prototype.initEvents = function() {
    this.draggie.on('dragStart', this.onDragStart.bind(this));
    this.draggie.on('dragEnd', this.onDragEnd.bind(this));
};

Draggable.prototype.onDragStart = function(instance, event, pointer) {
    // save x & y position
    // this.position = { left: instance.position.x, top: instance.position.y };
    // add class is-active to the draggable element (control the draggable's z-index)
    // classie.add(instance.element, 'is-active');
};

Draggable.prototype.onDragEnd = function(instance, event, pointer) {
    // To continue...
};