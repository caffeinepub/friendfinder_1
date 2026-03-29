import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { CheckCircle2, Loader2, Shield, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { ApprovalStatus } from "../backend";
import {
  useIsAdmin,
  useListApprovals,
  useSetApproval,
} from "../hooks/useQueries";

function truncatePrincipal(p: Principal) {
  const s = p.toString();
  return s.length > 16 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.approved)
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 rounded-full text-xs">
        Approved
      </Badge>
    );
  if (status === ApprovalStatus.rejected)
    return (
      <Badge className="bg-red-100 text-red-700 border border-red-200 rounded-full text-xs">
        Rejected
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs">
      Pending
    </Badge>
  );
}

export default function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: approvals, isLoading: approvalsLoading } = useListApprovals();
  const setApproval = useSetApproval();

  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 p-8"
        data-ocid="admin.error_state"
      >
        <Shield className="w-12 h-12 text-muted-foreground" />
        <h2 className="font-display font-bold text-2xl">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You don't have admin privileges.
        </p>
      </div>
    );
  }

  const pending =
    approvals?.filter((a) => a.status === ApprovalStatus.pending) ?? [];
  const approved =
    approvals?.filter((a) => a.status === ApprovalStatus.approved) ?? [];
  const rejected =
    approvals?.filter((a) => a.status === ApprovalStatus.rejected) ?? [];

  const handleApprove = (principal: Principal) =>
    setApproval.mutate({ user: principal, status: ApprovalStatus.approved });

  const handleReject = (principal: Principal) =>
    setApproval.mutate({ user: principal, status: ApprovalStatus.rejected });

  return (
    <div className="min-h-screen bg-brand-warm py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-pink-400 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-sm">
                Review and manage member verification requests
              </p>
            </div>
          </div>

          <Tabs defaultValue="pending" data-ocid="admin.tab">
            <TabsList className="mb-6 rounded-full bg-white border border-border p-1">
              <TabsTrigger
                value="pending"
                className="rounded-full text-sm"
                data-ocid="admin.pending.tab"
              >
                Pending
                {pending.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {pending.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="rounded-full text-sm"
                data-ocid="admin.approved.tab"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="rounded-full text-sm"
                data-ocid="admin.rejected.tab"
              >
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <UserList
                users={pending}
                isLoading={approvalsLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                isPending={setApproval.isPending}
                emptyMessage="No pending verifications — you're all caught up!"
                showActions
              />
            </TabsContent>

            <TabsContent value="approved">
              <UserList
                users={approved}
                isLoading={approvalsLoading}
                emptyMessage="No approved members yet."
              />
            </TabsContent>

            <TabsContent value="rejected">
              <UserList
                users={rejected}
                isLoading={approvalsLoading}
                emptyMessage="No rejected members."
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function UserList({
  users,
  isLoading,
  onApprove,
  onReject,
  isPending,
  emptyMessage,
  showActions,
}: {
  users: Array<{ principal: Principal; status: ApprovalStatus }>;
  isLoading: boolean;
  onApprove?: (p: Principal) => void;
  onReject?: (p: Principal) => void;
  isPending?: boolean;
  emptyMessage: string;
  showActions?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="admin.list.loading_state">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-card"
          >
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="admin.list.empty_state"
      >
        <CheckCircle2 className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="admin.list.table">
      {users.map(({ principal, status }, i) => (
        <motion.div
          key={principal.toString()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-card"
          data-ocid={`admin.list.item.${i + 1}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-foreground truncate">
              {truncatePrincipal(principal)}
            </p>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => onApprove?.(principal)}
                disabled={isPending}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs px-4"
                data-ocid={`admin.approve.button.${i + 1}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(principal)}
                disabled={isPending}
                className="rounded-full text-red-600 border-red-200 hover:bg-red-50 text-xs px-4"
                data-ocid={`admin.reject.button.${i + 1}`}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
