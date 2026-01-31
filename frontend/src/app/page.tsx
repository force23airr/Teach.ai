import TopicForm from "@/components/TopicForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Teach<span className="text-blue-500">.ai</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Turn any math or science concept into a short, motivational video
            showing real-world applications. Inspire students to build the
            future.
          </p>
        </div>

        {/* Form */}
        <TopicForm />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 py-6 text-center text-sm text-gray-600">
        Built to make learning exciting.
      </footer>
    </div>
  );
}
