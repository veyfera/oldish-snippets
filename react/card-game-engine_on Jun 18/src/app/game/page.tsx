"use client"

import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
//import DragContainer from "/src/components/DragContainer";
import DragContainer from "../../components/DragContainer";

export default function Game() {
  return (
    <DndProvider backend={HTML5Backend}>
        <DragContainer />
    </DndProvider>
  );
}
