import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../backend";
import type { ApprovalStatus } from "../backend";
import { useActor } from "./useActor";

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useFriends() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFriendRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFriendSuggestions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendSuggestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFindByInterest(interest: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["byInterest", interest],
    queryFn: async () => {
      if (!actor || !interest) return [];
      return actor.findUsersByInterest(interest);
    },
    enabled: !!actor && !isFetching && !!interest,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (to: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendFriendRequest(to);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (from: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.acceptFriendRequest(from);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useDeclineFriendRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (from: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.declineFriendRequest(from);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useConversation(friendId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversation", friendId?.toString()],
    queryFn: async () => {
      if (!actor || !friendId) return [];
      return actor.getConversation(friendId);
    },
    enabled: !!actor && !isFetching && !!friendId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, content }: { to: Principal; content: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendMessage(to, content);
    },
    onSuccess: (_data, { to }) => {
      qc.invalidateQueries({ queryKey: ["conversation", to.toString()] });
    },
  });
}

export function useIsApproved() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setApproval(user, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}
