import type { Route } from "./+types/home.js";
import { Welcome } from "@components/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Hackfest" },
    { name: "description", content: "Welcome to the Hackfest!" },
  ];
}

export async function clientLoader() {
  return null;
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC5200]"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return <Welcome />;
}
