import User from "../models/user.model.js";

// Lấy thông tin tất cả người dùng
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng" });
  }
};

// GET /api/users/all
export const getAllUsersExceptMe = async (req, res) => {
  try {
    const myId = req.user.id; // Lấy ID từ middleware xác thực JWT

    const users = await User.find({ _id: { $ne: myId } })
      .sort({ createdAt: -1 })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách người dùng", error });
  }
};

// Tìm người dùng theo ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tìm người dùng" });
  }
};

// Tạo mới người dùng
export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: "Không thể tạo người dùng" });
  }
};
