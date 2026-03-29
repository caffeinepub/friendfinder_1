import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Heart, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const steps = [
  {
    icon: ShieldCheck,
    title: "Identity Check",
    desc: "We verify that each member is a real person.",
  },
  {
    icon: Heart,
    title: "Community Safety",
    desc: "FriendFinder is a women-only space. We ensure our members meet this standard.",
  },
  {
    icon: CheckCircle2,
    title: "Final Approval",
    desc: "Our team manually reviews each profile before granting full access.",
  },
];

export default function PendingVerificationPage() {
  const { clear } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-brand-warm flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full"
        data-ocid="pending.section"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-orange to-pink-400 flex items-center justify-center shadow-lg">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-5">
          <Badge
            className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1 text-sm font-semibold rounded-full"
            data-ocid="pending.status.badge"
          >
            ✦ Verification Pending
          </Badge>
        </div>

        {/* Heading */}
        <h1 className="font-display font-bold text-3xl text-center text-foreground mb-3">
          Your profile is under review
        </h1>
        <p className="text-muted-foreground text-center text-base mb-8 leading-relaxed">
          Thank you for joining FriendFinder! Our team is currently reviewing
          your profile. You'll gain full access to discover and connect with
          others once you're approved.
        </p>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-5 mb-8">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Our due diligence process
          </h2>
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4.5 h-4.5 text-brand-orange" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mb-6">
          Reviews typically complete within 24–48 hours. You'll be notified once
          your account is approved.
        </p>

        <Button
          variant="outline"
          onClick={() => clear()}
          className="w-full rounded-full font-medium"
          data-ocid="pending.logout.button"
        >
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}
