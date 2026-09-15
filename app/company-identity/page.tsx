// app/company-identity/page.tsx
import { Header } from "@/components/layout/Header";
import CompanyIdentityWorkspace from "@/components/company-identity/CompanyIdentityWorkspace";

export default function CompanyIdentityPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="Company Identity Intelligence" />
      <CompanyIdentityWorkspace />
    </div>
  );
}
