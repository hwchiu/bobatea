// app/jobs/page.tsx
import { Header } from "@/components/layout/Header";
import { JobList } from "@/components/jobs/JobList";
import { mockJobs } from "@/data/mockJobs";

export default function JobsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="My Jobs" />
      <JobList jobs={mockJobs} />
    </div>
  );
}
