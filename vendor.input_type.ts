import { InputType, Field, Float } from "type-graphql";

@InputType()
export default class AddVendorInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  id: string;

  @Field()
  slug: string;

  @Field()
  contact_number: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  previewUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  type?: string;

  @Field(() => [String], { nullable: "itemsAndList", defaultValue: [] })
  categoryIDs: string[];

  @Field()
  description: string;

  @Field({ nullable: true })
  tagline?: string;

  @Field((type)=> Float, { nullable: true })
  longitude?: number;

  @Field((type)=> Float, { nullable: true })
  latitude?: number;
  
  @Field({ nullable: true })
  promotion?: string;

  @Field()
  pincode: string;

  @Field()
  address: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  organisationID: string;

  @Field({ nullable: true }) 
  published: Boolean;

  // Not in mongo as of now
  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  slogan?: string;

  @Field(() => [String], { nullable: "itemsAndList" })
  owners?: string[];
}
