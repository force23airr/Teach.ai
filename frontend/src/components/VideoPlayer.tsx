"use client";

import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: Props) {
  return (
    <div className="w-full max-w-3xl space-y-6">
      <video
        src={videoUrl}
        controls
        autoPlay
        className="w-full rounded-xl border border-gray-700 shadow-2xl"
      />

      <div className="flex gap-3">
        <a
          href={videoUrl}
          download
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
        >
          <Download className="h-4 w-4" />
          Download
        </a>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Generate Another
        </Link>
      </div>
    </div>
  );
}
