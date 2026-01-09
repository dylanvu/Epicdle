import Game from "@/components/Game/Game";
import { INSTRUMENTAL_GAME_API_BASE_ENDPOINT } from "@/constants";

export default function GamePage() {
  return <Game base_endpoint={INSTRUMENTAL_GAME_API_BASE_ENDPOINT} />;
}
