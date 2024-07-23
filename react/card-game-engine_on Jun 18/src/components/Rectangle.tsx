import Image from "next/image";
import { v, ItemTypes } from "/src/utils/common";
import { useDrag } from "react-dnd";

export default function Rectangle({ rec }) {
    const [{isDragging}, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: rec,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        })
    }), [])

  return (
    <div
        className="rectangle"
        ref={dragRef}
        style={{
            left: rec.x-v.cardWidth/2,
            top: rec.y-v.cardHeight,
            visibility: isDragging?"hidden": "visible",
            zIndex: rec.zIndex
        }}
        onClick={(e) => e.stopPropagation() }
    >
        <Image
            src="/tux.png"
            alt="card image"
            className="rectangle-img"
            width={v.cardWidth}
            height={v.cardHeight}
            priority
            draggable={false}
        />
    </div>
  );
}
