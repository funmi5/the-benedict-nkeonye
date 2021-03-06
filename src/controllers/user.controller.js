import User from '../models/user.model';
import uploadSingleImage from '../utils.js/uploadSingleImg';

const UserController = {
  async createUser(req, res) {
    const { body, file } = req;
    const userData = body;
    if (file) {
      userData.avatar = await uploadSingleImage(file);
    }
    const user = new User(userData);
    try {
      await user.save();
      const token = await user.generateAuthToken();
      return res.status(201).json({
        message: 'Account created successfully',
        data: user,
        token,
      });
    } catch (error) {
      return res.send(error).status(400);
    }
  },

  async loginUser(req, res) {
    try {
      const user = await User.findByCredentials(
        req.body.email,
        req.body.password,
      );
      if (!user) {
        return res.send().status(400);
      }
      const token = await user.generateAuthToken();
      return res
        .json({
          message: 'Login successful',
          data: user,
          token,
        })
        .status(200);
    } catch (error) {
      return res.status(400).send(error);
    }
  },

  async logoutUser(req, res) {
    try {
      req.user.tokens = req.user.tokens.filter(
        (token) => token.token !== req.token,
      );
      await req.user.save();
      return res.status(200).send('Logout successful');
    } catch (error) {
      return res.send(error).status(500);
    }
  },

  async logoutUserAll(req, res) {
    try {
      req.user.tokens = [];
      await req.user.save();
      return res.status(200).send('Log out on all devices successful');
    } catch (error) {
      return res.send(error).status(500);
    }
  },

  async getUserProfile(req, res) {
    const { user } = req;
    try {
      return res
        .json({
          message: 'User profile retrieved successfully',
          data: user,
        })
        .status(200);
    } catch (error) {
      return res.send(error).status(404);
    }
  },

  async updateUserProfile(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'bio', 'email'];
    const isValidUpdatedOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidUpdatedOperation) {
      return res.status(400).json({
        message: 'Invalid update',
      });
    }
    try {
      // 1. Find the user about to be updated
      const { user, file } = req;
      // 2. Loop through the proposed updates & assign the values accordingly
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
      if (file) {
        user.avatar = await uploadSingleImage(file);
      }

      /**
       * 3. Call the save method on the document,
       * this then allows the middleware to deal with the record being updated as well
       *  */
      await user.save();
      return res.status(200).json({
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      return res.send(error).status(400);
    }
  },

  async resetPassword(req, res) {
    const { user } = req;
    try {
      user.password = req.body.password;
      await user.save();
      return res.status(200).json({
        message: 'Password updated successfully',
        data: user,
      });
    } catch (error) {
      return res.send(error).status(400);
    }
  },

  async deleteProfile(req, res) {
    try {
      await req.user.remove();
      return res.json({
        message: `Account with the email: ${req.user.email} deleted`,
      });
    } catch (error) {
      return res.send(error).status(500);
    }
  },
};

export default UserController;
