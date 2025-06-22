import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { db } from "../../config";
import { desc, eq } from "drizzle-orm";

import { ItemListing } from "../../config/schema";
import { ItemImages } from "../../config/schema";

import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";

const UserListings = ({ user }) => {
  const [userListingList, setuserListingList] = useState([]);

  const getUserListings = async () => {
    const result = await db
      .select()
      .from(ItemListing)
      .leftJoin(ItemImages, eq(ItemListing.id, ItemImages.ItemListingId))
      .where(eq(ItemListing.postedBy, user.email))
      .orderBy(desc(ItemListing.id));

    const listingsMap = new Map();

    result.forEach(({ itemListing, itemImages }) => {
      if (!listingsMap.has(itemListing.id)) {
        listingsMap.set(itemListing.id, {
          ...itemListing,
          images: itemImages ? [itemImages.imageUrl] : [],
        });
      } else if (itemImages) {
        listingsMap.get(itemListing.id).images.push(itemImages.imageUrl);
      }
    });

    const listings = Array.from(listingsMap.values());
    setuserListingList(listings);

    console.log("Fetched Listings:", listings);
  };

  useEffect(() => {
    if (user?.email) {
      getUserListings();
    }
  }, [user]);

  const handleEdit = (id) => {
    window.location.href = `/add-listing?mode=edit&id=${id}`;
  };

  return (
    <div className="w-full flex flex-wrap gap-5">
      {userListingList.map((item) => {
        const imageUrl =
          item.images?.[0] && item.images[0].startsWith("http")
            ? item.images[0]
            : "https://placehold.co/240x160?text=No+Image";

        return (
          <Link key={item.id} to={`/product/${item.id}`}>
            <div className="w-[15rem] border-gray-600 border-2 bg-blue-500 text-sm rounded-lg hover:scale-[1.02] transition-all duration-200">
              <img
                className="pb-2 object-cover rounded-t-lg w-[15rem] h-[10rem]"
                src={`/product/${imageUrl}`}
                alt={item.productName}
                onError={(e) =>
                  (e.target.src =
                    "https://www.shaalaa.com/images/_4:99d93c3f0d564667896dbd389f698d91.png")
                }
              />
              <h3 className="pl-2 mx-3 border-b border-slate-200">
                {item.productName}
              </h3>
              <p className="pl-5 pt-2">&#8377;{item.sellingPrice}</p>
              <div className="flex text-3xl w-full justify-between pt-1">
                <MdOutlineEdit
                  onMouseDown={() => handleEdit(item.id)}
                  className="bg-yellow-500 w-[50%] rounded-bl-lg p-1 hover:bg-yellow-600"
                />
                <MdDeleteOutline className="bg-red-500 w-[50%] rounded-br-lg p-1 hover:bg-red-600" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default UserListings;
