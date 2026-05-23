import { useParams, Navigate } from "react-router-dom";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  return <Navigate to={`/show/${code ?? ""}`} replace />;
}
