import type { Route } from "./+types/home";
import {Navbar} from "~/components/Navbar";
import {resumes} from "~/constants/resumes";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Resume Analyser" },
    { name: "description", content: "Welcome to AI Resume Analyser !" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if(!auth.isAuthenticated) navigate("/auth/?next=/");
  }, [auth.isAuthenticated])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        <h2>Review your submissions and check AI-powered feedback.</h2>
      </div>

      {resumes.length > 0 && (
          <div className="resume-section">
            {resumes.map(resume => <ResumeCard key={resume.id} resume={resume}/>)}
          </div>
      )}
    </section>
  </main>;
}
