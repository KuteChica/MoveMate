import { useState } from "react";
import { submitFeedback } from "../../services/transitApi";

function Contact() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    try {
      const response = await submitFeedback({ name: form.name.value, email: form.email.value, subject: form.subject.value, message: form.message.value });
      setMessage(response.message);
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit feedback.");
    }
  };
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-12"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">We are listening</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Contact and feedback</h1><p className="mt-3 text-slate-600">Tell us what would make your campus commute better.</p>{(message || error) && <p className={`mt-6 rounded-md p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-800"}`}>{error || message}</p>}<form className="mt-8 space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}><label className="block text-sm font-medium text-slate-700">Name<input name="name" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" required /></label><label className="block text-sm font-medium text-slate-700">Email<input name="email" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" type="email" required /></label><label className="block text-sm font-medium text-slate-700">Subject<input name="subject" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" required /></label><label className="block text-sm font-medium text-slate-700">Message<textarea name="message" className="mt-2 min-h-32 w-full rounded-md border border-slate-300 px-3 py-2" required /></label><button className="rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800" type="submit">Submit feedback</button></form></section>
  );
}

export default Contact;
