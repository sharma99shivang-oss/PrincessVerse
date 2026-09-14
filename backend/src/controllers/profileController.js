import Couple from "../models/Couple.js"; // Upar imports me hona chahiye

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
  if (req.files?.avatar?.[0]) {
    req.user.avatar = `/uploads/profile/${req.files.avatar[0].filename}`;
  }

  if (req.files?.coverPhoto?.[0]) {
    req.user.coverPhoto = `/uploads/profile/${req.files.coverPhoto[0].filename}`;
  }

  await req.user.save();

  res.json({
    success: true,
    avatar: req.user.avatar,
    coverPhoto: req.user.coverPhoto,
  });
}