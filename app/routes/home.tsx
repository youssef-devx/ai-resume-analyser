import type { Route } from "./+types/home";
import {Navbar} from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {Link} from "react-router/internal/react-server-client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Resume Analyser" },
    { name: "description", content: "Welcome to AI Resume Analyser !" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[] | []>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate("/auth/?next=/");
  }, [auth.isAuthenticated])

  useEffect(() => {
    async  function loadResumes() {
      setLoadingResumes(true);

      const resumesIds = (await kv.list("resume:*")) as string[];
      const parsedResumes: Resume[] = []
      const resumes = resumesIds?.map(id => {
        const resume = kv.get(id).then(resume => {
          if (resume != null) {
            parsedResumes.push(JSON.parse(resume));
          }
        });
      })

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes();
  }, []);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
        ) }
      </div>

      {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
          </div>
      )}
      {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map(resume => <ResumeCard key={resume.id} resume={resume}/>)}
          </div>
      )}

      {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}
    </section>
  </main>;
}
