import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import PostsModel from "./model.js";
import UsersModel from "../users/model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const postsRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "posts/image" },
  }),
}).single("image");

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { posts, total } = await PostsModel.findpostsWithUsers(mongoQuery);
    res.send({
      links: mongoQuery.links(process.env.BE_URL + "/posts", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.id).populate({
      path: "comments user",
      select: "comment user name surname",
    });
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/", async (req, res, next) => {
  try {
    const postToAdd = {
      ...req.body,
      image:"",
    };
    const newPost = new PostsModel(postToAdd);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedPost = await PostsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(createHttpError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedPost = await PostsModel.findByIdAndDelete(req.params.id);
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(createError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/:postId/likes/:userId", async (req, res, next) => {
  try {
    const postToLike = await PostsModel.findById(req.params.postId);
    if (!postToLike)
      return next(
        createHttpError(
          404,
          `Post with the id: ${req.params.postId} not found.`
        )
      );

    const userAboutLike = await UsersModel.findById(req.params.userId);
    if (!userAboutLike)
      return next(
        createHttpError(
          404,
          `User with the id: ${req.params.userId} not found.`
        )
      );

    const isLikedYet = postToLike.likes.includes(req.params.userId);

    if (isLikedYet) {
      const letsDislike = await PostsModel.findByIdAndUpdate(
        { _id: req.params.postId },
        { $pull: { likes: req.params.userId } },
        { new: true, runValidators: true }
      );
      res.send({ LikeLength: letsDislike.likes.length, Liked: false });
    } else {
      const letsLike = await PostsModel.findByIdAndUpdate(
        { _id: req.params.postId },
        { $push: { likes: req.params.userId } },
        { new: true, runValidators: true }
      );
      res.send({ LikeLength: letsLike.likes.length, Liked: true });
    }
  } catch (error) {
    next(error);
  }
});

// ************************ IMAGE ************************

postsRouter.post(
  "/:postId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const updatedPost = await PostsModel.findByIdAndUpdate(
        req.params.postId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send(updatedPost);
      } else {
        next(createError(404, `Post with id ${req.params.postId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default postsRouter;
