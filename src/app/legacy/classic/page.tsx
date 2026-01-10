import Game from "@/components/Game/Game";
import { CLASSIC_GAME_API_BASE_ENDPOINT } from "@/constants";

export default function GamePage() {
  return <Game base_endpoint={CLASSIC_GAME_API_BASE_ENDPOINT} isLegacy={true}/>;
}
