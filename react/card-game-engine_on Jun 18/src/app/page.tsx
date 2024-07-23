import Link from 'next/link';

export default function Home() {
  return (
    <div className="game-desc">
        <h2>
        Game description
        </h2>
        <p>It is not exactly a full fledged game yet, more of a game engine for now.</p>
        <h3>
        Instructions:
        </h3>
        <p>First click the play button below, then click anywere on the game field to spawn a rectangle. Spawned rectangles can be dragged around with your mouse cursor. Happy time killing!</p>

        <Link href="game" className="game-playBtn">Play</Link>
    </div>
  );
}
