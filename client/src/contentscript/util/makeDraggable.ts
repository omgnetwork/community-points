function makeDraggable (el: HTMLElement, draggableId: string): void {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  document.getElementById(draggableId).onmousedown = dragMouseDown;

  function dragMouseDown (e): void {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag (e): void {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + 'px';
    el.style.left = (el.offsetLeft - pos1) + 'px';
  }

  function closeDragElement (): void {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export default makeDraggable;
