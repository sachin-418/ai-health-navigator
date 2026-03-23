import type { DoctorReply } from "@/store/appStore";
import { CalendarClock, Stethoscope } from "lucide-react";

type DoctorReplyCardProps = {
  reply: DoctorReply;
  title?: string;
};

const formatSolutionLines = (solution: string) =>
  solution
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const formatSlotType = (type: DoctorReply["timeSlot"]["type"]) => {
  if (type === "live") {
    return "In-person visit";
  }

  if (type === "video") {
    return "Video consultation";
  }

  return "Phone consultation";
};

export default function DoctorReplyCard({ reply, title = "Doctor's Response" }: DoctorReplyCardProps) {
  const solutionLines = formatSolutionLines(reply.solution);

  return (
    <div className="mt-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{title}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
            <Stethoscope className="h-4 w-4 text-secondary" />
            {reply.doctorName} • {reply.doctorType}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {solutionLines.length > 0 ? (
          solutionLines.map((line, index) => (
            <p key={`${line}-${index}`} className="rounded-lg bg-background/70 px-3 py-2 text-sm leading-6 text-foreground whitespace-pre-wrap">
              {line}
            </p>
          ))
        ) : (
          <p className="text-sm text-foreground whitespace-pre-wrap">{reply.solution}</p>
        )}
      </div>

      {reply.timeSlot ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground">
          <CalendarClock className="mt-0.5 h-4 w-4 text-secondary" />
          <div>
            <p className="font-medium">Follow-up appointment</p>
            <p className="text-muted-foreground">{formatSlotType(reply.timeSlot.type)} on {reply.timeSlot.dateTime}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}