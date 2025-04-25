import { CustomWalletMultiButton } from "./walletConnect";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-gray-900 px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-white text-xl font-bold">
        Framp
      </Link>
      <CustomWalletMultiButton />
    </header>
  );
}
