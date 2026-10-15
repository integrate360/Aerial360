const asyncHandler = require("express-async-handler");
const User = require("../model/UserM");
const bcrypt = require("bcrypt");
const genrateToken = require("../utils/genrateToken");
const AWS = require("aws-sdk");
const { generatePassword, generateOtp } = require("../utils/Functions");
const admin = require("../config/firebaseConfig");
const { uploadImage } = require("../helper/fileUploadeService");
// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

const sendPushNotification = async (req, res) => {
  try {
    // Get the user from the database based on user ID
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { deviceToken } = user; // Get deviceToken from the user

    // Check if the device token exists
    if (!deviceToken) {
      return res.status(400).json({ message: "Device token is missing" });
    }

    // Define the logo URL (use the absolute URL of your logo image)
    const logoUrl =
      "https://airboundfitnessnew.s3.ap-south-1.amazonaws.com/airboundfitness/1736425167169-ASS.png";

    // Create message payload
    const message = {
      notification: {
        title: "New Notification",
        body: req.body.message, // Message from the request body
        imageUrl: logoUrl, // Include logo image in the notification
      },
      token: deviceToken, // Use the user's stored device token
    };

    // Send notification
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    res
      .status(200)
      .json({ message: "Notification sent successfully", response });
  } catch (error) {
    console.error("Error sending message:", error.message || error);
    if (
      error.code === "messaging/mismatched-credential" ||
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      await User.findByIdAndUpdate(req.params.userId, { $unset: { deviceToken: 1 } });
    }
    res.status(500).json({ message: "Error sending notification", error: error.message || error });
  }
};

const saveDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user;
    if (!userId || !deviceToken) {
      return res
        .status(400)
        .json({ message: "userId and deviceToken are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { deviceToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Device token saved successfully",
      user,
    });
  } catch (error) {
    console.error("Error saving device token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeDeviceToken = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { deviceToken: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Device token removed successfully",
      user,
    });
  } catch (error) {
    console.error("Error removing device token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const register = asyncHandler(async (req, res) => {
  let {
    email,
    password,
    phone,
    name,
    deviceToken,
    confirmPassword,
    emergencyPhone,
    medicalcondition,
  } = req.body;

  let imgUrl = "";

  // Force email to lowercase + trim
  email = email?.toLowerCase().trim();

  // Force name to trim
  name = name?.trim();

  // -------------------------
  // Validation
  // -------------------------
  let isValid = true;
  const errors = {};

  // name (fullname)
  if (!name) {
    isValid = false;
    errors.name = "Full Name is required";
  } else if (name.length < 3) {
    isValid = false;
    errors.name = "Full Name must be at least 3 characters";
  }

  // email
  if (!email) {
    isValid = false;
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    isValid = false;
    errors.email = "Enter a valid email";
  }

  // phone
  if (!phone || !String(phone).trim()) {
    isValid = false;
    errors.phone = "Phone Number is required";
  } else if (!/^\d{10}$/.test(String(phone).trim())) {
    isValid = false;
    errors.phone = "Phone Number must be 10 digits";
  }

  // password
  if (!password || !String(password).trim()) {
    isValid = false;
    errors.password = "Password is required";
  } else if (String(password).trim().length < 6) {
    isValid = false;
    errors.password = "Password must be at least 6 characters";
  }

  // confirmPassword
  if (typeof confirmPassword !== "undefined") {
    if (password !== confirmPassword) {
      isValid = false;
      errors.confirmPassword = "Passwords do not match";
    }
  }

  // medical condition
  // if (!medicalcondition || !String(medicalcondition).trim()) {
  //   isValid = false;
  //   errors.medicalcondition = "Medical condition is required";
  // }

  if (!medicalcondition) {
  medicalcondition = "";
}

  if (!isValid) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // -------------------------
  // Image upload
  // -------------------------
  if (req.file) {
    try {
      imgUrl = await uploadImage(req.file);
    } catch (err) {
      console.error("Image upload failed:", err);
      return res.status(500).json({ message: "Image upload failed" });
    }
  }

  // -------------------------
  // Check if user already exists
  // -------------------------
  // Case-insensitive email lookup
  const existingUserByEmail = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

  if (existingUserByEmail) {
    return res
      .status(400)
      .json({ message: "User already exists with this email" });
  }

  const existingUserByPhone = await User.findOne({ phone });
  if (existingUserByPhone) {
    return res
      .status(400)
      .json({ message: "User already exists with this phone number" });
  }


  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (force email lowercase)
    const newUser = new User({
      ...req.body,
      name,
      email, // already lowercase + trimmed
      phone,
      deviceToken,
      password: hashedPassword,
      image: imgUrl,
      emergencyPhone: emergencyPhone || "",
      medicalcondition,
    });

    await newUser.save();

    const token = genrateToken(newUser._id);
    newUser.token = token;
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        deviceToken: newUser.deviceToken,
      },
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    if (error && error.code === 11000) {
      const dupKey = Object.keys(error.keyValue || {})[0];
      let message = "Duplicate key error. Please try again.";
      if (dupKey === "email") message = "This email is already registered.";
      if (dupKey === "phone")
        message = "This phone number is already registered.";
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: "Server error during registration" });
  }
});

// const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     // Check if email and password are provided
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "No user found with this email" });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Generate token and set cookie
//     const token = genrateToken(user._id);
//     res.cookie("token", token, {
//       httpOnly: true,
//       maxAge: 72 * 60 * 60 * 1000, // 72 hours
//     });

//     // Optional: Store token in user object
//     user.token = token;
//     await user.save();

//     // Return success response
//     res.status(200).json({
//       message: "Login successful",
//       user,
//       token,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// });

const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  email = email?.trim(); // do NOT lowercase for regex matching

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Case-insensitive email search
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = genrateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    user.token = token;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      deviceToken: user.deviceToken,
      emergencyPhone: user.emergencyPhone,
      medicalCondition: user.medicalCondition,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      __v: user.__v,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// const register = asyncHandler(async (req, res) => {
//   const { email, password, phone, name, deviceToken } = req.body;

//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.status(400).json({ message: "User already exists with this email" });
//   }

//   try {
//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       phone,
//       deviceToken,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     // Generate token
//     const token = genrateToken(newUser._id); // Ensure the function name is correct
//     newUser.token = token; // Set token on newUser object

//     // Optionally, save the user again if the token is to be stored
//     await newUser.save();

//     // Return successful response with user and token
//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         phone: newUser.phone,
//         deviceToken: newUser.deviceToken,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     res.status(500).json({ message: "Server error during registration" });
//   }
// });

// const generatePasswordController = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   const password = generatePassword();
//   try {
//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     existingUser.password = hashedPassword;
//     await existingUser.save();

//     // Generate token
//     const msg = {
//       to: email,
//       from: "airboundfitness@gmail.com",
//       subject: "Password Genrated",
//       text: `Your Password is genrated, simply enter this ${password} to login to your existing account`,
//       html: `<p>Your Password is genrated, simply enter this <b>${password}</b> to login to your existing account</p>`,
//     };

//     await sgMail.send(msg);
//     const token = genrateToken(existingUser._id); // Ensure function name is correct
//     existingUser.token = token; // Set token on existingUser object
//     await existingUser.save();
//     res.status(200).json(existingUser); // Use 201 for successful resource creation
//   } catch (error) {
//     res.status(201).json({ message: error.message }); // 500 for server errors
//   }
// });

// const genrateForgotOtp = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user)
//       return res
//         .status(201)
//         .json({ message: "user not found with this email" });
//     const otp = generateOtp();
//     user.otp = otp;
//     await user.save();
//     const msg = {
//       to: req.body.email,
//       from: "airboundfitness@gmail.com",
//       subject: "Otp Verfication For Forgot Password",
//       text: `<p>Your Forgot Password Otp is genrated, simply enter this <b>${otp}</b> to verify your account than you can change your Password</p>`,
//       html: `<p>Your Forgot Password Otp is genrated, simply enter this <b>${otp}</b> to verify your account than you can change your Password</p>`,
//     };

//     await ses.sendEmail(params).promise();
//     res
//       .status(200)
//       .json({ message: "Otp sent successfully to your email", user });
//   } catch (error) {
//     console.log(error?.message);
//     res.status(500).json({ error: error.message });
//   }
// };

const genrateForgotOtp = asyncHandler(async (req, res) => {
  let { email } = req.body;
  email = email?.trim();
  try {
    // Correct way to use regex for case-insensitive email search
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Generate OTP and save to user
    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    // SES params
    const params = {
      Source: "Airbound Fitness <airboundfitness@airbound.in>", // verified email
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: "OTP Verification for Forgot Password",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `Your Forgot Password OTP is: ${otp}\nEnter this OTP to verify your account and reset your password.`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `<p>Your Forgot Password OTP is: <b>${otp}</b></p>
                   <p>Enter this OTP to verify your account and reset your password.</p>`,
            Charset: "UTF-8",
          },
        },
      },
    };

    // Send OTP email via SES
    await ses.sendEmail(params).promise();

    res.status(200).json({
      message: "OTP sent successfully to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("SES email error:", error);
    res.status(500).json({ error: error.message });
  }
});
const forgotPassword = async (req, res) => {
  let { password, email, otp } = req.body;
  email = email?.trim();
  // Check if user already exists
  const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });
  if (!existingUser)
    return res.status(404).json({ message: "user not found with this email" });
  if (existingUser.otp != otp)
    return res.status(404).json({ message: "OTP validation failed" });

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    existingUser.password = hashedPassword;
    await existingUser.save();

    // Generate token
    const token = genrateToken(existingUser._id); // Ensure function name is correct
    existingUser.token = token; // Set token on existingUser object
    await existingUser.save();

    res.status(200).json(existingUser); // Use 201 for successful resource creation
  } catch (error) {
    res.status(201).json({ message: error.message }); // 500 for server errors
  }
};
const changePassword = asyncHandler(async (req, res) => {
  const { password, newPassword, email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  const verifyPassword = await bcrypt.compare(password, existingUser.password);
  if (!verifyPassword)
    return res.status(303).json({ message: "Wrong Credentials" });
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Create new user
    existingUser.password = hashedPassword;
    await existingUser.save();

    // Generate token
    const token = genrateToken(existingUser._id); // Ensure function name is correct
    existingUser.token = token; // Set token on existingUser object
    await existingUser.save();

    res.status(200).json(existingUser); // Use 201 for successful resource creation
  } catch (error) {
    res.status(201).json({ message: error.message }); // 500 for server errors
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    res.send({ message: "Logged Out" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

const generatePasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check user
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const newPassword = generatePassword();

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    existingUser.password = hashedPassword;
    await existingUser.save();

    // SES params
    const params = {
      Source: "Airbound Fitness <airboundfitness@airbound.in>", // must be verified in SES
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Password Reset", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `Hello,\n\nYour new password is: ${newPassword}\n\nPlease change it after logging in.`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `<p>Hello,</p>
                   <p>Your new password is: <b>${newPassword}</b></p>
                   <p>Please change it after logging in.</p>`,
            Charset: "UTF-8",
          },
        },
      },
    };

    // Send email
    await ses.sendEmail(params).promise();

    // Optionally generate token
    const token = genrateToken(existingUser._id);

    res.status(200).json({
      message: "Password reset successfully. Check your email.",
      token,
    });
  } catch (error) {
    console.error("SES email error:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
});

// Reset Password - set new password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the user by reset token and check if token is valid
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllUsersforadmin = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;     // page number
    const limit = Number(req.query.limit) || 10;  // records per page
    const search = req.query.search || "";        // search text

    // Search filter (name, email, phone)
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password -otp -token") // hide sensitive fields
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

const getMe = asyncHandler(async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
const getUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { email, phone } = req.body;

    if (email) {
      email = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        _id: { $ne: id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use by another user" });
      }
      req.body.email = email;
    }

    if (phone) {
      phone = phone.trim();
      const existingUserByPhone = await User.findOne({
        phone,
        _id: { $ne: id },
      });
      if (existingUserByPhone) {
        return res.status(400).json({ message: "Phone number already in use by another user" });
      }
      req.body.phone = phone;
    }

    let imgUrl = "";
    if (req.file) {
      try {
        imgUrl = await uploadImage(req.file);
      } catch (err) {
        console.error("Image upload failed:", err);
        throw new Error("Image upload failed");
      }
    }

    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (req.file) {
      user.image = imgUrl;
    }
    await user.save();
    if (!user) return res.status(400).json({ message: "User Not Found" });
    res.status(200).json({ message: "User Updated Successfully", user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error?.message });
  }
};
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.send({ message: "User removed" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
const totalUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ totalUsers: users.length });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

const updateUseradmin = asyncHandler(async (req, res) => {
  try {
    console.log("===== UPDATE USER ADMIN API HIT =====");
    console.log("User ID:", req.params.id);
    console.log("Request Body:", req.body);

    const { id } = req.params;

    const allowedFields = [
      "name",
      "email",
      "phone",
      "image",
      "deviceToken",
      "emergencyPhone",
      "medicalCondition",
      "password",
    ];

    const data = {};

    // Only copy allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });

    console.log("Filtered Update Data:", data);

    // ✅ Check if email is already in use by another user
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
      const existingUserByEmail = await User.findOne({
        email: { $regex: new RegExp(`^${data.email}$`, "i") },
        _id: { $ne: id },
      });

      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another user",
        });
      }
    }

    // ✅ Check if phone is already in use by another user
    if (data.phone) {
      data.phone = data.phone.trim();
      const existingUserByPhone = await User.findOne({
        phone: data.phone,
        _id: { $ne: id },
      });

      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already in use by another user",
        });
      }
    }

    // ✅ Hash password if provided
    if (data.password) {
      console.log("Password update requested...");
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      console.log("Password hashed successfully");
    }

    console.log("Updating user in DB...");

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.log("❌ User not found:", id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User updated successfully:", updatedUser._id);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

    console.log("===== UPDATE USER ADMIN API SUCCESS =====");
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
});




module.exports = {
  sendPushNotification,
  saveDeviceToken,
  login,
  getAllUsers,
  getAllUsersforadmin,
  resetPassword,
  generatePasswordController,
  totalUsers,
  deleteUser,
  getUser,
  logout,
  register,
  updateUser,
  changePassword,
  genrateForgotOtp,
  forgotPassword,
  removeDeviceToken,
  updateUseradmin,
  getMe,
};
