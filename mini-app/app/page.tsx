import { description, title } from "@/lib/metadata";
import { generateMetadata } from "@/lib/farcaster-embed";

export { generateMetadata };

import { description, title } from "@/lib/metadata";
import { generateMetadata } from "@/lib/farcaster-embed";
import Game from "@/components/game";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col gap-3 place-items-center place-content-center px-4 grow">
      <Game />
    </main>
  );
}
