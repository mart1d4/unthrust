import User from "../../../utils/models/User";
import Conversation from "../../../utils/models/Conversation";
import connectDB from "../../../utils/connectDB";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const userID = slug[0];

    // Bad request
    if (slug[3]) {
        return res.status(400).json({ error: "Bad request" });
    }

    if (slug[1] === "channels") {
        const user = await User.findById(userID);
        const friends = await User.find({ _id: { $in: user.friends } });

        const friendsClean = friends.map((friend) => {
            return {
                _id: friend._id,
                username: friend.username,
                avatar: friend.avatar,
                status: friend.status,
                customStatus: friend.customStatus,
            };
        });
        return res.status(200).json(friendsClean);
    }

    if (slug[1] === "conversation") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: userID } } },
                        { participants: { $elemMatch: { $eq: friendID } } },
                    ],
                },
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: friendID } } },
                        { participants: { $elemMatch: { $eq: userID } } },
                    ],
                },
            ],
        });

        if (conversation) {
            return res.status(200).json(conversation);
        } else {
            return res.status(200).json({ error: "No conversation found" });
        }
    }

    if (slug[1] === "addfriend") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const friend = await User.findById(friendID);
        const user = await User.findById(userID);

        if (friendID === userID) {
            return res.status(200).json({ error: "Cannot add yourself" });
        }

        // Check if request has already been sent
        if (friend.friendRequests.includes(userID)) {
            return res.status(200).json({ error: "Request already sent" });
        }

        // Check if user already has friend
        if (friend.friends.includes(userID)) {
            return res
                .status(200)
                .json({ error: "User is already your friend" });
        }

        friend.friendRequests.push(userID);
        user.friendRequestsSent.push(friendID);

        await friend.save();
        await user.save();

        return res.status(200).json({ success: "Friend request sent" });
    }

    if (slug[1] === "friendrequests") {
        if (slug[2] === "received") {
            const user = await User.findById(userID);
            const friendRequests = await User.find({
                _id: { $in: user.friendRequests },
            });

            const friendRequestsClean = friendRequests.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });

            return res.status(200).json(friendRequestsClean);
        } else if (slug[2] === "sent") {
            const user = await User.findById(userID);
            const friendRequestsSent = await User.find({
                _id: { $in: user.friendRequestsSent },
            });

            const friendRequestsSentClean = friendRequestsSent.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });

            return res.status(200).json(friendRequestsSentClean);
        } else {
            return res.status(400).json({ error: "Bad request" });
        }
    }

    if (slug[1] === "acceptrequest") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const friend = await User.findById(friendID);
        const user = await User.findById(userID);

        friend.friends.push(userID);
        user.friends.push(friendID);

        friend.friendRequestsSent = friend.friendRequestsSent.filter(
            (request) => {
                const id = request.toString();
                return id !== userID;
            }
        );
        user.friendRequests = user.friendRequests.filter((request) => {
            const id = request.toString();
            return id !== friendID;
        });

        await friend.save();
        await user.save();

        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: userID } } },
                        { participants: { $elemMatch: { $eq: friendID } } },
                    ],
                },
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: friendID } } },
                        { participants: { $elemMatch: { $eq: userID } } },
                    ],
                },
            ],
        });

        if (conversation) {
            return res.status(200).json({ success: "Friend request accepted" });
        }

        const newConversation = new Conversation({
            participants: [userID, friendID],
        });

        await newConversation.save();

        return res.status(200).json({ success: "Friend request accepted" });
    }

    if (slug[1] === "declinerequest") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const friend = await User.findById(friendID);
        const user = await User.findById(userID);

        friend.friendRequestsSent = friend.friendRequestsSent.filter(
            (request) => {
                const id = request.toString();
                return id !== userID;
            }
        );
        user.friendRequests = user.friendRequests.filter((request) => {
            const id = request.toString();
            return id !== friendID;
        });

        await friend.save();
        await user.save();

        return res.status(200).json({ success: "Friend request declined" });
    }

    if (slug[1] === "cancelrequest") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const friend = await User.findById(friendID);
        const user = await User.findById(userID);

        friend.friendRequests = friend.friendRequests.filter((request) => {
            const id = request.toString();
            return id !== userID;
        });
        user.friendRequestsSent = user.friendRequestsSent.filter((request) => {
            const id = request.toString();
            return id !== friendID;
        });

        await friend.save();
        await user.save();

        return res.status(200).json({ success: "Friend request cancelled" });
    }

    if (slug[1] === "removefriend") {
        const userID = req.body.userID;
        const friendID = slug[0];

        const friend = await User.findById(friendID);
        const user = await User.findById(userID);

        friend.friends = friend.friends.filter((friend) => {
            const id = friend.toString();
            return id !== userID;
        });
        user.friends = user.friends.filter((friend) => {
            const id = friend.toString();
            return id !== friendID;
        });

        await friend.save();
        await user.save();

        return res.status(200).json({ success: "Friend removed" });
    }

    if (slug[1] === "send") {
        const userID = req.body.userID;
        const friendID = slug[0];
        const message = req.body.message;

        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: userID } } },
                        { participants: { $elemMatch: { $eq: friendID } } },
                    ],
                },
                {
                    $and: [
                        { participants: { $elemMatch: { $eq: friendID } } },
                        { participants: { $elemMatch: { $eq: userID } } },
                    ],
                },
            ],
        });

        if (conversation) {
            const newMessage = {
                sender: userID,
                content: message,
            };

            conversation.messages.push(newMessage);

            await conversation.save();

            return res.status(200).json({ message: "Message sent" });
        } else {
            return res.status(200).json({ error: "No conversation found" });
        }
    }
};
