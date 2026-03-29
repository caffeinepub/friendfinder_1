import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type UserId = Principal;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface Message {
    to: UserId;
    content: string;
    from: UserId;
    timestamp: Time;
}
export interface Profile {
    age: bigint;
    bio: string;
    displayName: string;
    interests: Array<string>;
    city: string;
    gender: string;
    photo?: ExternalBlob;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(from: UserId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(profile: Profile): Promise<void>;
    declineFriendRequest(from: UserId): Promise<void>;
    findUsersByInterest(interest: string): Promise<Array<Profile>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(other: UserId): Promise<Array<Message>>;
    getFriendCount(userId: UserId): Promise<bigint>;
    getFriendSuggestions(): Promise<Array<UserId>>;
    getFriends(): Promise<Array<UserId>>;
    getPendingFriendRequests(): Promise<Array<UserId>>;
    getProfile(userId: UserId): Promise<Profile | null>;
    getProfilesByAgeRange(minAge: bigint, maxAge: bigint): Promise<Array<Profile>>;
    getProfilesByGender(gender: string): Promise<Array<Profile>>;
    getUserFriends(user: Principal): Promise<Array<UserId>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    removeFriend(friendId: UserId): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    searchProfilesByInterests(interests: Array<string>): Promise<Array<Profile>>;
    searchProfilesByLocation(city: string): Promise<Array<Profile>>;
    sendFriendRequest(to: UserId): Promise<void>;
    sendMessage(to: UserId, content: string): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
}
