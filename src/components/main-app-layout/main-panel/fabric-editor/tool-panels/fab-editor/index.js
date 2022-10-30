// import { fabric } from "fabric";
import { useEffect, useState } from "react";
import "../../../../../fabric-overrids/index";
import ConfirmPopup from "../../customComponents/confirm-popup";
import EditPopup from "../../customComponents/edit-popup";
import EditorPanels from "../../index";
import ToolBaar from "../../tool-baar";
import "./index.css";
const { EditorHeader, FabEditorLeft, FabEditorRight } = EditorPanels;
let canvas,
  markerMode = false,
  isDragMode = false,
  mouseDownPoint = null,
  isClickedOnCanvas = false,
  zoomStartScale = 1,
  fabric = window.fabric;

const FabEditor = () => {
  const [isMarkerState, setIsMarkerState] = useState(false);
  const [editPopUp, setEditPopUp] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedMark, setSelectedMark] = useState("");
  const [testingText, setTestingText] = useState("Here you can show the data");

  useEffect(() => {
    document.addEventListener(
      "wheel",
      function (e) {
        e.ctrlKey && e.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener(
      "resize",
      function (e) {
        adjustCanvasDimensions();
      },
      true
    );
    inItCanvas();
  }, []);

  useEffect(() => {
    enableMarkerMode(isMarkerState);
    markerMode = isMarkerState;
  }, [isMarkerState]);

  useEffect(() => {
    if (confirmed) {
      addMakerPoint();
    }
  }, [confirmed]);

  const inItCanvas = () => {
    canvas = new fabric.Canvas("canvas", {
      width: 700,
      height: 500,
      allowTouchScrolling: true,
      backgroundColor: "white",
      selection: false,
    });
    canvas.defaultCursor = `grab`;
    canvas.hoverCursor = `grab`;
    canvas.moveCursor = `grab`;
    onCanvasEvents(canvas);
    window.canvas = canvas;
    adjustCanvasDimensions();
    canvas.renderAll();
  };

  function onCanvasEvents(canvas) {
    canvas.on({
      "object:added": objectAdded,
      "selection:created": selectionCreated,
      "selection:updated": selectionUpdated,
      "object:moving": objectMoving,
      "object:modified": modifiedObject,
      "object:scaling": objectScaling,
      "object:scaled": objectScaled,
      "object:rotating": objectRotating,
      "mouse:up": mouseUp,
      "mouse:move": mouseMove,
      "mouse:down": mouseDown,
      "after:render": afterRender,
      "key:down": onKeyDown,
      "mouse:wheel": mouseWheel,
      "touch:gesture": gesture,
    });
  }
  const gesture = (e, se) => {
    if (e.e.touches && e.e.touches.length == 2) {
      isDragMode = isDragMode && false;
      let point = new fabric.Point(e.self.x, e.self.y);
      if (e.self.state == "start") {
        zoomStartScale = canvas.getZoom();
      }
      let delta = zoomStartScale * e.self.scale;
      canvas.zoomToPoint(point, delta);
    }
  };
  const enableMarkerMode = (isMarkerState) => {
    if (isMarkerState) {
      if (canvas.getActiveObject()) canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const afterRender = () => {
    draw_grid(25);
  };

  const onTouchStart = (e) => {
    console.log("onTouchStart", e);
  };
  const onTouchMove = (e) => {
    console.log("onTouchMove", e);
  };
  const onTouchEnd = (e) => {
    console.log("onTouchEnd", e);
  };

  function draw_grid(grid_size) {
    grid_size || (grid_size = 25);
    if (!canvas) return;
    var grid_context = canvas.getContext("2d");

    var currentCanvasWidth = canvas.getWidth();
    var currentCanvasHeight = canvas.getHeight();
    grid_context.strokeWidth = 1;
    grid_context.strokeStyle = "rgb(206, 206, 217)";

    // Drawing vertical lines
    var x;
    for (x = 0; x <= currentCanvasWidth; x += grid_size) {
      grid_context.moveTo(x + 0.5, 0);
      grid_context.lineTo(x + 0.5, currentCanvasHeight);
    }

    // Drawing horizontal lines
    var y;
    for (y = 0; y <= currentCanvasHeight; y += grid_size) {
      grid_context.moveTo(0, y + 0.5);
      grid_context.lineTo(currentCanvasWidth, y + 0.5);
    }
    grid_context.strokeStyle = "rgb(206, 206, 217)";
    grid_context.stroke();
  }

  const adjustCanvasDimensions = () => {
    let elHeight = 0,
      elWidth = 0;
    document.querySelectorAll("div").forEach((el) => {
      if (el.classList.contains("fabric-editor-pro")) {
        elWidth = el.clientWidth;
        elHeight = el.clientHeight;
      }
    });
    let width = elWidth,
      height = elHeight;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.set("originalWidth", width);
    canvas.set("originalHeight", height);
    canvas.renderAll();
  };
  const mouseWheel = (opt) => {
    var delta = opt.e.deltaY;
    var pointer = canvas.getPointer(opt);
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    setCanvasZoom(zoom, pointer);
    // canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };
  const zoomIn = () => {
    let zoom = canvas.getZoom();
    zoom += 0.1;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    const bpInd = canvas._objects.findIndex((o) => o.name === "blue_print");
    let x = canvas.width / 2,
      y = canvas.height / 2;
    if (bpInd > -1) {
      x = canvas._objects[bpInd].left;
      y = canvas._objects[bpInd].top;
      setCanvasZoom(zoom, { x, y });
    } else setCanvasZoom(zoom, { x, y });
  };
  const zoomOut = () => {
    let zoom = canvas.getZoom();
    zoom -= 0.1;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    const bpInd = canvas._objects.findIndex((o) => o.name === "blue_print");
    let x = canvas.width / 2,
      y = canvas.height / 2;
    if (bpInd > -1) {
      x = canvas._objects[bpInd].left;
      y = canvas._objects[bpInd].top;
      setCanvasZoom(zoom, { x, y });
    } else setCanvasZoom(zoom, { x, y });
  };
  const zoomReset = () => {
    let x = canvas.width / 2,
      y = canvas.height / 2;
    setCanvasZoom(1, { x, y });
  };

  const setCanvasZoom = (zoom, pointer) => {
    canvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), zoom);
    canvas.renderAll();
  };

  const onToggleMarker = () => {
    const objs = canvas.getObjects();
    const bpInd = objs.findIndex((o) => o.name === "blue_print");
    if (bpInd === -1) return;
    const bp = objs[bpInd];
    if (isMarkerState) {
      const tempMarkerInd = objs.findIndex(
        (o) => o.name === "pin_location_temp"
      );
      if (tempMarkerInd > -1) canvas.remove(objs[tempMarkerInd]);
      canvas.renderAll();
    } else
      addMakerTemp({
        x: bp.left,
        y: bp.top,
      });
    setIsMarkerState((ms) => !ms);
    markerMode = !markerMode;
  };

  const onKeyDown = (e) => {};

  const mouseMove = (e) => {
    // if (!isClickedOnCanvas) return;
    isDragMode = true;
    const obj = e.target;
    if (obj?.name === "pin_location_temp") return;
    if (isClickedOnCanvas && mouseDownPoint) {
      var pointer = canvas.getPointer(e.e, true);
      var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
      canvas.relativePan(mouseMovePoint.subtract(mouseDownPoint));
      mouseDownPoint = mouseMovePoint;
    }

    // if (isClickedOnCanvas && e && e.e) {
    //   var delta = new fabric.Point(e.e.movementX, e.e.movementY);
    //   canvas.relativePan(delta);
    // }
  };

  const mouseUp = (e) => {
    isClickedOnCanvas = false;
    isDragMode = !isDragMode;
  };
  const addMakerPoint = () => {
    const uuid = require("uuid");
    let id = uuid.v4(),
      left = 0,
      top = 0;
    const tempMarkerInd = canvas
      .getObjects()
      .findIndex((o) => o.name === "pin_location_temp");
    if (tempMarkerInd > -1) {
      const marker = canvas.getObjects()[tempMarkerInd];
      left = marker.left;
      top = marker.top + marker.getScaledHeight() / 2;
      canvas.remove(canvas._objects[tempMarkerInd]);
      canvas.renderAll();
    }

    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      let imgInstance = new fabric.Image(img, {
        crossOrigin: "Anonymous",
        ref_id: id,
        left,
        top,
        originX: "center",
        originY: "center",
        name: "pin_location",
        lockMovementX: true,
        lockMovementY: true,
        perPixelTargetFind: true,
        hoverCursor: "pointer",
      });
      imgInstance.scaleToWidth(canvas.width * 0.05);
      imgInstance.set("top", top - imgInstance.getScaledHeight() / 2 + 1);
      canvas.add(imgInstance);
      canvas.renderAll();
      setIsMarkerState(!markerMode);
      setConfirmed(false);
    };
    img.src = "./assets/images/pin-location.png";
  };
  const addMakerTemp = (pointers) => {
    const uuid = require("uuid");
    let id = uuid.v4();
    const { x, y } = pointers;
    let left = x,
      top = y;
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      let imgInstance = new fabric.Image(img, {
        crossOrigin: "Anonymous",
        ref_id: id,
        left,
        top,
        originX: "center",
        originY: "center",
        name: "pin_location_temp",
        // lockMovementX: true,
        // lockMovementY: true,
        perPixelTargetFind: true,
        hoverCursor: "pointer",
      });
      imgInstance.scaleToWidth(canvas.width * 0.05);
      imgInstance.set("top", top - imgInstance.getScaledHeight() / 2 + 1);
      canvas.add(imgInstance);
      canvas.renderAll();
    };
    img.src = "./assets/images/pin-location-temp.png";
  };
  const mouseDown = (evt) => {
    isClickedOnCanvas = true;
    if (!evt) return;
    let pointer = canvas.getPointer(evt.e, true);
    if (!pointer) return;
    mouseDownPoint = new fabric.Point(pointer.x, pointer.y);
  };
  const objectAdded = (e) => {};
  const selectionCreated = () => {
    let obj = canvas.getActiveObject();
    if (!obj) return;
    if (obj.name === "pin_location") {
      const tempMarkerInd = canvas._objects.findIndex(
        (o) => o.name === "pin_location_temp"
      );
      if (tempMarkerInd > -1) {
        canvas.remove(canvas._objects[tempMarkerInd]);
        canvas.renderAll();
      }
      setEditPopUp(true);
      setSelectedMark(obj.ref_id);
      canvas.discardActiveObject().renderAll();
    }
  };
  const selectionUpdated = (e) => {
    setEditPopUp(false);
    let obj = canvas.getActiveObject();
    if (!obj) return;
    if (obj.name === "pin_location") {
      setEditPopUp(true);
      setSelectedMark(obj.ref_id);
    }
  };
  const modifiedObject = (e) => {
    const obj = e.target;
    if (markerMode && obj?.name === "pin_location_temp") {
      setConfirmMessage(true);
    }
  };
  const objectScaling = (e) => {};
  const objectScaled = (e) => {};
  const objectRotating = (e) => {};
  const objectMoving = (e) => {};

  const addImage = (src) => {
    if (!canvas) return;
    const uuid = require("uuid");
    let id = uuid.v4();
    let height = canvas.getHeight() / 2,
      width = canvas.getWidth() / 2;
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      let imgInstance = new fabric.Image(img, {
        crossOrigin: "Anonymous",
        ref_id: id,
        left: width,
        top: height,
        originX: "center",
        originY: "center",
        name: "blue_print",
        perPixelTargetFind: true,
        stroke: "black",
        strokeWidth: 5,
        selectable: false,
      });
      imgInstance.scaleToHeight(canvas.getWidth() * 0.5);
      canvas.renderAll();
      canvas.add(imgInstance);
    };
    img.src = src;
  };

  const addBluePrint = () => {
    const bpInd = canvas.getObjects().findIndex((o) => o.name === "blue_print");
    if (bpInd > -1 || (isMarkerState && canvas.getObjects().length)) return;
    addImage("./assets/images/blueprints/FLOOR-PLAN-BUILDINGS.jpg");
  };

  const deleteActObject = () => {
    for (let i = 0; i < canvas._objects.length; i++) {
      canvas.remove(canvas._objects[i]);
    }
    canvas.renderAll();
  };
  const onCloseModal = (type) => {
    const tempMarkerInd = canvas._objects.findIndex(
      (o) => o.name === "pin_location_temp"
    );
    if (tempMarkerInd > -1 && type !== "close") {
      canvas.remove(canvas._objects[tempMarkerInd]);
      canvas.renderAll();
    }
    switch (type) {
      case "edit":
        if (canvas?.getActiveObject()) canvas.discardActiveObject();
        setEditPopUp(false);
        break;
      case "confirm":
        setConfirmMessage(false);
        break;
      case "close":
        setConfirmMessage(false);
        break;
      default:
        break;
    }
  };
  const onProceed = (type) => {
    switch (type) {
      case "edit":
        setEditPopUp(false);
        break;
      case "confirm":
        setConfirmMessage(false);
        setConfirmed(true);
        break;
      default:
        break;
    }
  };
  const handleTextChanged = (e) => {
    setSelectedMark(e.target.value);
  };
  return (
    <div className="fabric-editor-container">
      <EditorHeader />
      <div className="editor-main-wrapper">
        <FabEditorLeft
          onToggleMarker={onToggleMarker}
          addBluePrint={addBluePrint}
        />
        <div className={"canvas-main-wrapper"}>
          <ToolBaar
            onToggleMarker={onToggleMarker}
            markerMode={isMarkerState}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            zoomReset={zoomReset}
          />
          <div className={`fabric-editor-pro center-content-column`}>
            <canvas id="canvas" width={1000} height={800} />
          </div>
        </div>
        <FabEditorRight
          deleteActObject={deleteActObject}
          testingText={testingText}
        />
      </div>
      {editPopUp && (
        <EditPopup
          selectedMark={selectedMark}
          onCloseModal={() => onCloseModal("edit")}
          onProceed={onProceed}
          handleTextChanged={handleTextChanged}
        />
      )}

      {confirmMessage && (
        <ConfirmPopup
          onCloseModal={() => onCloseModal("close")}
          onProceed={() => onProceed("confirm")}
        />
      )}
    </div>
  );
};
export default FabEditor;
