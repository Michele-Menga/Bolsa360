import { Link } from "react-router-dom";
import { OrbitLogo } from "@/components/brand/Bolsa360Logos";
import { Button } from "@/components/ui/button";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-24 text-center">
      <OrbitLogo size={120} mode="draw" title="" />
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-mute">O caminho que procuras não existe ou foi movido.</p>
      <Link to="/"><Button>Voltar ao início</Button></Link>
    </div>
  );
}
