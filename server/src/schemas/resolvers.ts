import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
    Query: {
      getSingleUser: async (_: any, variables: { id?: string; username?: string }, req: any) => {
        const foundUser = await User.findOne({
          $or: [
            { _id: req.user ? req.user._id : variables.id },
            { username: req.user ? req.user.username : variables.username },
          ],
        });
        if (!foundUser) {
          throw new Error('Cannot find a user with this id!');
        }
        return foundUser;
      },
    },
    Mutation: {
      createUser: async (_: any, args: { username: string; password: string }) => {
        const user = await User.create(args);
        if (!user) {
          throw new Error('Something is wrong!');
        }
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
    },
};

export default resolvers;