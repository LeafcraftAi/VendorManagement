import { Schema, model } from "mongoose";
import { Float } from "type-graphql";

/**
 * @author Leaf Craft Pvt Ltd. <help@leafcraftstudios.com>
 * @description Mongo schema for Vendor
 */
const VendorSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  slug: {
    type: String,
    required: true
  },

  previewUrl: {
    type: String,
    required: false
  },

  contact_number: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  thumbnailUrl: {
    type: String,
    required: false
  },

  type: {
    type: String,
    required: false
  },

  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category"
    }
  ],

  description: {
    type: String,
    required: true
  },

  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "OrderedProduct"
    }
  ],

  tagline: {
    type: String,
    required: false
  },

  // longitude: {
  //   type: Number,
  //   required: false
  // },

  // latitude: {
  //   type: Number,
  //   required: false
  // },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },

  promotion: {
    type: String,
    required: false
  },

  pincode: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product"
    }
  ],

  createdAt: {
    type: Date,
    required: true
  },

  updatedAt: {
    type: Date,
    required: true
  },

  published: {
    type: Boolean,
    required: true,
    default: false
  },

  organisation: {
    type: Schema.Types.ObjectId,
    ref: "Organisation",
    required: true
  }
});

export const Vendor = model("Vendor", VendorSchema);
