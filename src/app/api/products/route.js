import Stripe from "stripe";
import { NextResponse } from "next/server";






const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await stripe.products.retrieve(id);
      const price = await stripe.prices.retrieve(product.default_price);

      return NextResponse.json({
        ...product,
        price: price.unit_amount / 100,
      });
    }

    console.log('Fetching all Stripe products...');

    const products = await stripe.products.list({ limit: 4 });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        let price = null;
        if (product.default_price) {
          const priceData = await stripe.prices.retrieve(product.default_price);
          price = priceData.unit_amount / 100;
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          price,
        };
      })
    );

    return NextResponse.json({ data: productsWithPrices });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}








//this is our upload new product code, on our postProduct new product, this is the code on our next.js post endpoint route
export async function POST(req) {
    try {
        const { name, description, price, images } = await req.json(); // Parse JSON body
        
        if (!name || !price) {
            return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
        }
        console.log("Creating product, testing:", { name, description, price, images });

        // Step 1: Create the product in Stripe
        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
try {
    // Step 2: Create the price associated with the product
    const priceData = await stripe.prices.create({
        unit_amount: price, // Amount in smallest currency unit (e.g., cents)
        currency: 'usd',
        product: product.id, // Link the price to the product
    });
    console.log('Price created successfully:', priceData);
} catch (error) {
    console.error('Error creating price:', error.message || error);
}


    //step 3::
      // Step 3: Update the product to set the default price
        const updatedProduct = await stripe.products.update(product.id, {
            default_price: priceData.id, // Set default price
      
        });



        console.log(updatedProduct, "price", priceData)


        return NextResponse.json({ product: updatedProduct, price: priceData });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}















export async function PATCH(req) {
  try {
    const { id, images, price } = await req.json();
    console.log("PATCH request:", { id, images, price });

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Optional: Update images if provided
    const updatedFields = {};
    if (images) updatedFields.images = images;

    // If price is present, create a new price object and update default_price
    let newPriceData = null;
    if (price) {
      newPriceData = await stripe.prices.create({
        unit_amount: price,
        currency: 'usd',
        product: id,
      });

      // Assign new default_price to product
      updatedFields.default_price = newPriceData.id;
    }

    const updatedProduct = await stripe.products.update(id, updatedFields);

    return NextResponse.json({ updatedProduct, newPrice: newPriceData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}