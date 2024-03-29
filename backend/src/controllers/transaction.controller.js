import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, wallet, category, date } = req.body;
  const user = req.user;

  if (!title) throw new ApiError(400, "Title is required");
  if (!amount) throw new ApiError(400, "Amount is required");
  if (!wallet) throw new ApiError(400, "Wallet is required");

  if (amount > user.currentBalance && wallet === "Cash") {
    throw new ApiError(
      400,
      "You don't have enough balance to make this transaction"
    );
  }

  const receiptLocalPath = req?.file?.path;

  const receipt = await uploadOnCloudinary(receiptLocalPath);

  const transaction = await Transaction.create({
    madeBy: user._id,
    type: "Expense",
    title,
    receipt: receipt?.url || "",
    amount,
    wallet,
    category: category || "",
    date: date || "",
  });

  const transactionHistory = user.transactionHistory || [];

  let updateQuery = {
    transactionHistory: [...transactionHistory, transaction._id],
  };

  // Check if the wallet is set to "Cash"
  if (wallet === "Cash") {
    updateQuery.$inc = { currentBalance: -amount }; // Decrement the current balance
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updateQuery, {
    new: true,
  }).select("-password -refreshToken");

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

export const getTransactions = asyncHandler(async (req, res) => {
  const userTransactions = req.user.transactionHistory;

  if (!userTransactions || userTransactions.length === 0)
    throw new ApiError(404, "User doesn't have any goals");

  const transactions = await Transaction.find({
    _id: { $in: userTransactions },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { transactions }, "Goals sent successfully"));
});

export const createIncome = asyncHandler(async (req, res) => {
  const { title, amount, category, date } = req.body;
  const user = req.user;

  if (!title) throw new ApiError(400, "Title is required");
  if (!amount) throw new ApiError(400, "Amount is required");
  if (amount < 1) throw new ApiError(400, "Amount can't be less than 1");

  const receiptLocalPath = req?.file?.path;

  const receipt = await uploadOnCloudinary(receiptLocalPath);

  const transaction = await Transaction.create({
    madeBy: user._id,
    type: "Income",
    title,
    receipt: receipt?.url || "",
    amount,
    wallet: "Cash",
    category: category || "",
    date: date || "",
  });

  const transactionHistory = user.transactionHistory || [];

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      transactionHistory: [...transactionHistory, transaction._id],
      $inc: { currentBalance: +amount }, // Increment the current balance
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
