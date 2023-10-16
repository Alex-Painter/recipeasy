import AppBar from "../components/AppBar";
import AppBody from "../components/AppBody";
import { getCurrentUser } from "../lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main className="flex flex-col">
      <AppBar user={user} />
      <AppBody />
    </main>
  );
}
