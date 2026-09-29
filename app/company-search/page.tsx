// app/company-search/page.tsx
import { Header } from "@/components/layout/Header";
import CompanySearchWorkspace from "@/components/company-search/CompanySearchWorkspace";

export default function CompanySearchPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="Company Search" />
      <CompanySearchWorkspace />
    </div>
  );
}
