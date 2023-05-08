import { ObjectType, Field, ID, Float } from "type-graphql";
import Category from "../category/category.type";
import OrderedProduct from "../order/ordered_product.type";
import Product from "../product/product.type";
import Organisation from "../organisation/organisation.type";
import Location from "../product/location.type";

@ObjectType()
export default class Vendor {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  slug: string;

  @Field({ nullable: true })
  contact_number: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  previewUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  type?: string;

  @Field(() => [Category])
  categories: Category[];

  @Field()
  description: string;

  @Field({ nullable: true })
  tagline?: string;

  @Field(() => Location, { nullable: true })
  location: Location;

  @Field(() => [OrderedProduct], { nullable: true })
  orders: OrderedProduct[];

  @Field({ nullable: true })
  promotion?: string;

  @Field()
  pincode: string;

  @Field()
  address: string;

  @Field(() => [Product], { nullable: true })
  products?: Product[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  published: Boolean;

  @Field(() => Organisation)
  organisation: Organisation;

  // Not in mongo as of now
  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  slogan?: string;

  @Field(() => [String], { nullable: true })
  owners?: string[];
}
