import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

// https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types
const productWithPrice = Prisma.validator<Prisma.StripeProductDefaultArgs>()({
  include: { price: true },
});

export type StripeProductWithPrice = Prisma.StripeProductGetPayload<
  typeof productWithPrice
>;

export type StripeProductsWithPrice = Prisma.PromiseReturnType<
  typeof useProducts
>;

const useProducts = async () => {
  const productWhere: Prisma.StripeProductWhereInput = {
    productLive: true,
  };
  const productInclude: Prisma.StripeProductInclude = {
    price: true,
  };

  const products: StripeProductWithPrice[] =
    await prisma.stripeProduct.findMany({
      where: productWhere,
      include: productInclude,
    });

  return products.sort((a, b) =>
    a.price.priceGBP > b.price.priceGBP ? 1 : -1
  );
};

export default useProducts;
