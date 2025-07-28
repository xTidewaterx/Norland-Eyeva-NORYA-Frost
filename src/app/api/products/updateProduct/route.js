import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    console.log("Received request at updateProduct.js");

    const { id, name, description, images, price } = await req.json();
    console.log("Parsed client request body:", { id, name, description, images, price });

    if (!id) {
      return Response.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Retrieve product from Stripe
    console.log("Retrieving product from Stripe...");
    const product = await stripe.products.retrieve(id);
    console.log("Fetched product:", product);

    // Update product metadata: name, description, images
    const updatedImages = [...images]; // Fully replacing existing images
    const productUpdatePayload = {
      name,
      description,
      images: updatedImages
    };

    // If price is provided, create new price object and update default_price
    let newPriceData = null;
    if (price) {
      newPriceData = await stripe.prices.create({
        unit_amount: price, // amount in cents
        currency: 'usd',
        product: id
      });

      // Attach new default price to the product update
      productUpdatePayload.default_price = newPriceData.id;
      console.log("New price created and linked:", newPriceData.id);
    }

    // Update product with new data
    const updatedProduct = await stripe.products.update(id, productUpdatePayload);
    console.log("Stripe updated product successfully in updateProduct.js:", updatedProduct);

    return Response.json({ updatedProduct, newPrice: newPriceData }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}