// app/collection-config/page.tsx
import { Header } from "@/components/layout/Header";
import CollectionConfigWorkspace from "@/components/collection-config/CollectionConfigWorkspace";

export default function CollectionConfigPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="Collection Config" />
      <CollectionConfigWorkspace />
    </div>
  );
}
