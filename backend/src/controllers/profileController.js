import Couple from "../models/Couple.js"; // Upar imports me hona chahiye
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Buffer is missing."));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
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
  try {
    const user = req.user;

    // // console.log("REQ FILES:", req.files);

    // Avatar Upload
    if (req.files?.avatar?.length) {
      const avatarFile = req.files.avatar[0];

      if (!avatarFile.buffer) {
        return res.status(400).json({
          success: false,
          message: "Avatar buffer not found.",
        });
      }

      user.avatar = await uploadToCloudinary(
        avatarFile.buffer,
        "PrincessVerse/Profile"
      );
    }

    // Cover Upload
    if (req.files?.coverPhoto?.length) {
      const coverFile = req.files.coverPhoto[0];

      if (!coverFile.buffer) {
        return res.status(400).json({
          success: false,
          message: "Cover buffer not found.",
        });
      }

      user.coverPhoto = await uploadToCloudinary(
        coverFile.buffer,
        "PrincessVerse/Cover"
      );
    }

    await user.save();

    res.json({
      success: true,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
    });
  } catch (err) {
    console.error("PROFILE IMAGE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}