import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, wallet, category, date } = req.body;
  const user = req.user;

  if (!title) throw new ApiError(400, "Title is required");
  if (!amount) throw new ApiError(400, "Amount is required");
  if (!wallet) throw new ApiError(400, "Wallet is required");

  const receiptLocalPath = req.file.path;

  const receipt = await uploadOnCloudinary(receiptLocalPath);

  const transaction = await Transaction.create({
    madeBy: user._id,
    title,
    receipt: receipt?.url || "",
    amount,
    wallet,
    // category: category || "",
    date: date || "",
  });

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      transactionHistory: [...transactionHistory, transaction._id],
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!updatedUser)
    throw new ApiError(
      500,
      "Something went wrong while creating the transaction"
    );

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        "Created transaction successfully"
      )
    );
});