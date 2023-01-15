import User from "../../models/User";
import mongoose from "mongoose";

const requestFriend = async (userIDUnclean, friendIDUnclean) => {
    if (!userIDUnclean || !friendIDUnclean) return { error: "Missing parameters" };

    if (userIDUnclean === friendIDUnclean) return { error: "You can't be friends with yourself" };

    if (
        !mongoose.Types.ObjectId.isValid(userIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(friendIDUnclean)
    ) return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);
    const friendID = mongoose.Types.ObjectId(friendIDUnclean);

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) return { error: "User not found" };

    if (user.friends.includes(friendID)) return { error: "You are already friends" };

    const requestSent = user.friendRequests.filter((request) => request.type === "sent");
    const requestReceived = user.friendRequests.filter((request) => request.type === "received");

    if (
        requestSent.map((request) => request.user.toString()).includes(friendID.toString())
    ) return { error: "You have already sent a friend request to this user" };

    if (
        requestReceived.map((request) => request.user.toString()).includes(friendID.toString())
    ) {
        // Accept friend request
        user.friends.push(friendID);
        friend.friends.push(userID);

        user.friendRequests = user.friendRequests.filter((request) => request.user.toString() !== friendID.toString());
        friend.friendRequests = friend.friendRequests.filter((request) => request.user.toString() !== userID.toString());

        await user.save();
        await friend.save();

        return {
            success: "Friend request accepted",
            user: {
                _id: friend._id,
                username: friend.username,
                avatar: friend.avatar,
                description: friend.description,
                customStatus: friend.customStatus,
                status: friend.status,
                createdAt: friend.createdAt,
            },
        };
    }

    // Send friend request
    user.friendRequests.push({ type: "sent", user: friendID });
    friend.friendRequests.push({ type: "received", user: userID });

    await user.save();
    await friend.save();

    return {
        success: "Friend request sent",
        request: {
            type: "sent",
            user: {
                _id: friend._id,
                username: friend.username,
                avatar: friend.avatar,
            },
        },
    };
};

export default requestFriend;
