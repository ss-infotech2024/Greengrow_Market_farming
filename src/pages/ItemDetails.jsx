import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { db } from "../../config";
import { eq } from "drizzle-orm";

import { ItemListing, ItemImages } from "../../config/schema";

import { Carousel } from "@material-tailwind/react";

const ItemDetails = () => {
  const { id } = useParams();

  const [userListingList, setUserListingList] = useState(null);
  const [itemImagesList, setItemImagesList] = useState([]);

  const IMAGE_BASE_URL = "http://localhost:5000"; // Update if needed

  const getListing = async () => {
    try {
      const result = await db
        .select()
        .from(ItemListing)
        .leftJoin(ItemImages, eq(ItemListing.id, ItemImages.ItemListingId))
        .where(eq(ItemListing.id, id));

      const listingsMap = new Map();

      result.forEach(({ itemListing, itemImages }) => {
        if (!itemListing) return;

        if (!listingsMap.has(itemListing.id)) {
          listingsMap.set(itemListing.id, {
            ...itemListing,
            images:
              itemImages && itemImages.imageUrl
                ? [itemImages.imageUrl.trim()]
                : [],
          });
        } else if (itemImages && itemImages.imageUrl) {
          listingsMap
            .get(itemListing.id)
            .images.push(itemImages.imageUrl.trim());
        }
      });

      const listings = Array.from(listingsMap.values());

      if (listings.length > 0) {
        setUserListingList(listings[0]);
        setItemImagesList(listings[0].images);
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
    }
  };

  useEffect(() => {
    getListing();
  }, [id]);

  if (!userListingList) {
    return (
      <div className="text-center mt-10 text-xl">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-bold text-3xl ml-[8rem] mt-5">Product Details</h1>

      <div className="flex">
        <Carousel className="ml-[8rem] w-[50vw] h-[60vh] bg-black mt-3">
          {itemImagesList.length > 0 ? (
            itemImagesList.map((image, index) => (
              <img
                key={index}
                src={
                  image.startsWith("http") ? image : `${IMAGE_BASE_URL}${image}`
                }
                alt={`item-${index}`}
                className="h-full object-cover mx-auto"
                onError={(e) => {
                  console.warn("Image failed to load:", e.target.src);
                  e.target.src =
                    "https://www.shaalaa.com/images/_4:99d93c3f0d564667896dbd389f698d91.png";
                }}
              />
            ))
          ) : (
            <img
              src="https://www.shaalaa.com/images/_4:99d93c3f0d564667896dbd389f698d91.png"
              alt="default"
              className="h-full object-cover mx-auto"
            />
          )}
        </Carousel>

        <div className="pt-5 mt-3 w-[30rem] bg-gray-100">
          <h2 className="pl-[3rem] text-2xl border-b-2 border-black pb-3">
            {userListingList.productName}
          </h2>

          <div className="flex justify-between">
            <h2 className="pl-[3rem] text-3xl pb-3 pt-3">
              ₹{userListingList.sellingPrice}
            </h2>
            <button className="w-[8rem] h-[2.5rem] mt-3 mr-10 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-150 ease-in-out">
              Make an offer
            </button>
          </div>

          <div className="flex gap-3 justify-center mt-2 mb-3">
            <div className="bg-yellow-500 rounded-full w-[40%] h-7 flex justify-center items-center">
              {userListingList.category}
            </div>
            <div className="bg-red-500 rounded-full w-[40%] h-7 flex justify-center items-center">
              {userListingList.condition}
            </div>
          </div>

          <p className="pl-[3rem] text-base pb-3 pt-3 pr-3">
            {userListingList.description}
          </p>

          <div className="absolute flex justify-between w-[30rem] bottom-40 pl-[3rem] text-sm border-t-2 border-black pb-3">
            <div className="pt-3">
              <h5>Seller: {userListingList.postedBy}</h5>
              <h5>Created On: {userListingList.postedDate}</h5>
            </div>
            <Link to={`/chat/${userListingList.postedBy}`}>
              <button className="w-[10rem] h-[2.5rem] mt-3 mr-10 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-150 ease-in-out">
                Chat with seller
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
