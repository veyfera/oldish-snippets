import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { v, checkBorderCollision, ItemTypes } from "../utils/common";
import { Rect } from "../utils/types";

import Rectangle from "./Rectangle";

let recCounter = 1;
let topZIndex= 1;

export default function DragContainer() {
    const [recs, setRecs] = useState<Rect[]>([]);

    const handleClick = (e: React.MouseEvent) => {
        const [x, y] = checkBorderCollision(e.clientX, e.clientY);
        setRecs([...recs, {id: recCounter, x: x, y: y, zIndex: topZIndex}]);
        recCounter ++;
        topZIndex ++;
    }

    const moveRec = (i: number, x: number, y: number) => {
        setRecs(allRecs => {
            const rec = allRecs.find(r => r.id === i);
            if (rec) {
                [rec.x, rec.y] = checkBorderCollision(x, y);
                rec.zIndex = topZIndex;
                topZIndex ++;
            }
            return allRecs;
                })
    }

    const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop(item: Rect, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset()
        const left = Math.round(item.x + delta!.x)
        const top = Math.round(item.y + delta!.y)
        moveRec(item.id, left, top)
        }
    }), [])

    const handleResize = () => {
        setRecs(newRecs => newRecs.map(r => {
            [r.x, r.y] = checkBorderCollision(r.x, r.y)
            return r
        }))
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize);
    }, [])


  return (
    <div className="game-field" onClick={handleClick} ref={drop}>
        {recs && recs.map(r => <Rectangle rec={r} key={r.id}/>)}
    </div>
  );
}
