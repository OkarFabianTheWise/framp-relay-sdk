import { Navigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react"; // Update this import

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const wallet = useWallet();
  console.log("Wallet connected:", wallet.connected); // Log the wallet connection status

  if (!wallet.connected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
