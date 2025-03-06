import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';

interface Context {
  user?: { _id: string };
}

const resolvers = {
    Query: {
      me: async (_: any, __: any, context: Context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new Error('You need to be logged in!');
      },
      getSingleUser: async (_: any, args: { id?: string; username?: string }, context: Context) => {
        const foundUser = await User.findOne({
          $or: [
            { _id: context.user ? context.user._id : args.id },
            { username: args.username },
          ],
        });
        if (!foundUser) {
          throw new AuthenticationError('Cannot find a user with this id!');
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
      login: async (_: any, args: { username: string; password: string }) => {
        const user = await User.findOne({ username: args.username });
        if (!user || !(await user.isCorrectPassword(args.password))) {
          throw new AuthenticationError('Incorrect credentials');
        }
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
      saveBook: async (_: any, args: { bookId: string; title: string }, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );
      },
      removeBook: async (_: any, args: { bookId: string }, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
        return await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
      },
    },
};

export default resolvers;