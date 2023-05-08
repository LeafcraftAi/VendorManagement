import { Resolver, Query, Mutation, Arg, Args } from "type-graphql";
import Vendor from "../vendor/vendor.type";
import { Vendors } from "./vendors.type";
import { GetVendorsArgs } from "./get-vendors.args";
import search from "../../helpers/search";
import { Vendor as VendorMongo } from "../../../models/Vendor";
import { Organisation as OrganisationMongo } from "../../../models/Organisation";
import { Category as CategoryMongo } from "../../../models/Category";
import AddVendorInput from "./vendor.input_type";
import { ObjectID } from "mongodb";

@Resolver()
export default class VendorResolver {
  private readonly vendorCollection: Vendor[]; // = vendorSamples;

  @Query(() => Vendors, { description: "Get all the vendors" })
  async vendors(
    @Args()
    { offset, limit, text, type, categoryID, organisationID }: GetVendorsArgs,
    @Arg("isAdmin", (type) => Boolean) isAdmin: boolean
  ): Promise<Vendors | undefined> {
    let organisation = await OrganisationMongo.findById(organisationID).catch(
      (err: any) => {
        throw new Error("Error in finding the organisation : " + err);
      }
    );

    let category: any = null;
    if (categoryID) {
      category = await CategoryMongo.findById(categoryID).catch((err: any) => {
        throw new Error("Error in finding category : " + err);
      });
    }

    let jsonBody = {
      organisation: new ObjectID(organisationID),
      ...(category ? { category: new ObjectID(categoryID) } : {}),
      ...(isAdmin ? {} : { published: true }),
    };

    let vendors;
    if (text) {
      vendors = await VendorMongo.aggregate([
        {
          $search: {
            index: "BYOB-Vendor-Search",
            autocomplete: { query: text, path: "name" },
          },
        },
        {
          $match: jsonBody,
        },
        {
          $lookup: {
            from: "organisations",
            localField: "organisation",
            foreignField: "_id",
            as: "organisation",
          },
        },
        { $addFields: { organisation: { $first: "$organisation" } } },
      ]);
    } else {
      vendors = await VendorMongo.aggregate([
        {
          $match: jsonBody,
        },
        {
          $lookup: {
            from: "organisations",
            localField: "organisation",
            foreignField: "_id",
            as: "organisation",
          },
        },
        { $addFields: { organisation: { $first: "$organisation" } } },
      ]);
    }

    const total = vendors.length;
    const hasMore = vendors.length > offset + limit;

    return {
      items: vendors.slice(offset, offset + limit),
      totalCount: total,
      hasMore,
    };
  }

  @Query(() => Vendor)
  async vendor(
    @Arg("slug", (type) => String) slug: string,
    @Arg("vendorID", (type) => String, { nullable: true }) vendorID?: string
  ): Promise<Vendor | undefined> {
    let vendor: any = null;
    if (vendorID) {
      vendor = await VendorMongo.findById(vendorID).catch((err: any) => {
        throw new Error("Error in finding vendor : " + err);
      });
    } else if (slug) {
      vendor = await VendorMongo.findOne({ slug: slug }).catch((err: any) => {
        throw new Error("Error in finding vendor : " + err);
      });
    }

    return vendor;
  }

  @Mutation(() => Vendor)
  async vendorVisibility(
    @Arg("vendorID", (type) => String) vendorID: string,
    @Arg("published", (type) => Boolean) published: boolean
  ): Promise<Vendor | undefined> {
    let vendor = await VendorMongo.findByIdAndUpdate(
      vendorID,
      { published: published },
      { new: true }
    ).catch((err: any) => {
      throw new Error("Error in publishing : " + err);
    });
    return vendor;
  }

  @Mutation(() => Vendor)
  async addVendor(
    @Arg("vendorInput", (type) => AddVendorInput) vendorInput: AddVendorInput
  ): Promise<Vendor | undefined> {
    let organisation = await OrganisationMongo.findById(
      vendorInput.organisationID
    ).catch((err: any) => {
      throw new Error("Error in finding the organisation : " + err);
    });
    let vendor;
    if (vendorInput.id) {
      vendor = await VendorMongo.findById(vendorInput.id).catch((err: any) => {
        throw new Error("Error in finding the organisation : " + err);
      });
    }
    let categories = [];

    if (vendorInput.categoryIDs) {
      // If belongs to categories
      for (let i = 0; i < vendorInput.categoryIDs.length; ++i) {
        let category = await CategoryMongo.findById(
          vendorInput.categoryIDs[i]
        ).catch((err: any) => {
          throw new Error("Error in finding category : " + err);
        });
        categories.push(category);
      }
    }
    let coordinates = [];
    console.log(vendorInput.longitude, vendorInput.latitude);
    if (vendorInput.longitude && vendorInput.latitude) {
      coordinates.push(Number(vendorInput.longitude));
      coordinates.push(Number(vendorInput.latitude));
    }
    let location_point = { type: "Point", coordinates: coordinates };

    let jsonBody = {
      name: vendorInput.name,
      slug: vendorInput.slug,
      contact_number: vendorInput.contact_number,
      email: vendorInput.email,
      ...(vendorInput.previewUrl ? { previewUrl: vendorInput.previewUrl } : {}),
      ...(vendorInput.thumbnailUrl
        ? { thumbnailUrl: vendorInput.thumbnailUrl }
        : {}),
      type: vendorInput.type,
      ...(categories.length ? { categories: categories } : {}),
      description: vendorInput.description,
      ...(vendorInput.tagline ? { tagline: vendorInput.tagline } : {}),
      ...(vendorInput.longitude && vendorInput.latitude
        ? { location: location_point }
        : {}),
      ...(vendorInput.promotion ? { promotion: vendorInput.promotion } : {}),
      pincode: vendorInput.pincode,
      address: vendorInput.address,
      createdAt: vendorInput.createdAt,
      updatedAt: vendorInput.updatedAt,
      organisation: organisation,
      published: vendorInput.published,
      ...(location_point ? { location: location_point } : {}),
    };
    let newVendor: any;
    newVendor = new VendorMongo(jsonBody);
    await newVendor.save().catch((err: any) => {
      throw new Error("Error in new vendor : " + err);
    });
    // }

    return newVendor;
  }

  @Mutation(() => Vendor, { description: "Update Vendor" })
  async updateVendor(
    @Arg("vendorInput", (type) => AddVendorInput)
    vendorInput: AddVendorInput
  ): Promise<Vendor> {
    let organisation = await OrganisationMongo.findById(
      vendorInput.organisationID
    ).catch((err: any) => {
      throw new Error("Error in finding the organisation : " + err);
    });
    if (!vendorInput.id) throw new Error("VendorID not provided!");

    let checkVendor = await VendorMongo.findById(vendorInput.id);
    if (!checkVendor) throw new Error("Vendor not found!");

    let categories = [];

    if (vendorInput.categoryIDs) {
      // If belongs to categories
      for (let i = 0; i < vendorInput.categoryIDs.length; ++i) {
        let category = await CategoryMongo.findById(
          vendorInput.categoryIDs[i]
        ).catch((err: any) => {
          throw new Error("Error in finding category : " + err);
        });
        categories.push(category);
        console.log(categories, "Catergories Details in update");
      }
    }
    const coordinates = [];
    console.log(vendorInput.longitude, vendorInput.latitude);
    if (vendorInput.longitude && vendorInput.latitude) {
      coordinates.push(Number(vendorInput.longitude));
      coordinates.push(Number(vendorInput.latitude));
    }
    const location_point = { type: "Point", coordinates: coordinates };

    let jsonBody = {
      name: vendorInput.name,
      slug: vendorInput.slug,
      contact_number: vendorInput.contact_number,
      email: vendorInput.email,
      ...(vendorInput.previewUrl ? { previewUrl: vendorInput.previewUrl } : {}),
      ...(vendorInput.thumbnailUrl
        ? { thumbnailUrl: vendorInput.thumbnailUrl }
        : {}),
      type: vendorInput.type,
      ...(categories.length ? { categories: categories } : {}),
      description: vendorInput.description,
      ...(vendorInput.tagline ? { tagline: vendorInput.tagline } : {}),
      // ...(vendorInput.longitude ? { longitude: vendorInput.longitude } : {}),
      // ...(vendorInput.latitude ? { latitude: vendorInput.latitude } : {}),
      ...(vendorInput.longitude && vendorInput.latitude
        ? { location: location_point }
        : {}),
      ...(vendorInput.promotion ? { promotion: vendorInput.promotion } : {}),
      pincode: vendorInput.pincode,
      address: vendorInput.address,
      createdAt: vendorInput.createdAt,
      updatedAt: vendorInput.updatedAt,
      organisation: organisation,
      published: vendorInput.published,
    };
    console.log(jsonBody, "vendorInput");

    let updatedVendor = await VendorMongo.findByIdAndUpdate(
      vendorInput.id,
      jsonBody,
      { new: true }
    ).catch((err: any) => {
      throw new Error("Error while updating vendor : " + err);
    });

    console.log(updatedVendor, "updated vendor details");

    return updatedVendor;
  }

  @Mutation(() => Vendor, { description: "Delete Vendor from database" })
  async deleteVendorById(@Arg("vendorID") vendorID: string): Promise<Vendor> {
    let Vendor = await VendorMongo.findByIdAndDelete(vendorID).catch(
      (err: any) => {
        throw new Error("Error in deleting the Vendor : " + err);
      }
    );
    return Vendor;
  }
}
