import { t } from "@/lib/i18n";

export default function Home() {
  const ui = t();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">{ui.siteName}</h1>
      <p className="text-lg">{ui.underConstruction}</p>
    </main>
  );
}
