import mongoose from "mongoose";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String, required: true },
    experiences: [
      {
        role: { type: String },
        company: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
        area: { type: String },
        image: { type: String },
        createdAt: { type: Date },
        updatedAt: { type: Date },
      },
    ],
    educations: [
      {
        school: { type: String },
        degree: { type: String },
        field: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
        activity: { type: String },
        image: { type: String },
        description: { type: String },
        createdAt: { type: Date },
        updatedAt: { type: Date },
      },
    ],
    social: {
      friends: [{ type: String }],
      sent: [{ type: String }],
      pending: [{ type: String }],
    },
  },
  { strict: "throw" },
  { timestamps: true }
);

export default model("User", usersSchema);
