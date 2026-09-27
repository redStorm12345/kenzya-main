import { JOBS, type Job } from "@/data/kenzya";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOCAL_JOBS_KEY = "kenzya_custom_jobs_list";

/**
 * Gets custom jobs stored in localStorage.
 */
export function getStoredCustomJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_JOBS_KEY);
    return stored ? (JSON.parse(stored) as Job[]) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Fetches complete job catalog dynamically (combining custom added jobs & default catalog).
 */
export function getAllJobs(): Job[] {
  const custom = getStoredCustomJobs();
  const map = new Map<string, Job>();

  // Custom jobs take priority
  custom.forEach((j) => map.set(j.id, j));
  JOBS.forEach((j) => {
    if (!map.has(j.id)) map.set(j.id, j);
  });

  return Array.from(map.values());
}

/**
 * Adds a new job (published by recruiter or scraped).
 */
export async function addJob(jobData: Omit<Job, "id" | "postedAt">): Promise<Job> {
  const newId = `job-custom-${Date.now()}`;
  const newJob: Job = {
    ...jobData,
    id: newId,
    postedAt: new Date().toISOString(),
  };

  // 1. Try Supabase insert if available
  try {
    await supabase.from("jobs" as any).insert({
      id: newJob.id,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      sector: newJob.sector,
      contract: newJob.contract,
      description: newJob.description,
      skills: newJob.skills,
      salary_min: newJob.salaryMin,
      salary_max: newJob.salaryMax,
      remote: newJob.remote,
      source: newJob.source || "Recruteur KENZYA",
      posted_at: newJob.postedAt,
    } as any);
  } catch (err) {
    console.info("[JobsService] Supabase fallback mode:", err);
  }

  // 2. Always persist locally
  const current = getStoredCustomJobs();
  current.unshift(newJob);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event("kenzya_jobs_updated"));
  }

  return newJob;
}

/**
 * Sets up Supabase Realtime WebSocket subscription for live job insertion.
 * Broadcasts new scraped / posted jobs to subscribers in real-time.
 */
export function subscribeToRealtimeJobs(onJobChange: (jobs: Job[]) => void): () => void {
  // Listen to local window events
  const handleLocalUpdate = () => {
    onJobChange(getAllJobs());
  };

  if (typeof window !== "undefined") {
    window.addEventListener("kenzya_jobs_updated", handleLocalUpdate);
  }

  // Setup Supabase Realtime WebSocket channel
  const channel = supabase
    .channel("public:jobs")
    .on(
      "postgres_changes" as any,
      { event: "INSERT", schema: "public", table: "jobs" },
      (payload: any) => {
        const row = payload.new;
        if (row) {
          const newJob: Job = {
            id: row.id || `job-rt-${Date.now()}`,
            title: row.title,
            company: row.company,
            location: row.location,
            contract: row.contract || "CDI",
            sector: row.sector || "Technologie",
            description: row.description,
            skills: row.skills || [],
            salaryMin: row.salary_min,
            salaryMax: row.salary_max,
            remote: row.remote || false,
            source: row.source || "Scraper Realtime",
            postedAt: row.posted_at || new Date().toISOString(),
          };

          toast.success(`⚡ Nouvelle offre moissonnée en temps réel : ${newJob.title} chez ${newJob.company} !`);

          // Save locally and trigger refresh
          const current = getStoredCustomJobs();
          current.unshift(newJob);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(current));
            window.dispatchEvent(new Event("kenzya_jobs_updated"));
          }
        }
      }
    )
    .subscribe();

  // Cleanup function
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("kenzya_jobs_updated", handleLocalUpdate);
    }
    supabase.removeChannel(channel);
  };
}
