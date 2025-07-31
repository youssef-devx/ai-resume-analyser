import {type FormEvent, useState} from 'react';
import {Navbar} from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "~/constants/resumes";

export default function Upload() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const {auth, isLoading, fs, ai, kv} = usePuterStore()
    const navigate = useNavigate();

    function handleFileSelect(file: File | null) {
        setFile(file)
    }

    async function handleAnalyse({ companyName, jobTitle, jobDescription, file } : { companyName: string; jobTitle: string; jobDescription: string; file: File }) {
        setIsProcessing(true);
        setStatusText("Uploading the file...");
        const uploadedFile = await fs.upload([file])

        if (!uploadedFile) return setStatusText("Error: Failed to upload file");
        setStatusText("Converting to image");

        const imageFile = await convertPdfToImage(file)
        if (!imageFile.file) return setStatusText("Error: Failed to convert PDF to image");
        setStatusText("Uploading the image...");

        const uploadedImage = await fs.upload([imageFile.file])
        if (!uploadedImage) return setStatusText("Error: Failed to upload image");
        setStatusText("Preparing data...");

        const uuid = generateUUID()
        const data = {
            id: uuid,
            companyName, jobTitle, jobDescription,
            feedback: "",
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analyzing...");

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )

        if (!feedback) return setStatusText("Error: Failed to analyse resume");
        const feedbackText = typeof feedback?.message.content === 'string'
            ? feedback?.message.content
            : feedback?.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText("Analysis completed, redirecting...");

        // console.log(data)
        navigate(`/resume/${uuid}`);
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget.closest('form');

        if (!form) return;
        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyse({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')])] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading p-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : <h2>Drop your resume for ATS score and improvements tips.</h2>}
                    {!isProcessing && (
                        <form action="" id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" id="company-name" placeholder="Company Name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" id="job-title" placeholder="Job Title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" id="job-description" placeholder="Job Description" ></textarea>
                            </div>
                            <div className="form-div">
                                <label htmlFor="Uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className="primary-button" type="submit">Analyse Resume</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};
