import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import UserApproval "user-approval/approval";
import MixinStorage "blob-storage/Mixin";
import Order "mo:core/Order";

// Migration for production-grade type safety, see https:/internetcomputer.org/docs/current/tutorials/motoko/type-safety#upgrades---secure-type-safe-data-migration

actor {
  include MixinStorage();

  // --- Types ---

  type UserId = Principal;
  type ConversationId = Text;

  type FriendRequest = {
    from : UserId;
    to : UserId;
    status : {
      #pending;
      #accepted;
      #declined;
    };
    timestamp : Time.Time;
  };

  type Profile = {
    displayName : Text;
    bio : Text;
    age : Nat;
    city : Text;
    interests : [Text];
    photo : ?Storage.ExternalBlob;
    gender : Text;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.displayName, p2.displayName);
    };
  };

  type Message = {
    from : UserId;
    to : UserId;
    content : Text;
    timestamp : Time.Time;
  };

  type Conversation = {
    id : Text;
    participants : (UserId, UserId);
    messages : [Message];
  };

  // --- State ---

  let completedFriendRequests = List.empty<FriendRequest>();
  let profiles = Map.empty<UserId, Profile>();
  let friendRequests = Map.empty<UserId, List.List<UserId>>(); // Pending requests
  let friends = Map.empty<UserId, List.List<UserId>>(); // Friend lists
  let conversations = Map.empty<ConversationId, Conversation>();

  // --- Access Control & User Approval ---

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  public query ({ caller }) func isCallerApproved() : async Bool {
      AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
      UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
      if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
      UserApproval.listApprovals(approvalState);
  };

  // Helper function to check if two users are friends
  func areFriends(user1 : UserId, user2 : UserId) : Bool {
    switch (friends.get(user1)) {
      case (?list) { list.contains(user2) };
      case (null) { false };
    };
  };

  // Helper function to check if a user is approved
  func isUserApproved(userId : UserId) : Bool {
    UserApproval.isApproved(approvalState, userId);
  };

  // --- Profile Management (Req. by instructions) ---

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    profiles.add(caller, profile);
  };

  // --- Additional Profile Management (Req. for compatibility) ---

  public shared ({ caller }) func createOrUpdateProfile(profile : Profile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to create or update a profile");
    };

    profiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(userId : UserId) : async ?Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    
    // Only return profile if user is approved (unless viewing own profile or admin)
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      if (not isUserApproved(userId)) {
        return null;
      };
    };
    
    profiles.get(userId);
  };

  public query ({ caller }) func getProfilesByGender(gender : Text) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };

    // Only return approved users' profiles
    profiles.entries().toArray().filter(
      func((userId, profile)) { 
        profile.gender == gender and (isUserApproved(userId) or AccessControl.isAdmin(accessControlState, caller))
      }
    ).map(func((_, profile)) { profile });
  };

  public query ({ caller }) func getProfilesByAgeRange(minAge : Nat, maxAge : Nat) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    
    // Only return approved users' profiles
    profiles.entries().toArray().filter(
      func((userId, profile)) { 
        profile.age >= minAge and profile.age <= maxAge and (isUserApproved(userId) or AccessControl.isAdmin(accessControlState, caller))
      }
    ).map(func((_, profile)) { profile });
  };

  // --- Friend Requests ---

  public shared ({ caller }) func sendFriendRequest(to : UserId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: User must be logged in to send friend requests");
    };

    if (caller == to) {
      Runtime.trap("Cannot add yourself as a friend");
    };
    if (not profiles.containsKey(to)) {
      Runtime.trap("Target user does not exist");
    };
    
    // Only allow sending friend requests to approved users
    if (not isUserApproved(to)) {
      Runtime.trap("Cannot send friend request to unapproved user");
    };

    let alreadyFriends = areFriends(caller, to);
    if (alreadyFriends) { Runtime.trap("Already friends") };

    // Check if a request already exists
    switch (friendRequests.get(to)) {
      case (?list) {
        if (list.contains(caller)) {
          Runtime.trap("Friend request already sent");
        };
      };
      case (null) {};
    };

    // Add the request
    let existing = switch (friendRequests.get(to)) {
      case (?list) { list };
      case (null) { List.empty<UserId>() };
    };
    existing.add(caller);
    friendRequests.add(to, existing);
  };

  public query ({ caller }) func getPendingFriendRequests() : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get friend requests");
    };
    switch (friendRequests.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func acceptFriendRequest(from : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };

    // Add friend request to completedFriendRequests list
    let newRequest : FriendRequest = {
      from;
      to = caller;
      status = #accepted;
      timestamp = Time.now();
    };
    completedFriendRequests.add(newRequest);

    // Remove request
    switch (friendRequests.get(caller)) {
      case (?list) {
        if (not (list.contains(from))) {
          Runtime.trap("No friend request from this user");
        };

        // Create a new list with from removed
        let filteredList = List.empty<UserId>();
        filteredList.addAll(list.values().filter(func(uid) { uid != from }));

        let changedToArray = filteredList.toArray();
        if (not (changedToArray.isEmpty())) {
          let newList = List.fromArray(changedToArray);
          friendRequests.add(caller, newList);
        } else {
          friendRequests.remove(caller);
        };
      };
      case (null) { Runtime.trap("No requests for this user with that principal") };
    };

    // Add to friend's list
    let addFriend = func(userId : UserId, friendId : UserId) {
      switch (friends.get(userId)) {
        case (?list) {
          list.add(friendId);
          if (list.toArray().isEmpty()) {
            friends.remove(userId);
          } else {
            friends.add(userId, list);
          };
        };
        case (null) {
          let newList = List.empty<UserId>();
          newList.add(friendId);
          friends.add(userId, newList);
        };
      };
    };

    addFriend(caller, from);
    addFriend(from, caller); // Ensure mutual
  };

  public shared ({ caller }) func declineFriendRequest(from : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline friend requests");
    };

    // Add friend request to completedFriendRequests list
    let newRequest : FriendRequest = {
      from;
      to = caller;
      status = #declined;
      timestamp = Time.now();
    };
    completedFriendRequests.add(newRequest);

    // Remove request
    switch (friendRequests.get(caller)) {
      case (?list) {
        if (not (list.contains(from))) {
          Runtime.trap("No friend request from this user");
        };

        // Create a new list with from removed
        let filteredList = List.empty<UserId>();
        filteredList.addAll(list.values().filter(func(uid) { uid != from }));

        let changedToArray = filteredList.toArray();
        if (not (changedToArray.isEmpty())) {
          let newList = List.fromArray(changedToArray);
          friendRequests.add(caller, newList);
        } else {
          friendRequests.remove(caller);
        };
      };
      case (null) { Runtime.trap("No requests for this user with that principal") };
    };
  };

  public query ({ caller }) func getFriends() : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch friends");
    };

    switch (friends.get(caller)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getUserFriends(user : Principal) : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friends");
    };

    switch (friends.get(user)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  // --- Messaging ---

  public shared ({ caller }) func sendMessage(to : UserId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages.");
    };

    // Check if they are friends
    if (not areFriends(caller, to)) {
      Runtime.trap("Cannot send message to non-friend");
    };

    let conversationId = caller.toText();
    let recipientId = to.toText();
    let convoKey = if (conversationId < recipientId) {
      conversationId.concat(recipientId);
    } else {
      recipientId.concat(conversationId);
    };

    let newMessage : Message = {
      from = caller;
      to;
      content;
      timestamp = Time.now();
    };

    switch (conversations.get(convoKey)) {
      case (?conversation) {
        let newMessages = conversation.messages.concat([newMessage]);
        let newConversation = {
          id = convoKey;
          participants = (caller, to);
          messages = newMessages;
        };
        conversations.add(convoKey, newConversation);
      };
      case (null) {
        let newConversation : Conversation = {
          id = convoKey;
          participants = (caller, to);
          messages = [newMessage];
        };
        conversations.add(convoKey, newConversation);
      };
    };
  };

  public query ({ caller }) func getConversation(other : UserId) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access conversations");
    };

    let conversationId = caller.toText();
    let recipientId = other.toText();
    let convoKey = if (conversationId < recipientId) {
      conversationId.concat(recipientId);
    } else {
      recipientId.concat(conversationId);
    };
    switch (conversations.get(convoKey)) {
      case (?conversation) {
        // Verify access by checking participants
        let (p1, p2) = conversation.participants;
        if (p1 != caller and p2 != caller) {
          Runtime.trap("Access denied: Not a participant of this conversation");
        };
        conversation.messages;
      };
      case (null) { [] };
    };
  };

  // --- Interest Matching/Filtering ---

  public query ({ caller }) func findUsersByInterest(interest : Text) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search by interest");
    };

    // Only return approved users' profiles
    profiles.entries().toArray().filter(
      func((userId, p)) {
        p.interests.values().contains(interest) and (isUserApproved(userId) or AccessControl.isAdmin(accessControlState, caller))
      }
    ).map(func((_, profile)) { profile }).sort();
  };

  public query ({ caller }) func getFriendSuggestions() : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get suggestions");
    };

    // Get current user interests
    let callerInterests = switch (profiles.get(caller)) {
      case (?p) { p.interests };
      case (null) { [] };
    };

    // Only suggest approved users
    profiles.entries().toArray().filter(
      func((userId, p)) {
        userId != caller and not areFriends(caller, userId) and isUserApproved(userId) and p.interests.any(
          func(i) {
            callerInterests.values().contains(i);
          }
        );
      }
    ).map(func((userId, _)) { userId });
  };

  // Search profiles by location (city)
  public query ({ caller }) func searchProfilesByLocation(city : Text) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search profiles by location");
    };

    // Only return approved users' profiles
    profiles.entries().toArray().filter(
      func((userId, profile)) { 
        profile.city == city and (isUserApproved(userId) or AccessControl.isAdmin(accessControlState, caller))
      }
    ).map(func((_, profile)) { profile });
  };

  // Search profiles with multiple interests
  public query ({ caller }) func searchProfilesByInterests(interests : [Text]) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search profiles by multiple interests");
    };

    // Only return approved users' profiles
    profiles.entries().toArray().filter(
      func((userId, profile)) {
        (isUserApproved(userId) or AccessControl.isAdmin(accessControlState, caller)) and profile.interests.values().any(
          func(interest) {
            interests.values().contains(interest);
          }
        );
      }
    ).map(func((_, profile)) { profile });
  };

  // Get friend count for a user
  public query ({ caller }) func getFriendCount(userId : UserId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this function");
    };
    
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view other users' friend counts");
    };

    switch (friends.get(userId)) {
      case (?list) { list.size() };
      case (null) { 0 };
    };
  };

  public shared ({ caller }) func removeFriend(friendId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User must be logged in to remove friends");
    };

    if (not profiles.containsKey(friendId)) {
      Runtime.trap("Friend not found.");
    };

    // Verify that they are actually friends before removing
    if (not areFriends(caller, friendId)) {
      Runtime.trap("Cannot remove user who is not your friend");
    };

    let removeFriendFromList = func(userId : UserId, targetFriendId : UserId) {
      switch (friends.get(userId)) {
        case (?list) {
          if (list.contains(targetFriendId)) {
            let filteredArray = list.toArray().filter(func(id) { id != targetFriendId });
            if (not (filteredArray.isEmpty())) {
              let newList = List.fromArray(filteredArray);
              friends.add(userId, newList);
            } else {
              friends.remove(userId);
            };
          };
        };
        case (null) {};
      };
    };

    // Remove friend from both users' lists
    removeFriendFromList(caller, friendId);
    removeFriendFromList(friendId, caller);
  };
};
