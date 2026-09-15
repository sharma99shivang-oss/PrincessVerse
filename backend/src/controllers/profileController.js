import Couple from "../models/Couple.js"; // Upar imports me hona chahiye
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

export async function updateProfile(req, res) {
  // ❤️ Partner Permission Check
  if (req.user.role === "PARTNER") {
    const couple = await Couple.findById(req.user.coupleId);

    ```
if (!couple?.permissions?.canEditOwnProfile) {
  return res.status(403).json({
    success: false,
    message: "Your partner has disabled profile editing.",
  });
}
```

  }

  const allowed = [
    "name",
    "bio",
    "avatar",
    "favoriteColor",
    "coverPhoto",
    "nickname",
    "relationshipQuote",
    "birthday",
    "instagramUsername",
    "loveLanguage",
    "location",
    "favoriteSong",
    "favoriteFood",
  ];

  allowed.forEach((key) => {
    if (req.body[key] !== undefined && req.body[key] !== "") {
      req.user[key] = req.body[key];
    }
  });

  await req.user.save();

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      mobileNumber: req.user.mobileNumber,
      role: req.user.role,
      coupleId: req.user.coupleId,
      avatar: req.user.avatar,
      bio: req.user.bio,
      favoriteColor: req.user.favoriteColor,
      coverPhoto: req.user.coverPhoto,
      nickname: req.user.nickname,
      relationshipQuote: req.user.relationshipQuote,
      birthday: req.user.birthday,
      instagramUsername: req.user.instagramUsername,
      loveLanguage: req.user.loveLanguage,
      location: req.user.location,
      favoriteSong: req.user.favoriteSong,
      favoriteFood: req.user.favoriteFood,
      joinedAt: req.user.joinedAt,
    },
  });
}

export async function uploadProfileImages(req, res) {
  const user = req.user;

  if (req.files?.avatar?.[0]) {
    user.avatar = await uploadToCloudinary(
      req.files.avatar[0].buffer,
      "PrincessVerse/Profile"
    );
  }

  if (req.files?.coverPhoto?.[0]) {
    user.coverPhoto = await uploadToCloudinary(
      req.files.coverPhoto[0].buffer,
      "PrincessVerse/Cover"
    );
  }

  await user.save();

  res.json({
    success: true,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
  });
}