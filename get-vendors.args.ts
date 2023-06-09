import { Field, ArgsType, Int } from "type-graphql";

@ArgsType()
export class GetVendorsArgs {
  @Field(() => Int, { defaultValue: 100 })
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  offset: number;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  categoryID?: string;

  @Field()
  organisationID: string;
}
